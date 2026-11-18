import { CheckSquare, Square } from 'lucide-react';
import type { QuickWin } from '../types/audit';

interface ActionPlanProps {
  actionPlan: QuickWin[];
  completedIds: string[];
  onToggleComplete: (winId: string) => void;
}

export function ActionPlan({
  actionPlan,
  completedIds,
  onToggleComplete,
}: ActionPlanProps) {
  const completedCount = actionPlan.filter((item) => completedIds.includes(item.id)).length;

  return (
    <section
      id="action-plan-section"
      aria-labelledby="action-plan-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h2 id="action-plan-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Priority Action Plan
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Top 5 quick wins ranked by expected business impact versus implementation effort.
          </p>
        </div>

        <p className="font-mono text-xs font-medium text-slate-600 tabular-nums dark:text-slate-300">
          {completedCount} of {actionPlan.length} completed
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {actionPlan.map((win) => {
          const isDone = completedIds.includes(win.id);
          return (
            <div
              key={win.id}
              className={`print-break-avoid rounded-xl border p-5 transition-colors ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(win.id)}
                    aria-pressed={isDone}
                    aria-label={isDone ? `Mark "${win.title}" incomplete` : `Mark "${win.title}" complete`}
                    className="no-print mt-0.5 shrink-0 text-teal-600 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:text-teal-400"
                  >
                    {isDone ? (
                      <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Square className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-teal-700 tabular-nums dark:text-teal-400">
                        Priority 0{win.rank}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{win.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{win.estimatedLift}</span>
                    </div>
                    <h3
                      className={`mt-1 text-base font-bold ${
                        isDone
                          ? 'text-slate-500 line-through dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {win.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                  <span
                    className={
                      win.impact === 'High'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }
                  >
                    Impact: {win.impact}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                    /
                  </span>
                  <span
                    className={
                      win.effort === 'Low'
                        ? 'text-teal-700 dark:text-teal-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }
                  >
                    Effort: {win.effort}
                  </span>
                </div>
              </div>

              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:pl-8">
                {win.description}
              </p>

              {win.actionSteps.length > 0 && (
                <ul className="mt-3 space-y-1.5 sm:pl-8">
                  {win.actionSteps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-mono text-slate-400 tabular-nums">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
