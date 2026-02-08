import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase.ts before importing signInLogger
const mockAddDoc = vi.fn();
const mockCollection = vi.fn();

vi.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
}));

// Start with db = null (unconfigured)
let mockDb: object | null = null;
vi.mock('../lib/firebase', () => ({
  get db() {
    return mockDb;
  },
}));

import { logSignIn } from '../lib/signInLogger';

function createMockUser(overrides = {}) {
  return {
    uid: 'test-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    ...overrides,
  } as import('firebase/auth').User;
}

describe('logSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = null;
  });

  it('should no-op when db is null', async () => {
    mockDb = null;
    await logSignIn(createMockUser());

    expect(mockAddDoc).not.toHaveBeenCalled();
    expect(mockCollection).not.toHaveBeenCalled();
  });

  it('should log sign-in data to Firestore when db is configured', async () => {
    mockDb = { type: 'firestore' };
    const collectionRef = { id: 'sign_ins' };
    mockCollection.mockReturnValue(collectionRef);
    mockAddDoc.mockResolvedValue({ id: 'doc-id' });

    const user = createMockUser();
    await logSignIn(user);

    expect(mockCollection).toHaveBeenCalledWith(mockDb, 'sign_ins');
    expect(mockAddDoc).toHaveBeenCalledWith(collectionRef, {
      uid: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      timestamp: expect.any(String),
      userAgent: navigator.userAgent,
    });
  });

  it('should log ISO timestamp', async () => {
    mockDb = { type: 'firestore' };
    mockCollection.mockReturnValue({});
    mockAddDoc.mockResolvedValue({ id: 'doc-id' });

    await logSignIn(createMockUser());

    const loggedData = mockAddDoc.mock.calls[0][1];
    // Verify it's a valid ISO string
    expect(() => new Date(loggedData.timestamp)).not.toThrow();
    expect(new Date(loggedData.timestamp).toISOString()).toBe(loggedData.timestamp);
  });

  it('should handle null user fields gracefully', async () => {
    mockDb = { type: 'firestore' };
    mockCollection.mockReturnValue({});
    mockAddDoc.mockResolvedValue({ id: 'doc-id' });

    const user = createMockUser({
      email: null,
      displayName: null,
      photoURL: null,
    });
    await logSignIn(user);

    const loggedData = mockAddDoc.mock.calls[0][1];
    expect(loggedData.email).toBeNull();
    expect(loggedData.displayName).toBeNull();
    expect(loggedData.photoURL).toBeNull();
  });

  it('should not throw when Firestore write fails', async () => {
    mockDb = { type: 'firestore' };
    mockCollection.mockReturnValue({});
    mockAddDoc.mockRejectedValue(new Error('Firestore write failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(logSignIn(createMockUser())).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to log sign-in:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
