import { useState, type FormEvent } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Globe,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  CATEGORY_META,
  INDUSTRIES,
  MAIN_GOALS,
  type AuditInput,
  type CategoryId,
  type MainGoal,
} from '../types/audit';

interface InputFormProps {
  initialValues?: Partial<AuditInput>;
  isLoading: boolean;
  error: string | null;
  onSubmit: (input: AuditInput) => void;
  onRetry: () => void;
  onTryDemo: () => void;
  historyCount: number;
  onViewLatestHistory?: () => void;
}

export function InputForm({
  initialValues,
  isLoading,
  error,
  onSubmit,
  onRetry,
  onTryDemo,
  historyCount,
  onViewLatestHistory,
}: InputFormProps) {
  const [url, setUrl] = useState(initialValues?.url ?? '');
  const [businessName, setBusinessName] = useState(initialValues?.businessName ?? '');
  const [industry, setIndustry] = useState(initialValues?.industry ?? INDUSTRIES[0]);
  const [mainGoal, setMainGoal] = useState<MainGoal>(initialValues?.mainGoal ?? 'More Leads');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setValidationError('Please enter your website URL (e.g., https://yourcompany.com).');
      return;
    }

    const candidate = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
    try {
      const parsed = new URL(candidate);
      if (!parsed.hostname.includes('.')) {
        setValidationError('Please enter a valid domain name such as example.com.');
        return;
      }
    } catch {
      setValidationError('Please enter a valid website URL such as https://example.com.');
      return;
    }

    onSubmit({
      url: candidate,
      businessName: businessName.trim() || candidate.replace(/^https?:\/\//i, '').split('/')[0],
      industry,
      mainGoal,
    });
  };

  const displayError = validationError || error;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5 lg:pt-4">
          <p className="text-sm font-semibold tracking-wide text-teal-600 dark:text-teal-400">
            Digital Audit Pulse
          </p>
          <h1
            className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl"
            style={{ textWrap: 'balance' }}
          >
            Your digital health, at a glance
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Enter your website and business context to generate an instant 0–100 Pulse Score across six critical pillars, complete with prioritized fixes and an interactive advisor.
          </p>

          <div className="mt-8 space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Six-Pillar Diagnostic
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Evaluates Performance, SEO, Social, Security &amp; Privacy, Brand Content, and Accessibility together.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Impact vs. Effort Roadmap
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Surfaces the top 5 quick wins tailored to your primary business goal, plus competitor benchmarking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Transparent AI Assessment
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Combines live public page signal checks with Gemini-powered heuristic analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onTryDemo}
              disabled={isLoading}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              Try Demo Dashboard
            </button>
            {historyCount > 0 && onViewLatestHistory && (
              <button
                type="button"
                onClick={onViewLatestHistory}
                disabled={isLoading}
                className="inline-flex h-11 items-center gap-1.5 px-3 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:text-teal-400 dark:hover:text-teal-300 whitespace-nowrap shrink-0"
              >
                Resume Last Audit ({historyCount})
              </button>
            )}
          </div>
        </div>

        <section
          id="audit-form-section"
          aria-labelledby="audit-form-heading"
          className="lg:col-span-7"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-6">
              <h2
                id="audit-form-heading"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Configure your website audit
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Takes about 5–8 seconds. No account or credit card required.
              </p>
            </div>

            {displayError && (
              <div
                role="alert"
                className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                  <span>{displayError}</span>
                </div>
                {error && !validationError && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 self-start rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/70 whitespace-nowrap shrink-0 sm:self-center"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Retry
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="audit-url"
                  className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Website URL
                </label>
                <div className="relative mt-1.5">
                  <Globe
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="audit-url"
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                    disabled={isLoading}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-2 focus:outline-teal-500/30 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="business-name"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Business Name
                  </label>
                  <input
                    id="business-name"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Studio"
                    disabled={isLoading}
                    className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-2 focus:outline-teal-500/30 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="business-industry"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Industry
                  </label>
                  <select
                    id="business-industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={isLoading}
                    className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-2 focus:outline-teal-500/30 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset>
                <legend className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Primary Business Goal
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {MAIN_GOALS.map((goal) => {
                    const selected = mainGoal === goal.value;
                    return (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => setMainGoal(goal.value)}
                        aria-pressed={selected}
                        disabled={isLoading}
                        className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                          selected
                            ? 'border-teal-600 bg-teal-50/70 text-slate-900 dark:border-teal-500 dark:bg-teal-950/30 dark:text-white'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className="text-sm font-semibold">{goal.label}</span>
                        <span className="mt-1 text-xs leading-snug text-slate-600 dark:text-slate-400">
                          {goal.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  <span>{isLoading ? 'Running Audit...' : 'Run Audit'}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                Scores and recommendations are AI-generated estimates combining live public page metadata with Gemini domain analysis.
              </p>
            </form>
          </div>
        </section>
      </div>

      <section
        id="pillars-overview"
        aria-labelledby="pillars-heading"
        className="mt-14 border-t border-slate-200 pt-10 dark:border-slate-800"
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 id="pillars-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              What Digital Audit Pulse evaluates
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Six interconnected dimensions weighted toward your selected goal.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(CATEGORY_META) as CategoryId[]).map((catId, index) => {
            const meta = CATEGORY_META[catId];
            return (
              <div
                key={catId}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="font-mono text-xs font-medium text-teal-600 tabular-nums dark:text-teal-400">
                  0{index + 1}
                </p>
                <h3 className="mt-1.5 text-base font-semibold text-slate-900 dark:text-white">
                  {meta.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {meta.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
