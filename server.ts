import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw Object.assign(
      new Error('GEMINI_API_KEY is not configured on the server. Add it in Settings > Secrets.'),
      { status: 500, code: 'MISSING_API_KEY' }
    );
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function normalizeAndValidateUrl(rawUrl: string): URL {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    throw Object.assign(new Error('Please enter a website URL to audit.'), {
      status: 400,
      code: 'INVALID_URL',
    });
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw Object.assign(
      new Error('That URL does not look valid. Example: https://yourcompany.com'),
      { status: 400, code: 'INVALID_URL' }
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw Object.assign(new Error('Only http:// and https:// website URLs are supported.'), {
      status: 400,
      code: 'INVALID_URL',
    });
  }

  const host = parsed.hostname.toLowerCase();
  if (
    !host.includes('.') ||
    host === 'localhost' ||
    host.endsWith('.local') ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0)/.test(host)
  ) {
    throw Object.assign(
      new Error('Please enter a valid public domain name (for example, example.com).'),
      { status: 400, code: 'INVALID_URL' }
    );
  }

  return parsed;
}

interface ProbeResult {
  reachable: boolean;
  https: boolean;
  title?: string;
  hasMetaDescription?: boolean;
  hasViewport?: boolean;
  hasLangAttr?: boolean;
  responseTimeMs?: number;
}

async function probeWebsiteSignals(targetUrl: URL): Promise<ProbeResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DigitalAuditPulse/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    const responseTimeMs = Date.now() - start;
    const html = (await res.text()).slice(0, 65000);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i
    );
    const viewportMatch = /<meta[^>]+name=["']viewport["']/i.test(html);
    const langMatch = /<html[^>]+lang=["'][^"']+["']/i.test(html);

    return {
      reachable: res.ok || res.status < 500,
      https: res.url.startsWith('https://') || targetUrl.protocol === 'https:',
      title: titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim().slice(0, 120) : undefined,
      hasMetaDescription: Boolean(metaDescMatch && metaDescMatch[1].trim().length > 0),
      hasViewport: viewportMatch,
      hasLangAttr: langMatch,
      responseTimeMs,
    };
  } catch {
    return {
      reachable: false,
      https: targetUrl.protocol === 'https:',
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes('503') ||
        msg.includes('502') ||
        msg.includes('500') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('429');
      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 700 * Math.pow(2, attempt)));
    }
  }
  throw lastErr;
}

function mapGeminiError(err: unknown): { status: number; message: string; code: string } {
  const anyErr = err as { status?: number; code?: string; message?: string };
  if (anyErr?.status === 400 && anyErr?.code === 'INVALID_URL') {
    return { status: 400, message: anyErr.message || 'Invalid URL.', code: 'INVALID_URL' };
  }
  if (anyErr?.code === 'MISSING_API_KEY') {
    return { status: 500, message: anyErr.message || 'Missing API key.', code: 'MISSING_API_KEY' };
  }
  const msg = anyErr?.message || 'Unable to complete the AI audit right now.';
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message: 'Gemini API authentication failed. Please check the API key in Settings > Secrets.',
      code: 'API_AUTH_ERROR',
    };
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Rate limit reached for the AI service. Please wait a few seconds and retry.',
      code: 'RATE_LIMITED',
    };
  }
  return {
    status: 502,
    message: 'The AI analysis service encountered a temporary issue. Please try again.',
    code: 'AI_SERVICE_ERROR',
  };
}

function deriveStatus(score: number): 'Critical' | 'Needs Attention' | 'Healthy' {
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'Needs Attention';
  return 'Critical';
}

