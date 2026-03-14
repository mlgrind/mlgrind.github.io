import { Link } from 'react-router-dom';
import { Recommendation } from '../../types';

const badgeConfig: Record<Recommendation['type'], { label: string; bg: string; text: string; border: string }> = {
  continue: {
    label: 'Continue',
    bg: 'bg-primary-50 dark:bg-primary-500/10',
    text: 'text-primary-600 dark:text-primary-300',
    border: 'border-primary-200 dark:border-primary-500/20',
  },
  next: {
    label: 'Next',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-500/20',
  },
  review: {
    label: 'Review',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/20',
  },
  weak_area: {
    label: 'Weak Area',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/20',
  },
  new_territory: {
    label: 'Try New',
    bg: 'bg-accent-50 dark:bg-accent-500/10',
    text: 'text-accent-600 dark:text-accent-300',
    border: 'border-accent-200 dark:border-accent-500/20',
  },
};

function getLink(rec: Recommendation): string {
  if (rec.problemId) return `/problem/${rec.sectionId}/${rec.problemId}`;
  return `/section/${rec.sectionId}`;
}

export default function Recommendations({ items }: { items: Recommendation[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {items.map((rec, i) => {
          const badge = badgeConfig[rec.type];
          return (
            <Link
              key={`${rec.type}-${rec.sectionId}-${rec.problemId ?? i}`}
              to={getLink(rec)}
              className="group flex-shrink-0 flex-1 min-w-[220px] max-w-[340px] relative p-4 bg-white dark:bg-dark-800 rounded-[14px] border border-gray-200 dark:border-dark-500 hover:border-gray-300 dark:hover:border-dark-400 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-200 overflow-hidden"
            >
              <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-[1]">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
                <div className="mt-2.5 text-sm font-semibold text-gray-900 dark:text-dark-100 tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors leading-snug">
                  {rec.title}
                </div>
                <div className="mt-1 text-[12px] text-gray-500 dark:text-dark-300 leading-relaxed">
                  {rec.reason}
                </div>
              </div>

              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 text-primary-500 dark:text-primary-300 text-sm group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                &rarr;
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
