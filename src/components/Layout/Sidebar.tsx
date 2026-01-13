import { NavLink } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { sections } from '../../data/sections';

export default function Sidebar() {
  const { getSectionProgress } = useProgress();

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        <h3 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-4 px-3">
          Learning Sections
        </h3>
        {sections.map((section, index) => {
          const progress = getSectionProgress(section.id, section.problems.length);
          return (
            <NavLink
              key={section.id}
              to={`/section/${section.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-dark-200 hover:bg-dark-700 hover:text-white'
                }`
              }
            >
              <span className="w-6 h-6 flex items-center justify-center text-lg">
                {section.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-dark-500 text-xs">{index + 1}.</span>
                  <span className="text-sm font-medium truncate">{section.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-dark-400">{progress}%</span>
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
