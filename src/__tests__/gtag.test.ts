import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock firebase modules to prevent actual initialization
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
}));

import { gtagEvent, gtagSetUserId } from '../lib/firebase';

describe('gtagEvent', () => {
  let mockGtag: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGtag = vi.fn();
    window.gtag = mockGtag;
  });

  afterEach(() => {
    delete window.gtag;
  });

  it('should call window.gtag with event name and params', () => {
    gtagEvent('login', { method: 'google' });
    expect(mockGtag).toHaveBeenCalledWith('event', 'login', { method: 'google' });
  });

  it('should call window.gtag with event name only when no params', () => {
    gtagEvent('page_view');
    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', undefined);
  });

  it('should no-op when window.gtag is undefined', () => {
    delete window.gtag;
    expect(() => gtagEvent('login')).not.toThrow();
  });
});

describe('gtagSetUserId', () => {
  let mockGtag: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGtag = vi.fn();
    window.gtag = mockGtag;
  });

  afterEach(() => {
    delete window.gtag;
  });

  it('should call window.gtag set with user_id', () => {
    gtagSetUserId('user-123');
    expect(mockGtag).toHaveBeenCalledWith('set', { user_id: 'user-123' });
  });

  it('should call window.gtag set with null user_id on sign out', () => {
    gtagSetUserId(null);
    expect(mockGtag).toHaveBeenCalledWith('set', { user_id: null });
  });

  it('should no-op when window.gtag is undefined', () => {
    delete window.gtag;
    expect(() => gtagSetUserId('user-123')).not.toThrow();
  });
});
