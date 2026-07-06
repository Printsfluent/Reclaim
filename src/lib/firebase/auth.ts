import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";
import type { UserProfile } from "@/lib/types";

const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail(email: string, password: string, name: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await createUserProfile(credential.user, name);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const existing = await getUserProfile(credential.user.uid);
  if (!existing) {
    await createUserProfile(credential.user, credential.user.displayName || "User");
  }
  return credential.user;
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logOut() {
  return signOut(auth);
}

async function createUserProfile(user: User, name: string) {
  const now = new Date().toISOString();
  const profile: UserProfile = {
    uid: user.uid,
    name,
    email: user.email || "",
    photoURL: user.photoURL || undefined,
    addictionTypes: [],
    recoveryStartDate: now,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    onboardingComplete: false,
    role: "user",
    notificationSettings: {
      dailyCheckIn: true,
      goalReminders: true,
      motivationReminders: true,
    },
    personalReasons: [],
    longestStreak: 0,
    currentStreak: 0,
    recoveryScore: 0,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, "users", user.uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}
