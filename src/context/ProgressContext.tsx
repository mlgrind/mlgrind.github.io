import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Progress, ProblemStatus } from '../types';
import { useAuth } from './AuthContext';
import { loadProgressFromFirestore, saveProgressToFirestore } from '../lib/firestoreSync';
import { mergeProgress } from '../lib/mergeProgress';

const STORAGE_KEY = 'ml-interview-progress';
const DEBOUNCE_MS = 2000;

interface ProgressContextType {
  progress: Progress;
  isSyncing: boolean;
  updateProblemStatus: (sectionId: string, problemId: string, status: ProblemStatus) => void;
  saveProblemCode: (sectionId: string, problemId: string, code: string) => void;
  getProblemProgress: (sectionId: string, problemId: string) => { status: ProblemStatus; code?: string };
  getSectionProgress: (sectionId: string, totalProblems: number) => number;
  getOverallProgress: (sections: { id: string; problemCount: number }[]) => number;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const prevUid = useRef<string | null>(null);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // On login: merge local + cloud, save merged to both
  useEffect(() => {
    const uid = user?.uid ?? null;

    if (uid && uid !== prevUid.current) {
      setIsSyncing(true);
      loadProgressFromFirestore(uid)
        .then((cloud) => {
          setProgress((local) => {
            const merged = cloud ? mergeProgress(local, cloud) : local;

            // Save merged back to Firestore
            saveProgressToFirestore(uid, merged, {
              displayName: user!.displayName,
              email: user!.email,
              photoURL: user!.photoURL,
            }).catch(console.error);

            return merged;
          });
        })
        .catch(console.error)
        .finally(() => setIsSyncing(false));
    }

    prevUid.current = uid;
  }, [user]);

  // Debounced Firestore write when progress changes while logged in
  useEffect(() => {
    if (!user) return;

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
  }, [progress, user]);

  const updateProblemStatus = useCallback((sectionId: string, problemId: string, status: ProblemStatus) => {
    setProgress(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [problemId]: {
          ...prev[sectionId]?.[problemId],
          status,
          lastAttempt: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const saveProblemCode = useCallback((sectionId: string, problemId: string, code: string) => {
    setProgress(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [problemId]: {
          ...prev[sectionId]?.[problemId],
          status: prev[sectionId]?.[problemId]?.status || 'in_progress',
          code,
          lastAttempt: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const getProblemProgress = useCallback((sectionId: string, problemId: string) => {
    const problemProgress = progress[sectionId]?.[problemId];
    return {
      status: problemProgress?.status || 'not_started',
      code: problemProgress?.code,
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
    localStorage.removeItem(STORAGE_KEY);

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
