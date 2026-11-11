import { describe, it, expect } from 'vitest';
import { flashCards } from '../data/flashcards';
import { sections } from '../data/sections';

// Saved review schedules are keyed by card id, so these ids must never
// disappear or change meaning. New cards may be added freely.
const LEGACY_IDS = [
  'fc-numpy-broadcasting', 'fc-numpy-reshape-transpose', 'fc-numpy-view-copy',
  'fc-python-vectorization', 'fc-python-matmul', 'fc-einsum-rules', 'fc-einsum-attention',
  'fc-pytorch-autograd', 'fc-pytorch-loss', 'fc-preprocess-normalize', 'fc-preprocess-onehot',
  'fc-supervised-bias-variance', 'fc-supervised-gd-convergence', 'fc-supervised-logistic',
  'fc-unsupervised-kmeans-limitations', 'fc-unsupervised-pca', 'fc-eval-precision-recall',
  'fc-eval-crossval', 'fc-dl-relu-advantages', 'fc-dl-backprop', 'fc-nn-vanishing-gradient',
  'fc-nn-batchnorm', 'fc-nn-weight-init', 'fc-cnn-why-convolutions', 'fc-cnn-output-size',
  'fc-cnn-iou', 'fc-transformer-scaling', 'fc-transformer-positional', 'fc-transformer-multihead',
  'fc-llm-temperature', 'fc-llm-kv-cache', 'fc-llm-topk-topp', 'fc-gen-reparameterization',
  'fc-gen-kl-divergence', 'fc-gen-diffusion', 'fc-rl-onpolicy-offpolicy', 'fc-rl-bellman',
  'fc-rl-ppo', 'fc-e2e-mlp-backprop', 'fc-e2e-transformer-components', 'fc-e2e-residual',
];

/** Lines outside fenced code blocks. */
function proseLines(md: string): string[] {
  const out: string[] = [];
  let inFence = false;
  for (const line of md.split('\n')) {
    if (line.startsWith('```')) { inFence = !inFence; continue; }
    if (!inFence) out.push(line);
  }
  return out;
}

describe('flash card deck', () => {
  it('has unique, stable ids', () => {
    const ids = flashCards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^fc-[a-z0-9-]+$/);
    for (const id of LEGACY_IDS) expect(ids).toContain(id);
  });

  it('covers every curriculum section', () => {
    const sectionIds = new Set(sections.map(s => s.id));
    for (const card of flashCards) expect(sectionIds).toContain(card.sectionId);
    for (const s of sections) {
      expect(flashCards.filter(c => c.sectionId === s.id).length, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps questions as plain text (they are not rendered as Markdown)', () => {
    for (const card of flashCards) {
      expect(card.question, card.id).not.toMatch(/`|\*\*|\$/);
      expect(card.question, card.id).toMatch(/[?.]$/);
    }
  });

  it('writes answers the flash-card Markdown renderer displays correctly', () => {
    for (const card of flashCards) {
      const { id, answer } = card;
      expect(answer.length, id).toBeLessThanOrEqual(800);
      // The answer styles give inline code padding and a background, which
      // misaligns the lines of a fenced block, so keep code inline.
      expect(answer, `${id}: fenced code block`).not.toMatch(/^```/m);
      const lines = proseLines(answer);
      // No GFM tables or LaTeX: the page uses react-markdown without remark-gfm or math plugins.
      expect(lines.some(l => /^\s*\|.*\|\s*$/.test(l)), `${id}: table`).toBe(false);
      expect(answer, `${id}: LaTeX`).not.toMatch(/\$[^$]+\$|\\frac|\\sum/);
      for (const l of lines) {
        expect((l.match(/`/g) ?? []).length % 2, `${id}: unbalanced backtick in "${l}"`).toBe(0);
      }
      // A single newline inside a paragraph is rendered as a space, so two
      // separate statements would run together. Only list items may follow
      // a line directly.
      for (let i = 1; i < lines.length; i++) {
        const prev = lines[i - 1];
        const line = lines[i];
        if (prev.trim() === '' || line.trim() === '') continue;
        expect(/^\s*(- |\d+\. )/.test(line), `${id}: line "${line}" would merge into the previous line`).toBe(true);
      }
    }
  });
});
