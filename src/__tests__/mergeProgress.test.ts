import { describe, expect, it } from 'vitest';
import { mergeProgress } from '../lib/mergeProgress';
import type { Progress, ProblemProgress } from '../types';

const at = (problem: ProblemProgress): Progress => ({ cnn: { 'max-pool': problem } });
const merged = (local: ProblemProgress, cloud: ProblemProgress) =>
  mergeProgress(at(local), at(cloud)).cnn['max-pool'];

describe('mergeProgress with PyTorch track fields', () => {
  it('leaves old-schema entries exactly as before', () => {
    const local = { status: 'in_progress' as const, code: 'local', lastAttempt: '2026-02-01T00:00:00Z' };
    const cloud = { status: 'completed' as const, code: 'cloud', lastAttempt: '2026-01-01T00:00:00Z' };
    expect(merged(local, cloud)).toEqual(cloud);
    expect(merged(cloud, local)).toEqual(cloud);
  });

  it('takes PyTorch code from the more recent side, even when the other side wins on status', () => {
    const local = { status: 'in_progress' as const, code: 'np local', codes: { pytorch: 'torch new' }, lastAttempt: '2026-03-02T00:00:00Z' };
    const cloud = { status: 'completed' as const, code: 'np cloud', codes: { pytorch: 'torch old' }, solvedIn: ['numpy' as const], lastAttempt: '2026-03-01T00:00:00Z' };
    expect(merged(local, cloud)).toEqual({
      status: 'completed', code: 'np cloud', lastAttempt: '2026-03-01T00:00:00Z',
      codes: { pytorch: 'torch new' }, solvedIn: ['numpy'],
    });
  });

  it('keeps PyTorch code that only one side has, including an empty editor', () => {
    const local = { status: 'in_progress' as const, codes: { pytorch: '' }, lastAttempt: '2026-03-01T00:00:00Z' };
    const cloud = { status: 'in_progress' as const, code: 'np', lastAttempt: '2026-03-05T00:00:00Z' };
    expect(merged(local, cloud)).toEqual({ ...cloud, codes: { pytorch: '' } });
  });

  it('unions solvedIn in canonical order', () => {
    const local = { status: 'completed' as const, solvedIn: ['pytorch' as const], lastAttempt: '2026-03-02T00:00:00Z' };
    const cloud = { status: 'completed' as const, solvedIn: ['numpy' as const], lastAttempt: '2026-03-01T00:00:00Z' };
    expect(merged(local, cloud).solvedIn).toEqual(['numpy', 'pytorch']);
  });

  it('ignores malformed track fields from the cloud', () => {
    const local = { status: 'in_progress' as const, lastAttempt: '2026-03-01T00:00:00Z' };
    const cloud = { status: 'in_progress', lastAttempt: '2026-03-02T00:00:00Z', codes: { pytorch: 42, jax: 'x' }, solvedIn: ['cobol', 'pytorch'] } as unknown as ProblemProgress;
    expect(merged(local, cloud)).toEqual({ status: 'in_progress', lastAttempt: '2026-03-02T00:00:00Z', solvedIn: ['pytorch'] });
  });
});
