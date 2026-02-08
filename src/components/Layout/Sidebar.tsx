import { NavLink } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { isConfigured } from '../../lib/firebase';
import { sections } from '../../data/sections';

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { getSectionProgress } = useProgress();
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <aside className="w-64 bg-white dark:bg-dark-800/50 border-r border-gray-200 dark:border-dark-500 min-h-[calc(100vh-4rem)] p-4 flex flex-col">
      <nav className="space-y-1 flex-1">
        <h3 className="text-dark-300 dark:text-dark-300 text-[11px] font-semibold uppercase tracking-widest mb-4 px-3 font-mono">
          Curriculum
        </h3>
        {sections.map((section, index) => {
          const progress = getSectionProgress(section.id, section.problems.length);
          return (
            <NavLink
              key={section.id}
              to={`/section/${section.id}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-500/20'
                    : 'text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-600 hover:text-gray-900 dark:hover:text-dark-100 border border-transparent'
                }`
              }
            >
              <span className="w-6 h-6 flex items-center justify-center text-lg">
                {section.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-dark-300 text-[10px] font-mono">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-medium truncate">{section.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-0.5 bg-gray-200 dark:bg-dark-500 rounded-full overflow-hidden">
                    <div
                      className="h-full progress-gradient rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-dark-300 font-mono">{progress}%</span>
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile sign-in section */}
      {isConfigured && <div className="lg:hidden border-t border-gray-200 dark:border-dark-500 pt-4 mt-4">
        {user ? (
          <div className="flex items-center gap-3 px-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                {user.displayName?.[0] ?? user.email?.[0] ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">{user.displayName}</p>
              <button
                onClick={() => { signOut(); onNavigate?.(); }}
                className="text-xs text-gray-500 dark:text-dark-300 hover:text-gray-700 dark:hover:text-dark-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { signInWithGoogle(); onNavigate?.(); }}
            className="flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
            </svg>
            Sign In with Google
          </button>
        )}
      </div>}
    </aside>
  );
}
