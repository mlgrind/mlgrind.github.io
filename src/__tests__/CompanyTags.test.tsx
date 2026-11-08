import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CompanyTags, { CompanyLogo, CompanyLogoStack, formatTagDate } from '../components/CompanyTags/CompanyTags';
import CompaniesPage from '../pages/CompaniesPage';
import { ProgressProvider } from '../context/ProgressContext';
import { getCompanies, getCompanyIndex, getCompanyTags } from '../data/companyTags';
import { getProblemById } from '../data/problems';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../lib/firestoreSync', () => ({
  loadProgressFromFirestore: vi.fn(),
  saveProgressToFirestore: vi.fn(),
}));

afterEach(cleanup);

const withRouter = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('CompanyTags', () => {
  it('renders nothing for an untagged problem', () => {
    const { container } = withRouter(<CompanyTags problemId="numpy-array-sum" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows company chips and toggles an accessible source panel', () => {
    withRouter(<CompanyTags problemId="multi-head-attention" />);
    const companies = getCompanies('multi-head-attention');
    const tags = getCompanyTags('multi-head-attention');
    const button = screen.getByRole('button', { name: /Reported in interviews at/ });
    for (const company of companies) expect(button).toHaveTextContent(company);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    expect(panel).not.toBeVisible();

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toBeVisible();
    const links = within(panel).getAllByRole('link', { name: /opens in a new tab/ });
    expect(links).toHaveLength(tags.length);
    for (const [i, link] of links.entries()) {
      expect(link).toHaveAttribute('href', tags[i].url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow');
    }
    expect(panel).toHaveTextContent("logos are trademarks of their owners and don't imply endorsement");
    expect(panel).toHaveTextContent('High confidence');
    expect(panel).toHaveTextContent(`“${tags[0].quote}”`);

    fireEvent.keyDown(links[0], { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('shows the report month when the source has one', () => {
    withRouter(<CompanyTags problemId="llm-speculative-decoding" />);
    fireEvent.click(screen.getByRole('button', { name: /Reported in interviews at/ }));
    expect(screen.getByText('Sep 2026')).toBeInTheDocument();
    expect(formatTagDate('2025-01')).toBe('Jan 2025');
  });
});

describe('CompanyLogo', () => {
  it('draws a monochrome, decorative logo or a monogram', () => {
    const { container } = render(
      <>
        <CompanyLogo company="Meta" />
        <CompanyLogo company="J.P. Morgan" />
      </>
    );
    const svg = container.querySelector('svg[data-logo="Meta"]')!;
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    const monogram = container.querySelector('[data-monogram="J.P. Morgan"]')!;
    expect(monogram).toHaveTextContent('J');
    expect(monogram).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('CompanyLogoStack', () => {
  it('caps logos at three and labels every company', () => {
    const companies = getCompanies('multi-head-attention');
    expect(companies.length).toBeGreaterThan(3);
    render(<CompanyLogoStack problemId="multi-head-attention" />);
    const stack = screen.getByTestId('company-logo-stack');
    expect(stack).toHaveTextContent(`Reported at ${companies.join(', ')}`);
    expect(stack.querySelectorAll('[aria-hidden="true"][data-logo], [aria-hidden="true"][data-monogram]')).toHaveLength(3);
    expect(stack).toHaveTextContent(`+${companies.length - 3}`);
  });

  it('renders nothing without tags', () => {
    const { container } = render(<CompanyLogoStack problemId="numpy-array-sum" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('CompaniesPage', () => {
  function Location() {
    return <div data-testid="location">{useLocation().search}</div>;
  }
  const mount = (path = '/companies') =>
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[path]}>
          <ProgressProvider>
            <Routes>
              <Route path="/companies" element={<><CompaniesPage /><Location /></>} />
            </Routes>
          </ProgressProvider>
        </MemoryRouter>
      </HelmetProvider>
    );

  it('lists every company and filters with toggle buttons', () => {
    mount();
    const index = getCompanyIndex();
    const group = screen.getByRole('group', { name: 'Filter by company' });
    expect(within(group).getAllByRole('button')).toHaveLength(index.length + 1);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(index.length);

    const uber = index.find(e => e.company === 'Uber')!;
    fireEvent.click(within(group).getByRole('button', { name: /^Uber/ }));
    expect(within(group).getByRole('button', { name: /^Uber/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('location')).toHaveTextContent('?company=uber');
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    for (const id of uber.problemIds) {
      const problem = getProblemById(id)!;
      expect(screen.getByRole('link', { name: new RegExp(problem.title.replace(/[()]/g, '\\$&')) })).toHaveAttribute(
        'href',
        `/problem/${problem.section}/${problem.id}`
      );
    }
    expect(screen.getByRole('status')).toHaveTextContent(`reported at Uber`);

    fireEvent.click(within(group).getByRole('button', { name: 'All companies' }));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(index.length);
  });

  it('reads the filter from the URL', () => {
    mount('/companies?company=nvidia');
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('NVIDIA');
  });
});
