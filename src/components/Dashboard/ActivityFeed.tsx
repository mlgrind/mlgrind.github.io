import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ActivityItem } from '../../types';

function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const typeIcons: Record<ActivityItem['type'], { icon: JSX.Element; color: string }> = {
  completed: {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: 'text-accent-500 bg-accent-50 dark:bg-accent-500/10 border-accent-200 dark:border-accent-500/20',
  },
  started: {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    color: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20',
  },
  section_milestone: {
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  },
};

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-dark-800 rounded-[14px] border border-gray-200 dark:border-dark-500 overflow-hidden">
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-dark-300 font-mono">
          Recent Activity
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-dark-300 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="space-y-0.5">
            {items.map((item, i) => {
              const { icon, color } = typeIcons[item.type];
              const linkTo = item.problemId
                ? `/problem/${item.sectionId}/${item.problemId}`
                : `/section/${item.sectionId}`;

              return (
                <Link
                  key={`${item.type}-${item.timestamp}-${i}`}
                  to={linkTo}
                  className="group flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <div className={`shrink-0 w-6 h-6 rounded-md border flex items-center justify-center ${color}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-gray-700 dark:text-dark-100 font-medium truncate block group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                      {item.title}
                    </span>
                    {item.detail && (
                      <span className="text-[11px] text-gray-400 dark:text-dark-300">{item.detail}</span>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-gray-400 dark:text-dark-300">
                    {relativeTime(item.timestamp)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
