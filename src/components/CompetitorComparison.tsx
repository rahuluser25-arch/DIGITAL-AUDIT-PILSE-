import { useState, type FormEvent } from 'react';
import { AlertTriangle, ArrowLeftRight, Loader2, X } from 'lucide-react';
import type { AuditResult, CompetitorComparisonData } from '../types/audit';

interface CompetitorComparisonProps {
  primaryAudit: AuditResult;
  competitor: CompetitorComparisonData | null;
  onCompetitorLoaded: (data: CompetitorComparisonData | null) => void;
}

export function CompetitorComparison({
  primaryAudit,
  competitor,
  onCompetitorLoaded,
}: CompetitorComparisonProps) {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = competitorUrl.trim();
    if (!trimmed) {
      setError('Enter a competitor website URL to compare.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorUrl: trimmed,
          industry: primaryAudit.input.industry,
          mainGoal: primaryAudit.input.mainGoal,
          primaryBusinessName: primaryAudit.input.businessName,
          primaryScore: primaryAudit.overallScore,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not benchmark competitor URL.');
      }
      onCompetitorLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to compare right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-labelledby="competitor-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 id="competitor-heading" className="text-base font-bold text-slate-900 dark:text-white">
            Compare with Competitor
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Benchmark {primaryAudit.input.businessName} side-by-side against a competitor domain.
          </p>
        </div>

        <form onSubmit={handleCompare} className="no-print flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
            placeholder="https://competitor.com"
            aria-label="Competitor website URL"
            disabled={loading}
            className="h-9 w-56 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-2 focus:outline-teal-500/30 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-60 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 whitespace-nowrap shrink-0"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {loading ? 'Benchmarking...' : 'Compare'}
          </button>
          {competitor && (
            <button
              type="button"
              onClick={() => onCompetitorLoaded(null)}
              aria-label="Clear competitor comparison"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {competitor && (
        <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Your Site
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
                    {primaryAudit.input.businessName}
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold text-teal-600 tabular-nums dark:text-teal-400">
                    {primaryAudit.overallScore}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Competitor
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
                    {competitor.competitorName}
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold text-amber-600 tabular-nums dark:text-amber-400">
                    {competitor.overallScore}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {competitor.summary}
              </p>

              {competitor.keyTakeaways.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {competitor.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      • {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-2 font-semibold">Category</th>
                      <th className="py-2 text-right font-semibold">{primaryAudit.input.businessName}</th>
                      <th className="py-2 text-right font-semibold">{competitor.competitorName}</th>
                      <th className="py-2 text-right font-semibold">Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {primaryAudit.categories.map((cat) => {
                      const compCat = competitor.categories.find((c) => c.id === cat.id);
                      const compScore = compCat?.score ?? 0;
                      const diff = cat.score - compScore;
                      return (
                        <tr key={cat.id}>
                          <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold text-slate-900 tabular-nums dark:text-white">
                            {cat.score}
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold text-slate-700 tabular-nums dark:text-slate-300">
                            {compScore}
                          </td>
                          <td
                            className={`py-2.5 text-right font-mono font-semibold tabular-nums ${
                              diff > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : diff < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-slate-500'
                            }`}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
