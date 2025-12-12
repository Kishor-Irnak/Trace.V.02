import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  onChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async signUp(email: string, password: string, displayName?: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  },

  async signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  async signInWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const info = getAdditionalUserInfo(cred);
    if (info?.isNewUser && cred.user.displayName && cred.user.email) {
      // Profile already populated for Google accounts; nothing else required here.
    }
    return cred.user;
  },

  async signOut() {
    await firebaseSignOut(auth);
  },
};

