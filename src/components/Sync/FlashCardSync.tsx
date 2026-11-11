import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getFlashCardProgress,
  mergeFlashCardProgress,
  replaceFlashCardProgress,
  subscribeFlashCardProgress,
} from '../../hooks/useFlashCards';
import { loadFlashCardsFromFirestore, saveFlashCardsToFirestore } from '../../lib/firestoreSync';

const DEBOUNCE_MS = 2000;

/**
 * Syncs flash-card review state to users/{uid}.flashcards while signed in.
 * Reads and merges first (most recent review per card wins), then uploads
 * changes with a debounce, the same way problem progress syncs.
 */
export default function FlashCardSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let cancelled = false;
    let ready = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const save = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        saveFlashCardsToFirestore(uid, getFlashCardProgress()).catch(console.error);
      }, DEBOUNCE_MS);
    };

    const unsubscribe = subscribeFlashCardProgress(() => {
      if (ready) save();
    });

    loadFlashCardsFromFirestore(uid)
      .then(cloud => {
        if (cancelled) return;
        const local = getFlashCardProgress();
        const merged = cloud ? mergeFlashCardProgress(local, cloud) : local;
        ready = true;
        if (merged !== local) replaceFlashCardProgress(merged);
        // Upload when the cloud copy is missing or behind this browser.
        if (!cloud || JSON.stringify(merged) !== JSON.stringify(cloud)) save();
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  return null;
}
