import {
  ChevronRight,
  Eye,
  FileText,
  Gauge,
  Search,
  Share2,
  Shield,
} from 'lucide-react';
import type { CategoryId, CategoryScore } from '../types/audit';

interface CategoryCardProps {
  category: CategoryScore;
  findingCount: number;
  isSelected: boolean;
  onSelect: (categoryId: CategoryId) => void;
}

const CATEGORY_ICONS: Record<CategoryId, typeof Gauge> = {
  performance: Gauge,
  seo: Search,
  social: Share2,
  security: Shield,
  content: FileText,
  accessibility: Eye,
};

export function CategoryCard({
  category,
  findingCount,
  isSelected,
  onSelect,
}: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.id];

  const statusTone =
    category.score >= 75
      ? 'text-emerald-700 dark:text-emerald-400'
      : category.score >= 50
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-red-700 dark:text-red-400';

  const barTone =
    category.score >= 75
      ? 'bg-emerald-600 dark:bg-emerald-500'
      : category.score >= 50
        ? 'bg-amber-500 dark:bg-amber-400'
        : 'bg-red-600 dark:bg-red-500';

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      aria-pressed={isSelected}
      className={`group flex h-full w-full flex-col justify-between rounded-xl border p-5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
        isSelected
          ? 'border-teal-600 bg-teal-50/40 shadow-sm dark:border-teal-500 dark:bg-teal-950/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
      }`}
    >
      <div className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {category.name}
              </h3>
              <p className={`text-xs font-semibold ${statusTone}`}>
                {category.status}
              </p>
            </div>
          </div>

          <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {category.score}
          </span>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barTone}`}
            style={{ width: `${Math.max(4, category.score)}%` }}
          />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {category.summary}
        </p>
      </div>

      <div className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
        <span className="tabular-nums">
          {findingCount} {findingCount === 1 ? 'finding' : 'findings'}
        </span>
        <span className="inline-flex items-center gap-1 text-teal-700 transition-transform group-hover:translate-x-0.5 dark:text-teal-400">
          Inspect details
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
