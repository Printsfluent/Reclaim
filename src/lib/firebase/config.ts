import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey);
}

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

function initializeFirebase() {
  if (typeof window === "undefined") return;
  if (!firebaseConfig.apiKey) return;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  }
}

export function getAuthInstance(): Auth {
  initializeFirebase();
  if (!authInstance) {
    throw new Error("Firebase Auth is not configured. Check your environment variables.");
  }
  return authInstance;
}

export function getDbInstance(): Firestore {
  initializeFirebase();
  if (!dbInstance) {
    throw new Error("Firestore is not configured. Check your environment variables.");
  }
  return dbInstance;
}

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return Reflect.get(getAuthInstance(), prop);
  },
});

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    return Reflect.get(getDbInstance(), prop);
  },
});

export default app;
