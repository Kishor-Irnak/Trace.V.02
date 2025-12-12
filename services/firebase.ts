import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase config must be public in client apps. Prefer env, but fall back to
// the provided demo project so GitHub Pages preview does not break.
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyD4y-0QZLN6Q5wFDoTxIaxR-_hcPWyDcto",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trace-6f541.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://trace-6f541-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trace-6f541",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "trace-6f541.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "30992363510",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:30992363510:web:5b61c6861fbcad776121d7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BPT24QMGP5",
};

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn(
    "Firebase config falling back to demo project. Set VITE_FIREBASE_* in .env.local for production."
  );
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
