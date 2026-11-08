import { useId, useRef, useState, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { CompanyTag, getCompanies, getCompanyTags } from '../../data/companyTags';
import { companyLogos } from './companyLogos';

export const COMPANY_DISCLAIMER =
  "Based on public interview reports; logos are trademarks of their owners and don't imply endorsement.";

interface CompanyLogoProps {
  company: string;
  /** Rendered size in px (square). */
  size?: number;
  className?: string;
}

/**
 * A company's mark, monochrome in the current text colour so it follows the
 * theme. Logos are drawn as published (no recolouring beyond monochrome, no
 * distortion, no animation). Companies without a logo get a neutral monogram.
 * Always decorative: the company name must be given as text next to it.
 */
export function CompanyLogo({ company, size = 14, className = '' }: CompanyLogoProps) {
  const icon = companyLogos[company];
  if (icon) {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={`shrink-0 ${className}`}
        data-logo={company}
      >
        <path d={icon.path} />
      </svg>
    );
  }
  const letter = company.match(/[A-Za-z0-9]/)?.[0]?.toUpperCase() ?? '?';
  return (
    <span
      aria-hidden="true"
      data-monogram={company}
      className={`shrink-0 inline-flex items-center justify-center rounded-full border border-current font-semibold leading-none opacity-80 ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.6) }}
    >
      {letter}
    </span>
  );
}

/** "2026-04" -> "Apr 2026" */
export function formatTagDate(date: string): string {
  const [year, month] = date.split('-').map(Number);
  if (!year || !month) return date;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const confidenceLabel: Record<CompanyTag['confidence'], string> = {
  high: 'High confidence · first-hand report',
  medium: 'Medium confidence · question bank listing',
};

/** Small logos for a problem list row: up to `max`, then "+N". */
export function CompanyLogoStack({ problemId, max = 3 }: { problemId: string; max?: number }) {
  const companies = getCompanies(problemId);
  if (companies.length === 0) return null;
  const shown = companies.slice(0, max);
  const extra = companies.length - shown.length;
  const label = `Reported at ${companies.join(', ')}`;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-gray-500 dark:text-dark-200"
      title={label}
      data-testid="company-logo-stack"
    >
      <span className="sr-only">{label}</span>
      {shown.map(company => (
        <CompanyLogo key={company} company={company} size={14} />
      ))}
      {extra > 0 && (
        <span aria-hidden="true" className="text-xs font-mono">
          +{extra}
        </span>
      )}
    </span>
  );
}

/**
 * "Reported in interviews at" row for the problem page. The row is a disclosure
 * button; the panel below it lists each source with its date, quote and link.
 */
export default function CompanyTags({ problemId }: { problemId: string }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const tags = getCompanyTags(problemId);
  const companies = getCompanies(problemId);
  if (tags.length === 0) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className="not-prose -mt-2 mb-4 min-w-0" onKeyDown={onKeyDown} data-testid="company-tags">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(value => !value)}
        className="group flex flex-wrap items-center gap-1.5 max-w-full text-left rounded-lg -mx-1 px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-dark-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
      >
        <span className="text-xs text-gray-500 dark:text-dark-200">Reported in interviews at</span>
        {companies.map(company => (
          <span
            key={company}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-xs font-medium text-gray-700 dark:text-dark-100"
          >
            <CompanyLogo company={company} size={12} />
            {company}
          </span>
        ))}
        <span className="inline-flex items-center gap-0.5 text-xs text-primary-600 dark:text-primary-300 group-hover:underline">
          {open ? 'Hide sources' : `${tags.length} ${tags.length === 1 ? 'source' : 'sources'}`}
          <svg
            aria-hidden="true"
            className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="mt-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-900 p-3 text-sm"
      >
        <ul className="space-y-3" aria-label="Interview report sources">
          {tags.map(tag => (
            <li key={`${tag.company}-${tag.url}`} className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="inline-flex items-center gap-1.5 font-medium text-gray-900 dark:text-dark-100">
                  <CompanyLogo company={tag.company} size={14} />
                  {tag.company}
                </span>
                {tag.date && (
                  <span className="text-xs text-gray-500 dark:text-dark-200">{formatTagDate(tag.date)}</span>
                )}
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded ${
                    tag.confidence === 'high'
                      ? 'bg-accent-50 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300'
                      : 'bg-gray-200 text-gray-700 dark:bg-dark-600 dark:text-dark-100'
                  }`}
                >
                  {confidenceLabel[tag.confidence]}
                </span>
              </div>
              <blockquote className="mt-1 text-gray-600 dark:text-dark-200 break-words">
                “{tag.quote}”
              </blockquote>
              <a
                href={tag.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-300 hover:underline break-all"
              >
                {sourceHost(tag.url)}
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 pt-2 border-t border-gray-200 dark:border-dark-500 text-xs text-gray-500 dark:text-dark-200">
          {COMPANY_DISCLAIMER}{' '}
          <Link to="/companies" className="text-primary-600 dark:text-primary-300 hover:underline whitespace-nowrap">
            Browse by company →
          </Link>
        </p>
      </div>
    </div>
  );
}
