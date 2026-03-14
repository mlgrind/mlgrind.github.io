import { useState, useCallback, useMemo } from 'react';
import { FlashCardProgress } from '../types';
import { flashCards } from '../data/flashcards';

const STORAGE_KEY = 'ml-grind-flashcard-progress';

function loadProgress(): Record<string, FlashCardProgress> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, FlashCardProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useFlashCards() {
  const [progress, setProgress] = useState<Record<string, FlashCardProgress>>(loadProgress);

  const reviewCard = useCallback((cardId: string, correct: boolean) => {
    setProgress(prev => {
      const existing = prev[cardId];
      const now = new Date().toISOString();

      let ease: number;
      let interval: number;
      let repetitions: number;

      if (!existing) {
        // First review
        ease = 2.5;
        interval = correct ? 1 : 1;
        repetitions = correct ? 1 : 0;
      } else if (correct) {
        ease = Math.min(existing.ease + 0.1, 3.0);
        repetitions = existing.repetitions + 1;
        if (existing.repetitions === 0) {
          interval = 1;
        } else if (existing.repetitions === 1) {
          interval = 3;
        } else {
          interval = Math.round(existing.interval * existing.ease);
        }
      } else {
        // Incorrect: reset
        ease = Math.max(existing.ease - 0.2, 1.3);
        interval = 1;
        repetitions = 0;
      }

      const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString();

      const updated = {
        ...prev,
        [cardId]: { cardId, ease, interval, nextReview, repetitions, lastReviewed: now },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const getDueCards = useCallback((sectionId?: string) => {
    const now = new Date().toISOString();
    const cards = sectionId
      ? flashCards.filter(c => c.sectionId === sectionId)
      : flashCards;

    return cards.filter(card => {
      const p = progress[card.id];
      if (!p) return true; // Never reviewed = due
      return p.nextReview <= now;
    });
  }, [progress]);

  const getDueCount = useCallback((sectionId?: string) => {
    return getDueCards(sectionId).length;
  }, [getDueCards]);

  const allCards = useMemo(() => flashCards, []);

  return { progress, reviewCard, getDueCards, getDueCount, allCards };
}
