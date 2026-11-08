import { describe, expect, it } from 'vitest';
import { companyTags, getCompanies, getCompanyIndex, getCompanyTags, companySlug } from '../data/companyTags';
import { allProblems } from '../data/problems';
import { companyLogos } from '../components/CompanyTags/companyLogos';

// Tags that research turned up but that were rejected (see docs/company-tags-review.md).
// They must never reappear without a fresh review.
const EXCLUDED: Array<[problemId: string | '*', company: string]> = [
  ['*', 'Startups.com'],
  ['conv2d-forward', 'Google'],
  ['precision-recall-f1', 'Google'],
  ['naive-bayes', 'Pinterest'],
  ['adam-optimizer', 'Akuna Capital'],
  ['llm-kv-cache', 'Anthropic'],
  ['grouped-query-attention', 'Anthropic'],
  ['batch-norm', 'Apple'],
];

const entries = Object.entries(companyTags).flatMap(([problemId, tags]) =>
  tags.map(tag => ({ problemId, ...tag }))
);

describe('company tags data', () => {
  it('only tags problems that exist', () => {
    const ids = new Set(allProblems.map(p => p.id));
    expect(Object.keys(companyTags).filter(id => !ids.has(id))).toEqual([]);
  });

  it('cites an https source with a quote for every tag', () => {
    for (const tag of entries) {
      expect(new URL(tag.url).protocol, `${tag.problemId} / ${tag.company}`).toBe('https:');
      expect(tag.quote.trim().length).toBeGreaterThan(0);
      expect(tag.company.trim()).toBe(tag.company);
      expect(['high', 'medium']).toContain(tag.confidence);
      if (tag.date) expect(tag.date).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    }
  });

  it('keeps every excluded tag out', () => {
    for (const [problemId, company] of EXCLUDED) {
      const slipped = entries.filter(
        tag => tag.company === company && (problemId === '*' || tag.problemId === problemId)
      );
      expect(slipped, `${problemId} / ${company}`).toEqual([]);
    }
  });

  it('has no duplicate sources on a problem', () => {
    for (const [problemId, tags] of Object.entries(companyTags)) {
      const keys = tags.map(tag => `${tag.company}|${tag.url}`);
      expect(new Set(keys).size, problemId).toBe(keys.length);
    }
  });

  it('orders first-hand reports first and dedupes companies', () => {
    const tags = getCompanyTags('multi-head-attention');
    expect(tags[0].confidence).toBe('high');
    expect(tags.findIndex(t => t.confidence === 'medium')).toBeGreaterThan(
      tags.map(t => t.confidence).lastIndexOf('high')
    );
    const companies = getCompanies('multi-head-attention');
    expect(new Set(companies).size).toBe(companies.length);
    expect(getCompanies('no-such-problem')).toEqual([]);
  });

  it('builds a company index with unique slugs', () => {
    const index = getCompanyIndex();
    expect(new Set(index.map(e => e.slug)).size).toBe(index.length);
    expect(companySlug('J.P. Morgan')).toBe('j-p-morgan');
    const total = index.reduce((n, e) => n + e.problemIds.length, 0);
    const pairs = new Set(entries.map(t => `${t.problemId}|${t.company}`)).size;
    expect(total).toBe(pairs);
  });

  it('only maps logos for companies that are tagged', () => {
    const companies = new Set(entries.map(t => t.company));
    expect(Object.keys(companyLogos).filter(c => !companies.has(c))).toEqual([]);
    for (const icon of Object.values(companyLogos)) expect(icon.path).toMatch(/^M/);
  });
});
