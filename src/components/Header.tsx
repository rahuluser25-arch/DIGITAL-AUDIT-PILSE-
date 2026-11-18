import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  hasAudit: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onNewAudit: () => void;
  onTryDemo: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export function Header({
  hasAudit,
  isDark,
  onToggleTheme,
  onNewAudit,
  onTryDemo,
  onNavigateSection,
}: HeaderProps) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B1120]/95">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onNewAudit}
          className="text-left text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-teal-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:text-white dark:hover:text-teal-400 whitespace-nowrap shrink-0"
        >
          Digital Audit Pulse
        </button>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          {hasAudit ? (
            <>
              <button
                type="button"
                onClick={() => onNavigateSection('overview-section')}
                className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('categories-section')}
                className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Categories
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('findings-section')}
                className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Findings
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('action-plan-section')}
                className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Action Plan
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('trend-section')}
                className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                History
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNavigateSection('audit-form-section')}
                className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Run Audit
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('pillars-overview')}
                className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Six Pillars
              </button>
              <button
                type="button"
                onClick={onTryDemo}
                className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Sample Dashboard
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shrink-0"
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>

          {hasAudit ? (
            <button
              type="button"
              onClick={onNewAudit}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 whitespace-nowrap shrink-0"
            >
              New Audit
            </button>
          ) : (
            <button
              type="button"
              onClick={onTryDemo}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 whitespace-nowrap shrink-0"
            >
              Try Demo
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
