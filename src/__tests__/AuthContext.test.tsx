import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

// --- Mocks ---

const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockFirebaseSignOut = vi.fn();
const mockLogEvent = vi.fn();
const mockSetUserId = vi.fn();
const mockLogSignIn = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
}));

vi.mock('firebase/analytics', () => ({
  logEvent: (...args: unknown[]) => mockLogEvent(...args),
  setUserId: (...args: unknown[]) => mockSetUserId(...args),
}));

let mockAuth: object | null = {};
let mockGoogleProvider: object | null = {};
let mockIsConfigured = true;
let mockAnalytics: object | null = {};

vi.mock('../lib/firebase', () => ({
  get auth() { return mockAuth; },
  get googleProvider() { return mockGoogleProvider; },
  get isConfigured() { return mockIsConfigured; },
  get analytics() { return mockAnalytics; },
}));

vi.mock('../lib/signInLogger', () => ({
  logSignIn: (...args: unknown[]) => mockLogSignIn(...args),
}));

import { AuthProvider, useAuth } from '../context/AuthContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

function createMockUser(uid = 'user-123') {
  return { uid, email: 'test@example.com', displayName: 'Test' };
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = { type: 'auth' };
    mockGoogleProvider = { providerId: 'google.com' };
    mockIsConfigured = true;
    mockAnalytics = { type: 'analytics' };

    // Default: onAuthStateChanged calls callback with null immediately, returns unsubscribe
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return vi.fn();
    });
  });

  describe('initialization', () => {
    it('should start loading when firebase is configured', () => {
      mockOnAuthStateChanged.mockImplementation(() => vi.fn());

      const { result } = renderHook(() => useAuth(), { wrapper });
      // loading is set to isConfigured initially (true), then false after onAuthStateChanged fires
      // Since we didn't fire the callback, it stays loading
      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('should not be loading when firebase is not configured', () => {
      mockAuth = null;
      mockIsConfigured = false;

      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should set user from onAuthStateChanged callback', async () => {
      const mockUser = createMockUser();
      mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        callback(mockUser);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBe(mockUser);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should call setUserId with user uid when analytics is available', async () => {
      const mockUser = createMockUser('uid-456');
      mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        callback(mockUser);
        return vi.fn();
      });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockSetUserId).toHaveBeenCalledWith(mockAnalytics, 'uid-456');
      });
    });

    it('should call setUserId with null when user signs out', async () => {
      mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        callback(null);
        return vi.fn();
      });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockSetUserId).toHaveBeenCalledWith(mockAnalytics, null);
      });
    });

    it('should not call setUserId when analytics is null', async () => {
      mockAnalytics = null;
      const mockUser = createMockUser();
      mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        callback(mockUser);
        return vi.fn();
      });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockSetUserId).not.toHaveBeenCalled();
      });
    });

    it('should unsubscribe from auth state on unmount', () => {
      const unsubscribe = vi.fn();
      mockOnAuthStateChanged.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useAuth(), { wrapper });
      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('signInWithGoogle', () => {
    it('should call signInWithPopup and logSignIn on success', async () => {
      const mockUser = createMockUser();
      mockSignInWithPopup.mockResolvedValue({ user: mockUser });
      mockLogSignIn.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockSignInWithPopup).toHaveBeenCalledWith(mockAuth, mockGoogleProvider);
      expect(mockLogSignIn).toHaveBeenCalledWith(mockUser);
    });

    it('should log analytics event on successful sign-in', async () => {
      const mockUser = createMockUser();
      mockSignInWithPopup.mockResolvedValue({ user: mockUser });
      mockLogSignIn.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockLogEvent).toHaveBeenCalledWith(mockAnalytics, 'login', { method: 'google' });
    });

    it('should not log analytics event when analytics is null', async () => {
      mockAnalytics = null;
      const mockUser = createMockUser();
      mockSignInWithPopup.mockResolvedValue({ user: mockUser });
      mockLogSignIn.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockLogEvent).not.toHaveBeenCalled();
    });

    it('should handle sign-in failure gracefully', async () => {
      mockSignInWithPopup.mockRejectedValue(new Error('Popup closed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Google sign-in failed:', expect.any(Error));
      expect(mockLogSignIn).not.toHaveBeenCalled();
      expect(mockLogEvent).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should no-op when auth is null', async () => {
      mockAuth = null;

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockSignInWithPopup).not.toHaveBeenCalled();
    });

    it('should no-op when googleProvider is null', async () => {
      mockGoogleProvider = null;

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockSignInWithPopup).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should call firebaseSignOut', async () => {
      mockFirebaseSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockFirebaseSignOut).toHaveBeenCalledWith(mockAuth);
    });

    it('should no-op when auth is null', async () => {
      mockAuth = null;

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockFirebaseSignOut).not.toHaveBeenCalled();
    });
  });

  describe('useAuth', () => {
    it('should throw when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});
