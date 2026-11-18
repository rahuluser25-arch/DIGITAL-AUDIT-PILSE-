import { Trash2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AuditResult } from '../types/audit';

interface TrendChartProps {
  history: AuditResult[];
  activeAuditId: string;
  onSelectAudit: (audit: AuditResult) => void;
  onClearHistory: () => void;
  isDark: boolean;
}

export function TrendChart({
  history,
  activeAuditId,
  onSelectAudit,
  onClearHistory,
  isDark,
}: TrendChartProps) {
  const ordered = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const chartData = ordered.map((item, index) => {
    const date = new Date(item.timestamp);
    return {
      id: item.id,
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      business: item.input.businessName,
      score: item.overallScore,
      runIndex: index + 1,
    };
  });

  const gridStroke = isDark ? '#1E293B' : '#E2E8F0';
  const axisColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <section
      id="trend-section"
      aria-labelledby="trend-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 id="trend-heading" className="text-base font-bold text-slate-900 dark:text-white">
            Pulse Trend &amp; Audit History
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Score trajectory saved locally in your browser across {history.length}{' '}
            {history.length === 1 ? 'audit' : 'audits'}
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="no-print inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white whitespace-nowrap shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear History
          </button>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Run an audit to start tracking your Pulse Score over time.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-[240px] lg:col-span-7">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="pulseTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                  formatter={(value: unknown) => [`${value} / 100`, 'Pulse Score']}
                  labelFormatter={(_label, payload) => {
                    const row = payload?.[0]?.payload;
                    return row ? `${row.business} · ${row.fullDate}` : '';
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#14B8A6"
                  strokeWidth={2.5}
                  fill="url(#pulseTrendFill)"
                  dot={{ r: 4, fill: '#14B8A6', strokeWidth: 2, stroke: isDark ? '#0F172A' : '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#0D9488' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="no-print lg:col-span-5">
            <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Saved Audit Snapshots
            </p>
            <div className="max-h-[210px] space-y-2 overflow-y-auto pr-1">
              {[...ordered].reverse().map((item) => {
                const isActive = item.id === activeAuditId;
                const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectAudit(item)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                      isActive
                        ? 'border-teal-600 bg-teal-50/60 dark:border-teal-500 dark:bg-teal-950/30'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {item.input.businessName}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {dateStr} · {item.input.mainGoal}
                      </p>
                    </div>
                    <span className="font-mono text-base font-bold text-slate-900 tabular-nums dark:text-white shrink-0">
                      {item.overallScore}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
