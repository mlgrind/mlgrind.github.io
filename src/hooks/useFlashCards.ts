import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { FlashCardProgress } from '../types';
import { flashCards } from '../data/flashcards';
import { readStorage, writeStorage } from '../lib/storage';

const STORAGE_KEY = 'ml-grind-flashcard-progress';

type FlashProgress = Record<string, FlashCardProgress>;

function loadProgress(): FlashProgress {
  try {
    const saved = readStorage(STORAGE_KEY);
    const value: unknown = saved ? JSON.parse(saved) : {};
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as FlashProgress) : {};
  } catch {
    return {};
  }
}

// One store shared by every component that uses the hook, so reviewing a card
// on the flash cards page updates the header badge and the home dashboard
// without a reload. Other tabs are picked up through the storage event.
let current: FlashProgress | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): FlashProgress {
  if (current === null) current = loadProgress();
  return current;
}

function setProgress(next: FlashProgress) {
  current = next;
  writeStorage(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    current = loadProgress();
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Current review state (for cloud sync). */
export function getFlashCardProgress(): FlashProgress {
  return getSnapshot();
}

/** Replace the review state, e.g. after merging with the cloud copy. */
export function replaceFlashCardProgress(next: FlashProgress) {
  setProgress(next);
}

/** Subscribe to review-state changes outside React (cloud sync). */
export function subscribeFlashCardProgress(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const reviewedAt = (p: FlashCardProgress) => p.lastReviewed ?? p.nextReview ?? '';

/** Per card, keep whichever copy was reviewed most recently. */
export function mergeFlashCardProgress(local: FlashProgress, cloud: FlashProgress): FlashProgress {
  const merged: FlashProgress = { ...cloud };
  for (const [id, entry] of Object.entries(local)) {
    const other = merged[id];
    if (!other || reviewedAt(entry) >= reviewedAt(other)) merged[id] = entry;
  }
  return merged;
}

/** Test helper: forget the cached snapshot so the next read comes from storage. */
export function resetFlashCardStore() {
  current = null;
}

function nextState(existing: FlashCardProgress | undefined, cardId: string, correct: boolean): FlashCardProgress {
  let ease: number;
  let interval: number;
  let repetitions: number;

  if (!existing) {
    ease = 2.5;
    interval = 1;
    repetitions = correct ? 1 : 0;
  } else if (correct) {
    ease = Math.min(existing.ease + 0.1, 3.0);
    repetitions = existing.repetitions + 1;
    if (existing.repetitions === 0) interval = 1;
    else if (existing.repetitions === 1) interval = 3;
    else interval = Math.round(existing.interval * existing.ease);
  } else {
    ease = Math.max(existing.ease - 0.2, 1.3);
    interval = 1;
    repetitions = 0;
  }

  return {
    cardId,
    ease,
    interval,
    repetitions,
    nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString(),
    lastReviewed: new Date().toISOString(),
  };
}

export function useFlashCards() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const reviewCard = useCallback((cardId: string, correct: boolean) => {
    const prev = getSnapshot();
    setProgress({ ...prev, [cardId]: nextState(prev[cardId], cardId, correct) });
  }, []);

  /** Cards to study now: never-seen cards plus reviewed cards whose interval has passed. */
  const getDueCards = useCallback((sectionId?: string) => {
    const now = new Date().toISOString();
    const cards = sectionId ? flashCards.filter(c => c.sectionId === sectionId) : flashCards;
    return cards.filter(card => {
      const p = progress[card.id];
      if (!p) return true;
      return p.nextReview <= now;
    });
  }, [progress]);

  const getDueCount = useCallback((sectionId?: string) => getDueCards(sectionId).length, [getDueCards]);

  /**
   * Cards the learner has reviewed before and that are due again. This is what
   * the badges show: a first-time visitor has nothing "due", only new cards.
   */
  const getReviewDueCount = useCallback(() => {
    const now = new Date().toISOString();
    return flashCards.filter(card => {
      const p = progress[card.id];
      return p !== undefined && p.nextReview <= now;
    }).length;
  }, [progress]);

  const reviewedCount = useMemo(
    () => flashCards.filter(card => progress[card.id] !== undefined).length,
    [progress],
  );

  return {
    progress,
    reviewCard,
    getDueCards,
    getDueCount,
    getReviewDueCount,
    /** Number of distinct cards reviewed at least once. */
    reviewedCount,
    hasStarted: reviewedCount > 0,
    allCards: flashCards,
  };
}
