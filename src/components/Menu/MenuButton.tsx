import {
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

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
/** Gap between the trigger and the menu, and the minimum margin to the viewport edge. */
const GAP = 8;
const EDGE = 8;

/**
 * Fixed-position coordinates for the menu, aligned to the trigger. The menu is
 * portalled to <body>, so it escapes any stacking context or overflow clip of
 * the trigger's ancestors (animated wrappers, split panes, sticky headers).
 */
function menuPosition(trigger: DOMRect, align: 'left' | 'right', menuWidth: number): CSSProperties {
  const vw = window.innerWidth;
  const top = trigger.bottom + GAP;
  const maxHeight = Math.max(window.innerHeight - top - EDGE, 120);
  const maxWidth = vw - 2 * EDGE;
  const width = Math.min(menuWidth, maxWidth);
  // Align to the requested edge of the trigger, then clamp into the viewport
  // (a right-aligned menu wider than the space left of the trigger on a phone).
  const preferred = align === 'right' ? trigger.right - width : trigger.left;
  const left = Math.min(Math.max(preferred, EDGE), vw - EDGE - width);
  return { top, left: Math.max(left, EDGE), maxHeight, maxWidth };
}

/**
 * A disclosure-style menu button: `aria-haspopup="menu"`, `aria-expanded`, a
 * `role="menu"` popup, arrow-key / Home / End navigation between items, Escape
 * and outside clicks close it and Escape returns focus to the trigger.
 *
 * The popup renders in a portal on <body> with fixed positioning, so it always
 * paints above page content regardless of where the trigger sits.
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
  const [position, setPosition] = useState<CSSProperties | null>(null);

  // Items call this after acting. Focus goes back to the trigger so it is not
  // lost with the unmounted menu (and a dialog an item opens can restore it).
  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    // Escape closes the menu wherever focus is, including on the trigger
    // after a mouse click, and returns focus to the trigger.
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Measure before paint, then follow the trigger on scroll and resize.
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    function update() {
      if (buttonRef.current) {
        const width = menuRef.current?.offsetWidth ?? 0;
        setPosition(menuPosition(buttonRef.current.getBoundingClientRect(), align, width));
      }
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, align]);

  // Focus the first item once the menu is positioned (and so visible).
  useEffect(() => {
    if (open && position && focusFirstRef.current) {
      focusFirstRef.current = false;
      menuRef.current?.querySelector<HTMLElement>(itemSelector)?.focus();
    }
  }, [open, position]);

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
    if (event.key === 'ArrowDown') {
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
      // The menu lives at the end of <body>: hand focus back to the trigger so
      // the browser's Tab moves on from there, not off the end of the page.
      setOpen(false);
      buttonRef.current?.focus();
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
      {open &&
        createPortal(
          <div
            id={menuId}
            ref={menuRef}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            style={position ?? { top: 0, left: 0, visibility: 'hidden' }}
            className="fixed z-[60] min-w-[12rem] py-1.5 overflow-y-auto bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-500 rounded-lg shadow-lg dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </div>
  );
}

