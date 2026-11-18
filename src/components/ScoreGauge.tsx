import { getScoreStatus } from '../types/audit';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export function ScoreGauge({ score, label = 'Pulse Score', size = 200 }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const status = getScoreStatus(clamped);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const tone =
    clamped >= 75
      ? {
          stroke: '#16A34A',
          ringClass: 'border-emerald-500/25',
          textClass: 'text-emerald-600 dark:text-emerald-400',
          statusDesc: 'Strong digital baseline',
        }
      : clamped >= 50
        ? {
            stroke: '#D97706',
            ringClass: 'border-amber-500/25',
            textClass: 'text-amber-600 dark:text-amber-400',
            statusDesc: 'Targeted fixes recommended',
          }
        : {
            stroke: '#DC2626',
            ringClass: 'border-red-500/25',
            textClass: 'text-red-600 dark:text-red-400',
            statusDesc: 'Urgent remediation needed',
          };

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center"
      role="img"
      aria-label={`${label}: ${clamped} out of 100, status ${status}`}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div
          aria-hidden="true"
          className={`animate-pulse-ring pointer-events-none absolute inset-2 rounded-full border-2 ${tone.ringClass}`}
        />

        <svg width={size} height={size} className="-rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </span>
          <span className="mt-0.5 font-mono text-5xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
            {clamped}
          </span>
          <span className={`mt-1 text-xs font-semibold ${tone.textClass}`}>
            {status}
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {tone.statusDesc}
      </p>
    </div>
  );
}
