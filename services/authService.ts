// services/authService.ts

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
} from "firebase/auth";

import { auth } from "./firebase";
import { projectService } from "./projectService";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  /* -------------------- AUTH STATE -------------------- */

  onChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (user) => {
      callback(user);

      // 🔐 IMPORTANT: refresh task list when user changes
      projectService.clearUserTasks();
    });
  },

  /* -------------------- SIGN UP -------------------- */

  async signUp(email: string, password: string, displayName?: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    return cred.user;
  },

  /* -------------------- SIGN IN -------------------- */

  async signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  /* -------------------- GOOGLE SIGN IN -------------------- */

  async signInWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);

    const info = getAdditionalUserInfo(cred);
    if (info?.isNewUser && cred.user.displayName) {
      await updateProfile(cred.user, {
        displayName: cred.user.displayName,
      });
    }

    return cred.user;
  },

  /* -------------------- LOGOUT (CRITICAL FIX) -------------------- */

  async logout() {
    await firebaseSignOut(auth);

    // ✅ CLEAR PREVIOUS USER DATA (FIXES DATA LEAK)
    projectService.clearUserTasks();
  },
};
