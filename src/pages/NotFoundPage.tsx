import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO/SEO';
import { allProblems } from '../data/problems';
import { sections } from '../data/sections';

/** A problem or section whose id appears in the broken path, e.g. an old link with a renamed section. */
function suggestionFor(pathname: string): { href: string; label: string } | null {
  const segments = pathname.split('/').filter(Boolean).map(s => decodeURIComponent(s).toLowerCase());
  for (const segment of [...segments].reverse()) {
    const problem = allProblems.find(p => p.id === segment);
    if (problem) return { href: `/problem/${problem.section}/${problem.id}`, label: problem.title };
    const section = sections.find(s => s.id === segment);
    if (section) return { href: `/section/${section.id}`, label: section.title };
  }
  return null;
}

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const suggestion = suggestionFor(pathname);

  return (
    <>
      <SEO noindex
        title="Page Not Found"
        description="The page you are looking for does not exist on ML Grind."
        canonical={pathname}
      />
      <div className="max-w-xl mx-auto text-center py-20 px-6">
        <p className="font-mono text-sm tracking-widest text-gray-500 dark:text-dark-300 mb-3">404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-3">Page not found</h1>
        <p className="text-gray-600 dark:text-dark-200 mb-8">
          Nothing lives at <code className="font-mono text-sm break-all">{pathname}</code>. The link may be
          out of date, or the page may have moved.
        </p>
        {suggestion && (
          <p className="mb-8 text-gray-700 dark:text-dark-100">
            Looking for{' '}
            <Link to={suggestion.href} className="font-medium text-primary-600 dark:text-primary-300 underline underline-offset-2">
              {suggestion.label}
            </Link>
            ?
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            Browse the curriculum
          </Link>
          <Link
            to="/companies"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-500 text-gray-700 dark:text-dark-100 font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            Problems by company
          </Link>
        </div>
      </div>
    </>
  );
}
