import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  ExternalLink,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import { ActionPlan } from './components/ActionPlan';
import { CategoryCard } from './components/CategoryCard';
import { ChatAssistant } from './components/ChatAssistant';
import { CompetitorComparison } from './components/CompetitorComparison';
import { FindingsPanel } from './components/FindingsPanel';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { PrintableReport } from './components/PrintableReport';
import { PulseLoader } from './components/PulseLoader';
import { RadarComparisonChart } from './components/RadarComparisonChart';
import { ScoreGauge } from './components/ScoreGauge';
import { TrendChart } from './components/TrendChart';
import { DEMO_AUDIT_CURRENT, DEMO_HISTORY } from './data/demoAudit';
import type {
  AuditInput,
  AuditResult,
  CategoryId,
  CompetitorComparisonData,
} from './types/audit';

const HISTORY_STORAGE_KEY = 'dap_audit_history_v1';
const THEME_STORAGE_KEY = 'dap_theme_v1';
const COMPLETED_WINS_KEY = 'dap_completed_wins_v1';

function loadStoredHistory(): AuditResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadCompletedWins(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(COMPLETED_WINS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) return saved === 'dark';
    } catch {
      // ignore storage errors
    }
    return false;
  });

  const [history, setHistory] = useState<AuditResult[]>(loadStoredHistory);
  const [activeAudit, setActiveAudit] = useState<AuditResult | null>(null);
  const [lastInput, setLastInput] = useState<AuditInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [competitor, setCompetitor] = useState<CompetitorComparisonData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [completedWinsMap, setCompletedWinsMap] =
    useState<Record<string, string[]>>(loadCompletedWins);

  const findingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPLETED_WINS_KEY, JSON.stringify(completedWinsMap));
    } catch {
      // ignore
    }
  }, [completedWinsMap]);

  const runAudit = async (input: AuditInput) => {
    setLastInput(input);
    setError(null);
    setIsLoading(true);
    setCompetitor(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete the digital audit.');
      }

      const auditResult = data as AuditResult;
      setActiveAudit(auditResult);
      setSelectedCategory('all');
      setHistory((prev) => [auditResult, ...prev].slice(0, 20));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while running the audit.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryDemo = () => {
    setError(null);
    setCompetitor(null);
    setSelectedCategory('all');
    setHistory((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const missingDemoItems = DEMO_HISTORY.filter((d) => !existingIds.has(d.id));
      return missingDemoItems.length > 0 ? [...prev, ...missingDemoItems] : prev;
    });
    setActiveAudit(DEMO_AUDIT_CURRENT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    findingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleWin = (winId: string) => {
    if (!activeAudit) return;
    setCompletedWinsMap((prev) => {
      const current = prev[activeAudit.id] ?? [];
      const next = current.includes(winId)
        ? current.filter((id) => id !== winId)
        : [...current, winId];
      return { ...prev, [activeAudit.id]: next };
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (activeAudit?.isDemo) {
      setActiveAudit(null);
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNewAudit = () => {
    setActiveAudit(null);
    setCompetitor(null);
    setError(null);
    setIsChatOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#0B1120] dark:text-slate-100">
      <Header
        hasAudit={Boolean(activeAudit) && !isLoading}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        onNewAudit={handleNewAudit}
        onTryDemo={handleTryDemo}
        onNavigateSection={handleNavigateSection}
      />

      <main className="no-print">
        {isLoading ? (
          <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
            <PulseLoader
              targetUrl={lastInput?.url ?? ''}
              businessName={lastInput?.businessName ?? ''}
            />
          </div>
        ) : !activeAudit ? (
          <InputForm
            initialValues={lastInput ?? undefined}
            isLoading={isLoading}
            error={error}
            onSubmit={runAudit}
            onRetry={() => {
              if (lastInput) void runAudit(lastInput);
            }}
            onTryDemo={handleTryDemo}
            historyCount={history.length}
            onViewLatestHistory={() => {
              if (history.length > 0) {
                const latest = [...history].sort(
                  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )[0];
                setActiveAudit(latest);
              }
            }}
          />
        ) : (
          <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            <section
              id="overview-section"
              aria-labelledby="dashboard-title"
              className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 lg:flex-row lg:items-end"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{activeAudit.input.industry}</span>
                  <span aria-hidden="true">·</span>
                  <span>Goal: {activeAudit.input.mainGoal}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {new Date(activeAudit.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {activeAudit.isDemo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400">
                        Sample Demo Data
                      </span>
                    </>
                  )}
                </div>

                <h1
                  id="dashboard-title"
                  className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
                >
                  {activeAudit.input.businessName}
                </h1>

                <a
                  href={activeAudit.input.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
                >
                  {activeAudit.input.url}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {!activeAudit.isDemo && (
                  <button
                    type="button"
                    onClick={() => void runAudit(activeAudit.input)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Re-run Audit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download Report
                </button>

                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 whitespace-nowrap shrink-0"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  Ask AI Advisor
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
                <div className="flex flex-col items-center py-2">
                  <ScoreGauge score={activeAudit.overallScore} />
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Executive Summary
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {activeAudit.executiveSummary}
                  </p>

                  {activeAudit.observedSignals && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        HTTPS: {activeAudit.observedSignals.https ? 'Detected' : 'Not detected'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Live Probe:{' '}
                        {activeAudit.observedSignals.reachable ? 'Reachable' : 'Estimated only'}
                      </span>
                      {typeof activeAudit.observedSignals.responseTimeMs === 'number' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {activeAudit.observedSignals.responseTimeMs}ms TTFB
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7">
                <RadarComparisonChart
                  categories={activeAudit.categories}
                  businessName={activeAudit.input.businessName}
                  competitor={competitor}
                  isDark={isDark}
                />
              </div>
            </div>

            <section id="categories-section" aria-labelledby="categories-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2
                    id="categories-heading"
                    className="text-xl font-bold text-slate-900 dark:text-white"
                  >
                    Six Category Pillars
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                    Select any category card to filter its detailed issues and fixes below.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeAudit.categories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    findingCount={
                      activeAudit.findings.filter((f) => f.categoryId === cat.id).length
                    }
                    isSelected={selectedCategory === cat.id}
                    onSelect={handleSelectCategory}
                  />
                ))}
              </div>
            </section>

            <CompetitorComparison
              primaryAudit={activeAudit}
              competitor={competitor}
              onCompetitorLoaded={setCompetitor}
            />

            <div ref={findingsRef}>
              <FindingsPanel
                findings={activeAudit.findings}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            <ActionPlan
              actionPlan={activeAudit.actionPlan}
              completedIds={completedWinsMap[activeAudit.id] ?? []}
              onToggleComplete={handleToggleWin}
            />

            <TrendChart
              history={history}
              activeAuditId={activeAudit.id}
              onSelectAudit={(selected) => {
                setActiveAudit(selected);
                setCompetitor(null);
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onClearHistory={handleClearHistory}
              isDark={isDark}
            />

            <aside
              aria-label="AI estimation disclaimer"
              className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <p>
                <strong>Transparency Note:</strong> Scores, findings, and recommendations are
                AI-generated estimates produced with Gemini using your business profile and any
                observable public page metadata. Treat them as a structured prioritization guide
                alongside deeper technical profiling tools.
              </p>
            </aside>
          </div>
        )}
      </main>

      {activeAudit && (
        <>
          <ChatAssistant
            audit={activeAudit}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
          <PrintableReport audit={activeAudit} competitor={competitor} />
        </>
      )}
    </div>
  );
}
