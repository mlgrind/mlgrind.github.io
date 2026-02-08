import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Progress } from '../types';

interface UserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export async function loadProgressFromFirestore(uid: string): Promise<Progress | null> {
  if (!db) return null;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data().progress as Progress) ?? null;
}

export async function saveProgressToFirestore(
  uid: string,
  progress: Progress,
  userInfo: UserInfo,
): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    displayName: userInfo.displayName,
    email: userInfo.email,
    photoURL: userInfo.photoURL,
    lastSynced: new Date().toISOString(),
    progress,
  }, { merge: true });
}
