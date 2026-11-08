import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CompanyTags, { CompanyLogo, CompanyLogoStack, formatTagDate } from '../components/CompanyTags/CompanyTags';
import { getCompanies, getCompanyTags } from '../data/companyTags';

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
