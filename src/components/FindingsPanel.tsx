import { useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Search } from 'lucide-react';
import {
  CATEGORY_META,
  type CategoryId,
  type Finding,
  type Severity,
} from '../types/audit';

interface FindingsPanelProps {
  findings: Finding[];
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (cat: CategoryId | 'all') => void;
}

const SEVERITY_ORDER: Record<Severity, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export function FindingsPanel({
  findings,
  selectedCategory,
  onSelectCategory,
}: FindingsPanelProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [query, setQuery] = useState('');

  const filteredFindings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...findings]
      .filter((f) => {
        if (selectedCategory !== 'all' && f.categoryId !== selectedCategory) return false;
        if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false;
        if (
          q &&
          !f.title.toLowerCase().includes(q) &&
          !f.explanation.toLowerCase().includes(q) &&
          !f.recommendation.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [findings, selectedCategory, selectedSeverity, query]);

  return (
    <section
      id="findings-section"
      aria-labelledby="findings-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-7"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="findings-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Findings &amp; Recommendations
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredFindings.length} of {findings.length} issues with plain-English explanations and fixes.
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search findings..."
              aria-label="Search findings"
              className="h-9 w-48 rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-2 focus:outline-teal-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div
            role="group"
            aria-label="Filter by severity"
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
          >
            {(['all', 'High', 'Medium', 'Low'] as const).map((sev) => {
              const active = selectedSeverity === sev;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSelectedSeverity(sev)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {sev === 'all' ? 'All Severities' : sev}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter by category"
        className="no-print mt-4 flex flex-wrap items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            selectedCategory === 'all'
              ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          All Categories
        </button>
        {(Object.keys(CATEGORY_META) as CategoryId[]).map((catId) => {
          const active = selectedCategory === catId;
          return (
            <button
              key={catId}
              type="button"
              onClick={() => onSelectCategory(catId)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {CATEGORY_META[catId].shortLabel}
            </button>
          );
        })}
      </div>

      {filteredFindings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No findings match your current filters.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              setSelectedSeverity('all');
              setQuery('');
            }}
            className="mt-3 text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-200 dark:divide-slate-800">
          {filteredFindings.map((finding) => {
            const catLabel = CATEGORY_META[finding.categoryId]?.label ?? finding.categoryId;
            const sevStyles =
              finding.severity === 'High'
                ? {
                    icon: AlertCircle,
                    text: 'text-red-700 dark:text-red-400',
                  }
                : finding.severity === 'Medium'
                  ? {
                      icon: AlertTriangle,
                      text: 'text-amber-700 dark:text-amber-400',
                    }
                  : {
                      icon: Info,
                      text: 'text-slate-600 dark:text-slate-400',
                    };
            const SevIcon = sevStyles.icon;

            return (
              <article key={finding.id} className="print-break-avoid py-5 first:pt-2 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 font-semibold ${sevStyles.text}`}>
                    <SevIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {finding.severity} Severity
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                    ·
                  </span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {catLabel}
                  </span>
                </div>

                <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                  {finding.title}
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Why it matters
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {finding.explanation}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/60">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Recommended fix
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                      {finding.recommendation}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
