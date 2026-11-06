import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { track, trackOnce, trackVisit } from '../lib/analytics';
beforeEach(() => { localStorage.clear(); vi.stubEnv('DEV', false); window.gtag = vi.fn(); });
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); delete window.gtag; });
describe('activation measurement', () => {
  it('respects the analytics opt-out', () => {
    localStorage.setItem('mlgrind-analytics-disabled', 'true');
    track('code_run', { problem_id: 'numpy-array-sum' });
    expect(window.gtag).not.toHaveBeenCalled();
  });
  it('sends first milestones only once per browser', () => {
    const params = { problem_id: 'numpy-array-sum', section_id: 'python-basics' };
    trackOnce('first_run', params); trackOnce('first_run', params);
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith('event', 'first_run', params);
  });
  it('records a return only when the calendar date changes', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-05T10:00:00Z'));
    trackVisit(); trackVisit(); expect(window.gtag).not.toHaveBeenCalled();
    vi.setSystemTime(new Date('2026-11-06T10:00:00Z')); trackVisit();
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith('event', 'return_visit', {});
  });
});
