import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // (Data Pot & Riwayat)
import { getDatabase } from "firebase/database"; // (real-time dari ESP32)

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Pola Singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const realtimeDb = getDatabase(app);

export { app, db, realtimeDb };