const AUDIT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: 'Overall digital health Pulse Score from 0 to 100.',
    },
    executiveSummary: {
      type: Type.STRING,
      description: 'Concise 2-3 sentence executive summary tailored to the business and main goal.',
    },
    categories: {
      type: Type.ARRAY,
      description: 'Exactly 6 category evaluations matching the 6 required categoryIds.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description:
              'Must be one of: performance, seo, social, security, content, accessibility',
          },
          name: { type: Type.STRING },
          score: { type: Type.INTEGER, description: '0 to 100' },
          summary: {
            type: Type.STRING,
            description: 'Sharp 1-line summary (under 15 words).',
          },
          highlights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 concise bullet observations for this pillar.',
          },
        },
        required: ['id', 'name', 'score', 'summary', 'highlights'],
      },
    },
    findings: {
      type: Type.ARRAY,
      description: '12 specific findings (2 per category) with plain-English explanations and fixes.',
      items: {
        type: Type.OBJECT,
        properties: {
          categoryId: {
            type: Type.STRING,
            description: 'One of: performance, seo, social, security, content, accessibility',
          },
          title: { type: Type.STRING },
          severity: {
            type: Type.STRING,
            description: 'One of: High, Medium, Low',
          },
          explanation: {
            type: Type.STRING,
            description: 'Plain-English explanation of why this issue matters for the business goal.',
          },
          recommendation: {
            type: Type.STRING,
            description: 'Concrete, actionable step to fix the issue.',
          },
        },
        required: ['categoryId', 'title', 'severity', 'explanation', 'recommendation'],
      },
    },
    actionPlan: {
      type: Type.ARRAY,
      description: 'Top 5 quick wins ranked 1 to 5 by Impact vs Effort.',
      items: {
        type: Type.OBJECT,
        properties: {
          rank: { type: Type.INTEGER },
          title: { type: Type.STRING },
          categoryId: {
            type: Type.STRING,
            description: 'One of: performance, seo, social, security, content, accessibility',
          },
          categoryName: { type: Type.STRING },
          impact: { type: Type.STRING, description: 'High, Medium, or Low' },
          effort: { type: Type.STRING, description: 'Low, Medium, or High' },
          description: { type: Type.STRING },
          actionSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 concrete implementation steps.',
          },
          estimatedLift: {
            type: Type.STRING,
            description: 'Example: "+6 to +9 pts in SEO"',
          },
        },
        required: [
          'rank',
          'title',
          'categoryId',
          'categoryName',
          'impact',
          'effort',
          'description',
          'actionSteps',
          'estimatedLift',
        ],
      },
    },
  },
  required: ['overallScore', 'executiveSummary', 'categories', 'findings', 'actionPlan'],
};

