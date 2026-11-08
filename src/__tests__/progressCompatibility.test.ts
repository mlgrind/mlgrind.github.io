import { beforeEach, describe, expect, it } from 'vitest';
import { allProblems } from '../data/problems';
import { readProgress } from '../lib/storage';
import type { Progress } from '../types';
beforeEach(() => localStorage.clear());
describe('existing deployment compatibility', () => {
  it('preserves the old persisted schema for every existing exercise and takes a raw backup', () => {
    const old: Progress = {};
    allProblems.forEach((problem, index) => {
      old[problem.section] ??= {};
      old[problem.section][problem.id] = { status: index % 2 ? 'completed' : 'in_progress', code: index % 3 ? problem.solution : '', lastAttempt: '2026-02-08T12:00:00Z' };
    });
    const raw = JSON.stringify(old);
    localStorage.setItem('ml-interview-progress', raw);
    expect(readProgress()).toEqual(old);
    expect(localStorage.getItem('ml-interview-progress-backup-v1')).toBe(raw);
    localStorage.setItem('ml-interview-progress', '{}'); readProgress();
    expect(localStorage.getItem('ml-interview-progress-backup-v1')).toBe(raw);
  });
  it('loads PyTorch track fields and drops malformed ones', () => {
    const stored = {
      cnn: {
        'max-pool': { status: 'completed', code: 'np', codes: { pytorch: 'torch', jax: 'x' }, solvedIn: ['pytorch', 'numpy', 'cobol'], lastAttempt: '2026-03-01T00:00:00Z' },
        'flatten-layer': { status: 'in_progress', codes: { pytorch: 7 }, solvedIn: 'pytorch' },
        'conv2d-forward': { status: 'in_progress', codes: null, solvedIn: [] },
      },
    };
    localStorage.setItem('ml-interview-progress', JSON.stringify(stored));
    expect(readProgress()).toEqual({
      cnn: {
        'max-pool': { status: 'completed', code: 'np', codes: { pytorch: 'torch' }, solvedIn: ['numpy', 'pytorch'], lastAttempt: '2026-03-01T00:00:00Z' },
        'flatten-layer': { status: 'in_progress' },
        'conv2d-forward': { status: 'in_progress' },
      },
    });
  });
  it('backs up malformed historical data before recovery', () => {
    localStorage.setItem('ml-interview-progress', '{damaged');
    expect(readProgress()).toEqual({});
    expect(localStorage.getItem('ml-interview-progress-backup-v1')).toBe('{damaged');
  });
});
