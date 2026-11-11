import { Link } from 'react-router-dom';
import MenuButton from '../Menu/MenuButton';
import { menuItemClass } from '../Menu/menuItemClass';

const cheatSheetHref = `${import.meta.env.BASE_URL}ml-cheatsheet.html`;

const icons = {
  companies: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  scratchpad: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  flashcards:
    'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  cheatsheet:
    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  feedback:
    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

function DueBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span title={`${count} flash ${count === 1 ? 'card' : 'cards'} due for review`} className="min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold rounded-full bg-primary-500 text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

interface ToolsProps {
  flashDueCount: number;
  onOpenFeedback: () => void;
}

/** Desktop header dropdown holding Scratchpad, Problems by company, Flash cards, Cheat sheet and Feedback. */
export function ToolsMenu({ flashDueCount, onOpenFeedback }: ToolsProps) {
  return (
    <MenuButton
      label={flashDueCount > 0 ? `Tools, ${flashDueCount} flash ${flashDueCount === 1 ? 'card' : 'cards'} due for review` : 'Tools'}
      buttonClassName="flex px-3 py-1.5 text-gray-600 dark:text-dark-200 text-sm font-medium rounded-lg bg-white/60 dark:bg-dark-800/60 border border-gray-200 dark:border-dark-500 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-dark-100 aria-expanded:bg-gray-100 dark:aria-expanded:bg-dark-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all items-center gap-2"
      trigger={
        <>
          Tools
          <DueBadge count={flashDueCount} />
          <svg className="w-3 h-3 text-gray-400 dark:text-dark-300" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M3 4.5L6 7.5l3-3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </>
      }
    >
      {close => (
        <>
          <Link role="menuitem" to="/scratchpad" onClick={close} className={menuItemClass}>
            <Icon d={icons.scratchpad} />
            <span className="flex-1">Scratchpad</span>
          </Link>
          <Link role="menuitem" to="/companies" onClick={close} className={menuItemClass}>
            <Icon d={icons.companies} />
            <span className="flex-1">Problems by company</span>
          </Link>
          <Link role="menuitem" to="/flashcards" onClick={close} className={menuItemClass}>
            <Icon d={icons.flashcards} />
            <span className="flex-1">Flash cards</span>
            <DueBadge count={flashDueCount} />
          </Link>
          <a
            role="menuitem"
            href={cheatSheetHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className={menuItemClass}
          >
            <Icon d={icons.cheatsheet} />
            <span className="flex-1">Cheat sheet</span>
            <span aria-hidden="true" className="text-xs text-gray-400 dark:text-dark-300">↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <div role="separator" className="my-1.5 border-t border-gray-100 dark:border-dark-600" />
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              close();
              onOpenFeedback();
            }}
            className={menuItemClass}
          >
            <Icon d={icons.feedback} />
            <span className="flex-1">Send feedback</span>
          </button>
        </>
      )}
    </MenuButton>
  );
}

const drawerItemClass =
  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-600 hover:text-gray-900 dark:hover:text-dark-100 transition-colors';

/** The same tools as plain links, for the curriculum drawer on small screens. */
export function DrawerTools({ flashDueCount, onOpenFeedback, onNavigate }: ToolsProps & { onNavigate: () => void }) {
  return (
    <nav aria-label="Tools" className="lg:hidden mb-4 pb-4 border-b border-gray-200 dark:border-dark-500">
      <h3 className="text-gray-500 dark:text-dark-300 text-[11px] font-semibold uppercase tracking-widest mb-2 px-3 font-mono">
        Tools
      </h3>
      <Link to="/scratchpad" onClick={onNavigate} className={drawerItemClass}>
        <Icon d={icons.scratchpad} />
        <span className="flex-1">Scratchpad</span>
      </Link>
      <Link to="/companies" onClick={onNavigate} className={drawerItemClass}>
        <Icon d={icons.companies} />
        <span className="flex-1">Problems by company</span>
      </Link>
      <Link to="/flashcards" onClick={onNavigate} className={drawerItemClass}>
        <Icon d={icons.flashcards} />
        <span className="flex-1">Flash cards</span>
        <DueBadge count={flashDueCount} />
      </Link>
      <a href={cheatSheetHref} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={drawerItemClass}>
        <Icon d={icons.cheatsheet} />
        <span className="flex-1">Cheat sheet</span>
        <span aria-hidden="true" className="text-xs text-gray-400 dark:text-dark-300">↗</span>
      </a>
      <button
        type="button"
        onClick={() => {
          onNavigate();
          onOpenFeedback();
        }}
        className={`${drawerItemClass} w-full text-left`}
      >
        <Icon d={icons.feedback} />
        <span className="flex-1">Send feedback</span>
      </button>
    </nav>
  );
}
