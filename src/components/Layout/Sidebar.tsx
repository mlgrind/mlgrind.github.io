import { NavLink } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { sections } from '../../data/sections';

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { getSectionProgress } = useProgress();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4 px-3">
          Learning Sections
        </h3>
        {sections.map((section, index) => {
          const progress = getSectionProgress(section.id, section.problems.length);
          return (
            <NavLink
              key={section.id}
              to={`/section/${section.id}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <span className="w-6 h-6 flex items-center justify-center text-lg">
                {section.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{index + 1}.</span>
                  <span className="text-sm font-medium truncate">{section.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{progress}%</span>
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
