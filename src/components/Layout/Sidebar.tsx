import { useEffect, useState, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { isConfigured } from '../../lib/firebase';
import { readStorage, writeStorage } from '../../lib/storage';
import { resolvedGroups, groupOfSection, completedInSection, groupProgress } from '../../data/curriculum';

/** localStorage key for the sidebar's open/closed groups ({ [groupId]: boolean }). */
export const SIDEBAR_GROUPS_KEY = 'ml-sidebar-groups';

interface SidebarProps {
  onNavigate?: () => void;
  /** Extra links shown above the curriculum (the mobile drawer's tools). */
  extra?: ReactNode;
  /** Rendered inside the drawer: fill its width instead of docking at w-64. */
  inDrawer?: boolean;
}

function readOpenGroups(): Record<string, boolean> {
  try {
    const value: unknown = JSON.parse(readStorage(SIDEBAR_GROUPS_KEY) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
    );
  } catch {
    return {};
  }
}

/** Quiet per-section indicator: an empty ring, a highlighted ring once started, filled when complete. */
function SectionIndicator({ done, total }: { done: number; total: number }) {
  const complete = total > 0 && done >= total;
  return (
    <span
      aria-hidden="true"
      className={`block w-3 h-3 shrink-0 rounded-full border-2 ${
        complete
          ? 'border-primary-500 bg-primary-500'
          : done > 0
          ? 'border-primary-500'
          : 'border-gray-300 dark:border-dark-500'
      }`}
    />
  );
}

export default function Sidebar({ onNavigate, extra, inDrawer = false }: SidebarProps) {
  const { progress } = useProgress();
  const { user, signInWithGoogle, signOut } = useAuth();
  const { pathname } = useLocation();
  const activeSectionId = pathname.match(/^\/(?:section|problem)\/([^/]+)/)?.[1];
  const activeGroupId = groupOfSection(activeSectionId)?.id;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(readOpenGroups);

  // Entering a group (by navigating to one of its sections) opens it.
  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups(prev => (prev[activeGroupId] ? prev : { ...prev, [activeGroupId]: true }));
  }, [activeGroupId]);

  useEffect(() => {
    writeStorage(SIDEBAR_GROUPS_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  const isOpen = (groupId: string) => openGroups[groupId] ?? groupId === activeGroupId;
  const toggle = (groupId: string) =>
    setOpenGroups(prev => ({ ...prev, [groupId]: !(prev[groupId] ?? groupId === activeGroupId) }));

  return (
    <aside
      className={`${
        inDrawer ? 'w-full' : 'w-64 border-r border-gray-200 dark:border-dark-500 min-h-[calc(100vh-4rem)]'
      } shrink-0 bg-white dark:bg-dark-800/50 p-4 flex flex-col`}
    >
      {extra}
      <nav className="flex-1" aria-label="Curriculum">
        <h3 className="text-gray-500 dark:text-dark-300 text-[11px] font-semibold uppercase tracking-widest mb-3 px-3 font-mono">
          Curriculum
        </h3>
        <ul className="space-y-1">
          {resolvedGroups.map(group => {
            const open = isOpen(group.id);
            const { done, total } = groupProgress(progress, group);
            const listId = `sidebar-group-${group.id}`;
            return (
              <li key={group.id}>
                <button
                  type="button"
                  onClick={() => toggle(group.id)}
                  aria-expanded={open}
                  aria-controls={listId}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${open ? 'bg-gray-50 dark:bg-dark-700/60 ' : ''}${
                    group.id === activeGroupId
                      ? 'text-gray-900 dark:text-dark-100'
                      : 'text-gray-700 dark:text-dark-200'
                  } hover:bg-gray-100 dark:hover:bg-dark-600`}
                >
                  <svg
                    className={`w-3 h-3 shrink-0 text-gray-400 dark:text-dark-300 transition-transform ${open ? 'rotate-90' : ''}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M4.5 2.5L8 6l-3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="flex-1 min-w-0">{group.title}</span>
                  <span
                    className={`font-mono text-[10px] font-normal ${
                      done > 0 ? 'text-primary-600 dark:text-primary-300' : 'text-gray-500 dark:text-dark-300'
                    }`}
                    aria-label={`${done} of ${total} problems solved`}
                  >
                    {done}/{total}
                  </span>
                </button>
                <ul id={listId} hidden={!open} className="mt-0.5 mb-2 space-y-0.5">
                  {group.sections.map(section => (
                    <li key={section.id}>
                      <NavLink
                        to={`/section/${section.id}`}
                        onClick={onNavigate}
                        className={() => {
                          const isActive = section.id === activeSectionId;
                          return `flex items-start gap-2.5 pl-7 pr-2.5 py-1.5 rounded-lg text-[13px] leading-snug transition-colors border ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-500/20'
                              : 'text-gray-600 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-600 hover:text-gray-900 dark:hover:text-dark-100 border-transparent'
                          }`;
                        }}
                      >
                        <span className="mt-[4px]">
                          <SectionIndicator done={completedInSection(progress, section)} total={section.problems.length} />
                        </span>
                        <span className="flex-1 min-w-0 break-words">
                          {section.title}
                          {section.problems.length > 0 && completedInSection(progress, section) >= section.problems.length && (
                            <span className="sr-only"> (completed)</span>
                          )}
                        </span>
                        <span
                          className="font-mono text-[10px] mt-[3px] text-gray-500 dark:text-dark-300"
                          aria-label={`${section.problems.length} problems`}
                        >
                          {section.problems.length}
                        </span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
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
                Sign out
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
            Sign in with Google
          </button>
        )}
      </div>}
    </aside>
  );
}
