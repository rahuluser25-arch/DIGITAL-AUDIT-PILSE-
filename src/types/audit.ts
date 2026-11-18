export type CategoryId =
  | 'performance'
  | 'seo'
  | 'social'
  | 'security'
  | 'content'
  | 'accessibility';

export type ScoreStatus = 'Critical' | 'Needs Attention' | 'Healthy';
export type Severity = 'High' | 'Medium' | 'Low';
export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type EffortLevel = 'Low' | 'Medium' | 'High';

export type MainGoal =
  | 'More Traffic'
  | 'More Leads'
  | 'Better Security'
  | 'Brand Growth';

export interface AuditInput {
  url: string;
  businessName: string;
  industry: string;
  mainGoal: MainGoal;
}

export interface ObservedSignals {
  reachable: boolean;
  https: boolean;
  title?: string;
  hasMetaDescription?: boolean;
  hasViewport?: boolean;
  hasLangAttr?: boolean;
  responseTimeMs?: number;
}

export interface CategoryScore {
  id: CategoryId;
  name: string;
  score: number;
  status: ScoreStatus;
  summary: string;
  highlights: string[];
}

export interface Finding {
  id: string;
  categoryId: CategoryId;
  title: string;
  severity: Severity;
  explanation: string;
  recommendation: string;
}

export interface QuickWin {
  id: string;
  rank: number;
  title: string;
  categoryId: CategoryId;
  categoryName: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  description: string;
  actionSteps: string[];
  estimatedLift: string;
}

export interface AuditResult {
  id: string;
  timestamp: string;
  isDemo?: boolean;
  input: AuditInput;
  overallScore: number;
  executiveSummary: string;
  observedSignals?: ObservedSignals;
  categories: CategoryScore[];
  findings: Finding[];
  actionPlan: QuickWin[];
}

export interface CompetitorComparisonData {
  competitorUrl: string;
  competitorName: string;
  overallScore: number;
  summary: string;
  categories: {
    id: CategoryId;
    name: string;
    score: number;
  }[];
  keyTakeaways: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const CATEGORY_META: Record<
  CategoryId,
  { label: string; shortLabel: string; description: string }
> = {
  performance: {
    label: 'Website Performance',
    shortLabel: 'Performance',
    description: 'Page speed, Core Web Vitals, mobile responsiveness, and UX flow',
  },
  seo: {
    label: 'SEO',
    shortLabel: 'SEO',
    description: 'Titles, meta descriptions, search intent alignment, and content structure',
  },
  social: {
    label: 'Social Media Presence',
    shortLabel: 'Social',
    description: 'Open Graph sharing readiness, channel alignment, and audience engagement',
  },
  security: {
    label: 'Security & Privacy',
    shortLabel: 'Security',
    description: 'HTTPS enforcement, cookie/GDPR consent basics, and data protection',
  },
  content: {
    label: 'Content & Brand Consistency',
    shortLabel: 'Brand & Content',
    description: 'Value proposition clarity, tone consistency, and trust signals',
  },
  accessibility: {
    label: 'Accessibility',
    shortLabel: 'Accessibility',
    description: 'Contrast ratios, keyboard navigation, semantic landmarks, and alt text',
  },
};

export const INDUSTRIES = [
  'E-Commerce & Retail',
  'SaaS & Technology',
  'Healthcare & Wellness',
  'Finance & Legal',
  'Hospitality & Food',
  'Education & EdTech',
  'Real Estate & Construction',
  'Creative Agency & Media',
  'Professional Services',
  'Non-Profit & Community',
] as const;

export const MAIN_GOALS: { value: MainGoal; label: string; hint: string }[] = [
  {
    value: 'More Traffic',
    label: 'More Traffic',
    hint: 'Prioritize search visibility, crawlability, and shareable content.',
  },
  {
    value: 'More Leads',
    label: 'More Leads',
    hint: 'Focus on conversion friction, trust signals, and page speed.',
  },
  {
    value: 'Better Security',
    label: 'Better Security',
    hint: 'Audit HTTPS posture, privacy notices, and user data safeguards.',
  },
  {
    value: 'Brand Growth',
    label: 'Brand Growth',
    hint: 'Strengthen messaging consistency, social presence, and accessibility.',
  },
];

export function getScoreStatus(score: number): ScoreStatus {
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'Needs Attention';
  return 'Critical';
}
