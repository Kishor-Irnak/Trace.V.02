import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

const AUTH_STORAGE_KEY = "trace_auth_user";

export const authService = {
  /**
   * 🔔 Global auth listener (syncs all tabs)
   */
  onChange(callback: (user: User | null) => void) {
    // Firebase auth listener
    const unsubFirebase = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ uid: user.uid })
        );
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      callback(user);
    });

    // 🔔 Multi-tab logout/login sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY && !e.newValue) {
        callback(null); // logged out in another tab
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      unsubFirebase();
      window.removeEventListener("storage", handleStorage);
    };
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
    return cred.user;
  },

  /**
   * 🚪 Logout everywhere (all tabs, all windows)
   */
  async signOut() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    await firebaseSignOut(auth);
  },

  /**
   * 🔐 Get current user UID safely
   */
  getUID() {
    return auth.currentUser?.uid || null;
  },
};
