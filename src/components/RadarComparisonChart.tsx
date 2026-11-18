import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  CATEGORY_META,
  type CategoryScore,
  type CompetitorComparisonData,
} from '../types/audit';

interface RadarComparisonChartProps {
  categories: CategoryScore[];
  businessName: string;
  competitor?: CompetitorComparisonData | null;
  isDark: boolean;
}

export function RadarComparisonChart({
  categories,
  businessName,
  competitor,
  isDark,
}: RadarComparisonChartProps) {
  const data = categories.map((cat) => {
    const compMatch = competitor?.categories.find((c) => c.id === cat.id);
    return {
      subject: CATEGORY_META[cat.id]?.shortLabel ?? cat.name,
      primary: cat.score,
      ...(compMatch ? { competitor: compMatch.score } : {}),
    };
  });

  const gridStroke = isDark ? '#334155' : '#CBD5E1';
  const tickColor = isDark ? '#CBD5E1' : '#334155';

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Six-Pillar Radar Balance
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {competitor
              ? `Comparing ${businessName} against ${competitor.competitorName}`
              : 'Visual balance across all six digital health dimensions'}
          </p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
            <PolarGrid stroke={gridStroke} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: tickColor, fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: isDark ? '#64748B' : '#94A3B8', fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name={businessName}
              dataKey="primary"
              stroke="#14B8A6"
              fill="#14B8A6"
              fillOpacity={0.28}
              strokeWidth={2.5}
            />
            {competitor && (
              <Radar
                name={competitor.competitorName}
                dataKey="competitor"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.16}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            />
            {competitor && <Legend wrapperStyle={{ fontSize: '12px' }} />}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
