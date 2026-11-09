import { useEffect, useRef } from 'react';

interface SuccessBannerProps {
  show: boolean;
  onDismiss: () => void;
}

export default function SuccessBanner({ show, onDismiss }: SuccessBannerProps) {
  // Callers pass an inline callback; keep the timer from restarting on every
  // parent render, so the banner reliably dismisses after three seconds.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onDismissRef.current(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div role="status" className="fixed top-16 left-0 right-0 z-40 animate-slide-down">
      <div className="bg-green-700 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">&#x2705;</span>
            <span className="font-medium">All tests passed! Great work!</span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-white hover:underline transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
