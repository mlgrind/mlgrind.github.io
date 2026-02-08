import { collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase';

export async function logSignIn(user: User): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, 'sign_ins'), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log sign-in:', error);
  }
}
