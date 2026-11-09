import { useEffect, useId, useRef, useState, KeyboardEvent } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Modal behaviour: focus moves into the dialog, Escape closes it, and focus
  // returns to whatever opened it (the Tools menu trigger, a footer link, ...).
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    (dialog?.querySelector<HTMLElement>('input, textarea') ?? dialog?.querySelector<HTMLElement>('button'))?.focus();
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSubmitted(false);
        setError('');
        onCloseRef.current();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Keep Tab and Shift+Tab inside the dialog while it is open.
  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, textarea, a[href]'),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('https://formspree.io/f/mpqqwpav', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          // Formspree uses `_replyto` to set the Reply-To header.
          _replyto: email,
          feedback,
          _subject: `ML Grind Feedback from ${name}`,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setFeedback('');
      } else {
        setError('Failed to send feedback. Please try again.');
      }
    } catch {
      setError('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={trapFocus}
        className="relative bg-white dark:bg-dark-800 border border-transparent dark:border-dark-500 rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close feedback form"
          className="absolute top-4 right-4 rounded text-gray-500 hover:text-gray-700 dark:text-dark-200 dark:hover:text-dark-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id={titleId} className="text-xl font-semibold text-gray-900 dark:text-dark-100 mb-4">Send Feedback</h2>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-dark-100 mb-4">Thank you for your feedback!</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder:text-gray-400 dark:placeholder:text-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                Email <span className="text-gray-500 dark:text-dark-200 font-normal">(optional, so we can reply)</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder:text-gray-400 dark:placeholder:text-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                Feedback
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder:text-gray-400 dark:placeholder:text-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts, suggestions, or report issues..."
              />
            </div>

            {error && (
              <p role="alert" className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-dark-100 bg-gray-100 dark:bg-dark-600 rounded-md hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
