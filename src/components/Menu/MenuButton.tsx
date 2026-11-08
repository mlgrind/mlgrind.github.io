import { ReactNode, useCallback, useEffect, useId, useRef, useState, KeyboardEvent } from 'react';

interface MenuButtonProps {
  /** Accessible name of the trigger button. */
  label: string;
  /** Visible content of the trigger button. */
  trigger: ReactNode;
  /** Classes for the trigger button. */
  buttonClassName?: string;
  /** Optional native tooltip for the trigger. */
  title?: string;
  /** Which edge of the trigger the menu aligns to. */
  align?: 'left' | 'right';
  /** Renders the items. Call `close` after an item acts. */
  children: (close: () => void) => ReactNode;
}

const itemSelector = '[role="menuitem"]:not([disabled])';

/**
 * A disclosure-style menu button: `aria-haspopup="menu"`, `aria-expanded`, a
 * `role="menu"` popup, arrow-key / Home / End navigation between items, Escape
 * and outside clicks close it and Escape returns focus to the trigger.
 */
export default function MenuButton({
  label,
  trigger,
  buttonClassName = '',
  title,
  align = 'right',
  children,
}: MenuButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusFirstRef = useRef(false);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open && focusFirstRef.current) {
      focusFirstRef.current = false;
      menuRef.current?.querySelector<HTMLElement>(itemSelector)?.focus();
    }
  }, [open]);

  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(itemSelector) ?? []);

  function onButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      if (!open) {
        event.preventDefault();
        focusFirstRef.current = true;
        setOpen(true);
      }
    }
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      list[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      list[list.length - 1]?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={title}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onButtonKeyDown}
        className={buttonClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 min-w-[12rem] py-1.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-500 rounded-lg shadow-lg z-50`}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

