import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProblemDescription from '../components/ProblemView/ProblemDescription';
import type { Problem } from '../types';

const problem = {
  id: 'test-problem',
  title: 'Test Problem',
  section: 'numpy-fundamentals',
  difficulty: 'easy',
  description: 'Use `np.sum` here.\n\n```\nmask = (rand < keep_prob)\nout = x * mask\n```\n\n```python\nprint(1)\n```\n',
  examples: [],
  starterCode: '',
  testCases: [],
  hints: [],
  solution: '',
} as unknown as Problem;

describe('ProblemDescription code rendering', () => {
  it('renders fences without a language as styled blocks, not inline chips', () => {
    const { container } = render(
      <MemoryRouter>
        <ProblemDescription problem={problem} />
      </MemoryRouter>,
    );
    const pres = container.querySelectorAll('pre');
    expect(pres).toHaveLength(2);
    pres.forEach(pre => {
      expect(pre.className).toContain('rounded-lg');
      expect(pre.querySelector('pre')).toBeNull(); // no nested <pre>
      expect(pre.querySelector('code')?.className).not.toContain('px-1.5');
    });
    expect(pres[0].textContent).toContain('mask = (rand < keep_prob)');
  });

  it('keeps inline code as a chip', () => {
    const { container } = render(
      <MemoryRouter>
        <ProblemDescription problem={problem} />
      </MemoryRouter>,
    );
    const inline = [...container.querySelectorAll('code')].find(c => c.textContent === 'np.sum');
    expect(inline?.closest('pre')).toBeNull();
    expect(inline?.className).toContain('px-1.5');
  });
});
