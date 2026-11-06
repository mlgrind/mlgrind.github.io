import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { Progress } from '../types';
const state = vi.hoisted(() => ({
  user: null as { uid: string; displayName: string; email: string; photoURL: null } | null,
  load: vi.fn(), save: vi.fn(async () => {}),
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('../lib/firestoreSync', () => ({ loadProgressFromFirestore: state.load, saveProgressToFirestore: state.save }));
import { ProgressProvider, useProgress } from '../context/ProgressContext';
const wrapper = ({ children }: { children: ReactNode }) => <ProgressProvider>{children}</ProgressProvider>;
const cloud: Progress = { 'python-basics': { 'numpy-array-sum': { status: 'completed', code: 'return np.sum(arr)', lastAttempt: '2026-02-08T10:00:00Z' } } };
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); vi.useFakeTimers(); state.user = { uid: 'existing-user', displayName: 'Test User', email: 'test@example.invalid', photoURL: null }; });
afterEach(() => { cleanup(); vi.useRealTimers(); state.user = null; });
describe('cloud progress protection', () => {
  it('waits for a slow cloud read and merges edits made while loading before writing', async () => {
    let finish!: (progress: Progress) => void;
    state.load.mockReturnValue(new Promise<Progress>(resolve => { finish = resolve; }));
    const { result } = renderHook(useProgress, { wrapper });
    act(() => { result.current.saveProblemCode('python-basics', 'numpy-matrix-multiply', 'new draft'); vi.advanceTimersByTime(5000); });
    expect(state.save).not.toHaveBeenCalled();
    await act(async () => finish(cloud));
    act(() => vi.advanceTimersByTime(2000));
    expect(state.save).toHaveBeenCalledOnce();
    const saved = state.save.mock.calls[0] as unknown as [string, Progress];
    expect(saved[1]['python-basics']['numpy-array-sum']).toEqual(cloud['python-basics']['numpy-array-sum']);
    expect(saved[1]['python-basics']['numpy-matrix-multiply'].code).toBe('new draft');
  });
  it('does not overwrite cloud data when the initial read fails', async () => {
    state.load.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(useProgress, { wrapper });
    await act(async () => {});
    act(() => { result.current.saveProblemCode('python-basics', 'numpy-array-sum', 'local draft'); vi.advanceTimersByTime(5000); });
    expect(result.current.syncError).toBe(true);
    expect(state.save).not.toHaveBeenCalled();
  });
  it('ignores an old cloud response after sign-out', async () => {
    let finish!: (progress: Progress) => void;
    state.load.mockReturnValue(new Promise<Progress>(resolve => { finish = resolve; }));
    const { result, rerender } = renderHook(useProgress, { wrapper });
    state.user = null; rerender();
    await act(async () => finish(cloud));
    expect(result.current.progress).toEqual({});
    expect(state.save).not.toHaveBeenCalled();
  });
});
