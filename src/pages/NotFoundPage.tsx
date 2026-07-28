import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO/SEO';

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist on ML Grind."
        canonical={pathname}
      />
      <div className="max-w-xl mx-auto text-center py-20 px-6">
        <p className="font-mono text-sm tracking-widest text-gray-400 dark:text-dark-300 mb-3">404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-3">Page not found</h1>
        <p className="text-gray-600 dark:text-dark-200 mb-2">
          Nothing lives at <code className="font-mono text-sm break-all">{pathname}</code>.
        </p>
        <p className="text-gray-500 dark:text-dark-300 text-sm mb-8">
          Problem pages live at <code className="font-mono">/problem/&lt;section&gt;/&lt;problem&gt;</code> — if you
          followed an old link, the section is probably missing from it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            Back to curriculum
          </Link>
          <Link
            to="/scratchpad"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-500 text-gray-700 dark:text-dark-100 font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            Open the scratchpad
          </Link>
        </div>
      </div>
    </>
  );
}
