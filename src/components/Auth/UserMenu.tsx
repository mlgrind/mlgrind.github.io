import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isConfigured } from '../../lib/firebase';

export default function UserMenu() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isConfigured) return null;

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="hidden lg:flex px-3 py-1.5 text-gray-600 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-dark-100 border border-transparent hover:border-gray-200 dark:hover:border-dark-500 transition-all items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
        </svg>
        Sign In
      </button>
    );
  }

  return (
    <div className="relative hidden lg:block" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary-400 transition-colors"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
            {user.displayName?.[0] ?? user.email?.[0] ?? '?'}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-500 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-600">
            <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-300 truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
