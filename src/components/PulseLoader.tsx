import { useEffect, useState } from 'react';

interface PulseLoaderProps {
  targetUrl: string;
  businessName: string;
}

const AUDIT_STAGES = [
  'Checking live HTTPS & response signals',
  'Scoring Performance, SEO, and Accessibility',
  'Evaluating Security, Privacy, and Brand Trust',
  'Ranking top 5 Impact vs. Effort quick wins',
];

export function PulseLoader({ targetUrl, businessName }: PulseLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % AUDIT_STAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12"
    >
      <div className="mx-auto mb-6 flex max-w-sm items-center justify-center">
        <svg
          viewBox="0 0 360 80"
          className="h-20 w-full text-teal-500"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 44 H70 L88 44 L98 28 L112 62 L126 12 L140 68 L152 38 L164 44 H220 L236 44 L246 26 L260 62 L274 14 L288 66 L300 40 L312 44 H360"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0 44 H70 L88 44 L98 28 L112 62 L126 12 L140 68 L152 38 L164 44 H220 L236 44 L246 26 L260 62 L274 14 L288 66 L300 40 L312 44 H360"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-line"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        Analyzing {businessName || targetUrl}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {AUDIT_STAGES[stageIndex]}
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{targetUrl}</span>
        <span aria-hidden="true">·</span>
        <span>AI-assisted estimation</span>
      </div>
    </div>
  );
}