const COMPARE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    competitorName: { type: Type.STRING },
    overallScore: { type: Type.INTEGER },
    summary: { type: Type.STRING },
    categories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          score: { type: Type.INTEGER },
        },
        required: ['id', 'name', 'score'],
      },
    },
    keyTakeaways: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 concise comparative insights.',
    },
  },
  required: ['competitorName', 'overallScore', 'summary', 'categories', 'keyTakeaways'],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/audit', async (req, res) => {
    try {
      const { url, businessName, industry, mainGoal } = req.body || {};
      const parsedUrl = normalizeAndValidateUrl(url);
      const cleanBusiness =
        typeof businessName === 'string' && businessName.trim()
          ? businessName.trim()
          : parsedUrl.hostname;
      const cleanIndustry =
        typeof industry === 'string' && industry.trim() ? industry.trim() : 'General Business';
      const cleanGoal =
        typeof mainGoal === 'string' && mainGoal.trim() ? mainGoal.trim() : 'More Leads';

      const signals = await probeWebsiteSignals(parsedUrl);
      const ai = getGeminiClient();

      const prompt = `Perform a structured, realistic Digital Audit Pulse assessment for the following business.

Business Name: ${cleanBusiness}
Website URL: ${parsedUrl.toString()}
Industry: ${cleanIndustry}
Primary Goal: ${cleanGoal}

Observed Live Probe Signals:
${JSON.stringify(signals, null, 2)}

Requirements:
1. Evaluate all 6 exact categories with IDs:
   - "performance" ("Website Performance")
   - "seo" ("SEO")
   - "social" ("Social Media Presence")
   - "security" ("Security & Privacy")
   - "content" ("Content & Brand Consistency")
   - "accessibility" ("Accessibility")
2. Use realistic, well-calibrated scores between 35 and 92 based on the observed signals, industry norms, and URL structure (do not inflate every score to 90+). Compute overallScore as a balanced weighted average of the 6 category scores aligned with the primary goal "${cleanGoal}".
3. Keep category summary strictly under 15 words.
4. Provide 12 specific findings (2 per category) written in clear, jargon-free English, tailored to ${cleanBusiness} (${cleanIndustry}) and its goal of ${cleanGoal}.
5. Provide a Priority Action Plan of the top 5 quick wins ranked 1 to 5 by highest Impact vs lowest Effort.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a senior digital strategy, web performance, SEO, security, and accessibility auditor. Return strictly valid JSON matching the schema. Be transparent, practical, and specific to the business industry and goal.',
            responseMimeType: 'application/json',
            responseSchema: AUDIT_RESPONSE_SCHEMA,
          },
        })
      );

      const rawText = response.text?.trim();
      if (!rawText) {
        throw new Error('Empty response from Gemini API.');
      }

      const parsed = JSON.parse(rawText);

      const requiredCategories = [
        { id: 'performance', name: 'Website Performance' },
        { id: 'seo', name: 'SEO' },
        { id: 'social', name: 'Social Media Presence' },
        { id: 'security', name: 'Security & Privacy' },
        { id: 'content', name: 'Content & Brand Consistency' },
        { id: 'accessibility', name: 'Accessibility' },
      ];

      const catMap = new Map<string, any>();
      for (const c of Array.isArray(parsed.categories) ? parsed.categories : []) {
        catMap.set(String(c.id).toLowerCase(), c);
      }

      const normalizedCategories = requiredCategories.map((reqCat) => {
        const found = catMap.get(reqCat.id);
        const clampedScore = Math.max(0, Math.min(100, Math.round(Number(found?.score ?? 65))));
        return {
          id: reqCat.id,
          name: reqCat.name,
          score: clampedScore,
          status: deriveStatus(clampedScore),
          summary: found?.summary || `Baseline ${reqCat.name.toLowerCase()} evaluation completed.`,
          highlights: Array.isArray(found?.highlights) ? found.highlights.slice(0, 3) : [],
        };
      });

      const computedAvg = Math.round(
        normalizedCategories.reduce((sum, c) => sum + c.score, 0) / normalizedCategories.length
      );
      const overallScore = Math.max(
        0,
        Math.min(100, Math.round(Number(parsed.overallScore ?? computedAvg)))
      );

      const normalizedFindings = (Array.isArray(parsed.findings) ? parsed.findings : []).map(
        (f: any, idx: number) => ({
          id: `finding-${Date.now()}-${idx}`,
          categoryId: requiredCategories.some((c) => c.id === f.categoryId)
            ? f.categoryId
            : 'performance',
          title: f.title || 'Optimization Opportunity',
          severity: ['High', 'Medium', 'Low'].includes(f.severity) ? f.severity : 'Medium',
          explanation: f.explanation || '',
          recommendation: f.recommendation || '',
        })
      );

      const normalizedActionPlan = (Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [])
        .slice(0, 5)
        .map((q: any, idx: number) => {
          const catMatch = requiredCategories.find((c) => c.id === q.categoryId);
          return {
            id: `qw-${Date.now()}-${idx}`,
            rank: idx + 1,
            title: q.title || `Priority Action ${idx + 1}`,
            categoryId: catMatch ? catMatch.id : 'seo',
            categoryName: catMatch ? catMatch.name : q.categoryName || 'SEO',
            impact: ['High', 'Medium', 'Low'].includes(q.impact) ? q.impact : 'High',
            effort: ['Low', 'Medium', 'High'].includes(q.effort) ? q.effort : 'Low',
            description: q.description || '',
            actionSteps: Array.isArray(q.actionSteps) ? q.actionSteps.slice(0, 4) : [],
            estimatedLift: q.estimatedLift || '+5 to +8 pts',
          };
        });

      const result = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        isDemo: false,
        input: {
          url: parsedUrl.toString(),
          businessName: cleanBusiness,
          industry: cleanIndustry,
          mainGoal: cleanGoal,
        },
        overallScore,
        executiveSummary:
          parsed.executiveSummary ||
          `Estimated digital audit completed for ${cleanBusiness}. Review the category scores and top 5 quick wins below.`,
        observedSignals: signals,
        categories: normalizedCategories,
        findings: normalizedFindings,
        actionPlan: normalizedActionPlan,
      };

      res.json(result);
    } catch (err) {
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message, code: mapped.code });
    }
  });

  app.post('/api/compare', async (req, res) => {
    try {
      const { competitorUrl, industry, mainGoal, primaryBusinessName, primaryScore } =
        req.body || {};
      const parsedCompetitorUrl = normalizeAndValidateUrl(competitorUrl);
      const signals = await probeWebsiteSignals(parsedCompetitorUrl);
      const ai = getGeminiClient();

      const prompt = `Estimate a competitive digital health benchmark for a competitor website so the user can compare side-by-side against ${primaryBusinessName || 'their business'} (current Pulse Score: ${primaryScore ?? 'N/A'}).

Competitor URL: ${parsedCompetitorUrl.toString()}
Industry: ${industry || 'General Business'}
Comparison Goal Context: ${mainGoal || 'More Leads'}
Observed Signals: ${JSON.stringify(signals)}

Return realistic scores (0-100) for all 6 category IDs (performance, seo, social, security, content, accessibility), an overallScore, a short 2-sentence competitive summary, and 3 concrete takeaways explaining where the competitor leads or trails.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a digital competitive intelligence analyst. Provide realistic, balanced comparative estimates in strict JSON matching the schema.',
            responseMimeType: 'application/json',
            responseSchema: COMPARE_RESPONSE_SCHEMA,
          },
        })
      );

      const rawText = response.text?.trim();
      if (!rawText) {
        throw new Error('Empty response from Gemini API.');
      }
      const parsed = JSON.parse(rawText);

      const requiredCategories = [
        { id: 'performance', name: 'Website Performance' },
        { id: 'seo', name: 'SEO' },
        { id: 'social', name: 'Social Media Presence' },
        { id: 'security', name: 'Security & Privacy' },
        { id: 'content', name: 'Content & Brand Consistency' },
        { id: 'accessibility', name: 'Accessibility' },
      ];

      const catMap = new Map<string, any>();
      for (const c of Array.isArray(parsed.categories) ? parsed.categories : []) {
        catMap.set(String(c.id).toLowerCase(), c);
      }

      const normalizedCategories = requiredCategories.map((reqCat) => {
        const found = catMap.get(reqCat.id);
        return {
          id: reqCat.id,
          name: reqCat.name,
          score: Math.max(0, Math.min(100, Math.round(Number(found?.score ?? 70)))),
        };
      });

      res.json({
        competitorUrl: parsedCompetitorUrl.toString(),
        competitorName: parsed.competitorName || parsedCompetitorUrl.hostname,
        overallScore: Math.max(0, Math.min(100, Math.round(Number(parsed.overallScore ?? 70)))),
        summary: parsed.summary || '',
        categories: normalizedCategories,
        keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways.slice(0, 3) : [],
      });
    } catch (err) {
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message, code: mapped.code });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { auditContext, messages, question } = req.body || {};
      if (!question || typeof question !== 'string' || !question.trim()) {
        res.status(400).json({ error: 'Please enter a question.', code: 'EMPTY_QUESTION' });
        return;
      }

      const ai = getGeminiClient();

      const historySummary = Array.isArray(messages)
        ? messages
            .slice(-8)
            .map((m: { role: string; content: string }) =>
              `${m.role === 'user' ? 'User' : 'Advisor'}: ${m.content}`
            )
            .join('\n')
        : '';

      const systemInstruction = `You are the Digital Audit Pulse AI Advisor. You answer follow-up questions about the user's digital health audit in clear, practical, encouraging, plain English.
Reference their actual scores, findings, and quick wins from the audit context below whenever relevant. Keep responses focused, well-structured (short paragraphs or bullet points), and under 220 words unless they ask for a detailed step-by-step plan. Remind them gently if needed that audit estimates are AI-assisted guidance.

CURRENT AUDIT CONTEXT:
${JSON.stringify(
  {
    business: auditContext?.input,
    overallScore: auditContext?.overallScore,
    executiveSummary: auditContext?.executiveSummary,
    categories: auditContext?.categories?.map((c: any) => ({
      name: c.name,
      score: c.score,
      status: c.status,
      summary: c.summary,
    })),
    topFindings: auditContext?.findings?.slice(0, 8)?.map((f: any) => ({
      categoryId: f.categoryId,
      severity: f.severity,
      title: f.title,
      recommendation: f.recommendation,
    })),
    quickWins: auditContext?.actionPlan?.map((q: any) => ({
      rank: q.rank,
      title: q.title,
      impact: q.impact,
      effort: q.effort,
    })),
  },
  null,
  2
)}`;

      const contents = historySummary
        ? `Previous conversation:\n${historySummary}\n\nNew user question: ${question.trim()}`
        : question.trim();

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: {
            systemInstruction,
          },
        })
      );

      res.json({
        reply: response.text?.trim() || 'I could not generate a response. Please try asking again.',
      });
    } catch (err) {
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message, code: mapped.code });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digital Audit Pulse server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
