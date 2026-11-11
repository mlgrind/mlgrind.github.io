import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO/SEO';
import { CompanyLogo, COMPANY_DISCLAIMER } from '../components/CompanyTags/CompanyTags';
import { getCompanyIndex, getCompanyTags } from '../data/companyTags';
import { getProblemById } from '../data/problems';
import { sections } from '../data/sections';
import { useProgress } from '../context/ProgressContext';

const difficultyClass = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
} as const;

export default function CompaniesPage() {
  const index = getCompanyIndex();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getProblemProgress } = useProgress();
  const selectedSlug = searchParams.get('company');
  const selected = index.find(entry => entry.slug === selectedSlug);
  const unknownSlug = selectedSlug && !selected ? selectedSlug : null;
  const visible = selected ? [selected] : index;
  const problemCount = new Set(index.flatMap(entry => entry.problemIds)).size;

  const select = (slug: string | null) => {
    setSearchParams(slug ? { company: slug } : {}, { replace: true });
  };

  const chipClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
      active
        ? 'bg-primary-500 border-primary-500 text-white'
        : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-500 text-gray-700 dark:text-dark-100 hover:border-primary-400'
    }`;

  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title="Problems by Company"
        description={`ML coding problems reported in interviews at ${index.length} companies, with links to the public interview reports.`}
        canonical="/companies"
      />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 tracking-tight">Problems by company</h1>
      <p className="mt-2 text-gray-500 dark:text-dark-200">
        {problemCount} problems that candidates report being asked in ML coding interviews at {index.length} companies.
        Pick a company to filter. Each problem page links to the reports it comes from, and
        &ldquo;first-hand&rdquo; marks a report written by the candidate.
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-dark-200">{COMPANY_DISCLAIMER}</p>

      {unknownSlug && (
        <p role="status" className="mt-4 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-sm text-amber-800 dark:text-amber-200">
          No problems are tagged for &ldquo;{unknownSlug}&rdquo; yet, so all companies are shown.
        </p>
      )}
      <div role="group" aria-label="Filter by company" className="flex flex-wrap gap-2 mt-6 mb-8">
        <button type="button" aria-pressed={!selected} onClick={() => select(null)} className={chipClass(!selected)}>
          All companies
        </button>
        {index.map(entry => (
          <button
            key={entry.slug}
            type="button"
            aria-pressed={selected?.slug === entry.slug}
            onClick={() => select(selected?.slug === entry.slug ? null : entry.slug)}
            className={chipClass(selected?.slug === entry.slug)}
          >
            <CompanyLogo company={entry.company} size={14} />
            {entry.company}
            <span className="font-mono text-xs opacity-70">
              {entry.problemIds.length}
              <span className="sr-only"> {entry.problemIds.length === 1 ? 'problem' : 'problems'}</span>
            </span>
          </button>
        ))}
      </div>

      <p role="status" className="sr-only">
        {selected
          ? `Showing ${selected.problemIds.length} ${selected.problemIds.length === 1 ? 'problem' : 'problems'} reported at ${selected.company}`
          : `Showing all ${index.length} companies`}
      </p>
      <div className="space-y-8">
        {visible.map(entry => (
          <section key={entry.slug} aria-labelledby={`company-${entry.slug}`}>
            <h2
              id={`company-${entry.slug}`}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3"
            >
              <CompanyLogo company={entry.company} size={18} />
              {entry.company}
            </h2>
            <ul className="space-y-2">
              {entry.problemIds.map(problemId => {
                const problem = getProblemById(problemId);
                if (!problem) return null;
                const section = sections.find(s => s.id === problem.section);
                const sources = getCompanyTags(problemId).filter(tag => tag.company === entry.company);
                const done = getProblemProgress(problem.section, problem.id).status === 'completed';
                return (
                  <li key={problemId}>
                    <Link
                      to={`/problem/${problem.section}/${problem.id}`}
                      className="flex items-center gap-3 bg-white dark:bg-dark-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-dark-500 hover:border-primary-400 dark:hover:border-primary-500/30 transition-colors group min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 dark:text-dark-100 font-medium group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors break-words">
                          {done && (
                            <span className="text-green-600 dark:text-green-400">
                              <span aria-hidden="true">✓ </span>
                              <span className="sr-only">Solved: </span>
                            </span>
                          )}
                          {problem.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                          <span className={`px-2 py-0.5 rounded ${difficultyClass[problem.difficulty]}`}>
                            {problem.difficulty}
                          </span>
                          {section && <span className="text-gray-500 dark:text-dark-200">{section.title}</span>}
                          <span className="text-gray-500 dark:text-dark-300 font-mono">
                            {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                            {sources.some(tag => tag.confidence === 'high') ? ' · first-hand' : ''}
                          </span>
                        </div>
                      </div>
                      <span aria-hidden="true" className="text-gray-400 dark:text-dark-300 group-hover:text-primary-500">
                        &rarr;
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
