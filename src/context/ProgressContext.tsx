import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Language, Progress, ProblemStatus } from '../types';
import { useAuth } from './AuthContext';
import { loadProgressFromFirestore, saveProgressToFirestore } from '../lib/firestoreSync';
import { readProgress, sanitizeSolvedIn, writeStorage } from '../lib/storage';
import { mergeProgress } from '../lib/mergeProgress';

const STORAGE_KEY = 'ml-interview-progress';
const DEBOUNCE_MS = 2000;

interface ProgressContextType {
  progress: Progress;
  isSyncing: boolean;
  storageError: boolean;
  syncError: boolean;
  /** With a language, a 'completed' status also records the track in solvedIn. */
  updateProblemStatus: (sectionId: string, problemId: string, status: ProblemStatus, language?: Language) => void;
  /** NumPy code is stored as `code`, other tracks under `codes[language]`. */
  saveProblemCode: (sectionId: string, problemId: string, code: string, language?: Language) => void;
  getProblemProgress: (sectionId: string, problemId: string) => {
    status: ProblemStatus;
    code?: string;
    codes: { pytorch?: string };
    solvedIn: Language[];
  };
  getSectionProgress: (sectionId: string, totalProblems: number) => number;
  getOverallProgress: (sections: { id: string; problemCount: number }[]) => number;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [storageError, setStorageError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const [syncError, setSyncError] = useState(false);

  // Persist to localStorage on every change
  useEffect(() => {
    setStorageError(!writeStorage(STORAGE_KEY, JSON.stringify(progress)));
  }, [progress]);

  // Read and merge before enabling writes. A slow/failed read must never let
  // the debounce upload an empty or stale local snapshot over cloud progress.
  useEffect(() => {
    let cancelled = false;
    setLoadedUid(null);
    setSyncError(false);
    if (!user) {
      setIsSyncing(false);
      return;
    }
    const uid = user.uid;
    setIsSyncing(true);
    loadProgressFromFirestore(uid)
      .then(cloud => {
        if (cancelled) return;
        setProgress(local => cloud ? mergeProgress(local, cloud) : local);
        setLoadedUid(uid);
      })
      .catch(() => { if (!cancelled) setSyncError(true); })
      .finally(() => { if (!cancelled) setIsSyncing(false); });
    return () => { cancelled = true; };
  }, [user]);

  // Debounced Firestore write when progress changes while logged in
  useEffect(() => {
    if (!user || loadedUid !== user.uid) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      saveProgressToFirestore(user.uid, progress, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }).catch(console.error);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [progress, user, loadedUid]);

  const updateProblemStatus = useCallback((
    sectionId: string,
    problemId: string,
    status: ProblemStatus,
    language?: Language,
  ) => {
    setProgress(prev => {
      const current = prev[sectionId]?.[problemId];
      const solvedIn = current?.solvedIn ?? [];
      const addTrack = status === 'completed' && language && !solvedIn.includes(language);
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          [problemId]: {
            ...current,
            status,
            ...(addTrack ? { solvedIn: sanitizeSolvedIn([...solvedIn, language]) } : {}),
            lastAttempt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const saveProblemCode = useCallback((
    sectionId: string,
    problemId: string,
    code: string,
    language: Language = 'numpy',
  ) => {
    setProgress(prev => {
      const current = prev[sectionId]?.[problemId];
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          [problemId]: {
            ...current,
            status: current?.status || 'in_progress',
            ...(language === 'numpy'
              ? { code }
              : { codes: { ...current?.codes, [language]: code } }),
            lastAttempt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const getProblemProgress = useCallback((sectionId: string, problemId: string) => {
    const problemProgress = progress[sectionId]?.[problemId];
    return {
      status: problemProgress?.status || 'not_started',
      code: problemProgress?.code,
      codes: problemProgress?.codes ?? {},
      solvedIn: problemProgress?.solvedIn ?? [],
    };
  }, [progress]);

  const getSectionProgress = useCallback((sectionId: string, totalProblems: number) => {
    const sectionProgress = progress[sectionId];
    if (!sectionProgress || totalProblems === 0) return 0;

    const completedCount = Object.values(sectionProgress).filter(
      p => p.status === 'completed'
    ).length;

    return Math.round((completedCount / totalProblems) * 100);
  }, [progress]);

  const getOverallProgress = useCallback((sections: { id: string; problemCount: number }[]) => {
    const totalProblems = sections.reduce((sum, s) => sum + s.problemCount, 0);
    if (totalProblems === 0) return 0;

    let completedCount = 0;
    for (const section of sections) {
      const sectionProgress = progress[section.id];
      if (sectionProgress) {
        completedCount += Object.values(sectionProgress).filter(
          p => p.status === 'completed'
        ).length;
      }
    }

    return Math.round((completedCount / totalProblems) * 100);
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress({});
    writeStorage(STORAGE_KEY, '{}');

    if (user) {
      saveProgressToFirestore(user.uid, {}, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }).catch(console.error);
    }
  }, [user]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isSyncing,
        storageError,
        syncError,
        updateProblemStatus,
        saveProblemCode,
        getProblemProgress,
        getSectionProgress,
        getOverallProgress,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
