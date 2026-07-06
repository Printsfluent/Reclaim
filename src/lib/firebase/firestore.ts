import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./config";
import type {
  DailyCheckIn,
  JournalEntry,
  RecoveryGoal,
  Relapse,
  Trigger,
  CopingStrategy,
  CommunityPost,
  UserProfile,
} from "@/lib/types";
import { sanitizeInput } from "@/lib/utils/sanitize";
import { todayKey, calculateRecoveryScore } from "@/lib/utils/dates";

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: new Date().toISOString() });
}

export async function getTodayCheckIn(userId: string): Promise<DailyCheckIn | null> {
  const q = query(
    collection(db, "daily_checkins"),
    where("userId", "==", userId),
    where("date", "==", todayKey()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as DailyCheckIn;
}

export async function createCheckIn(
  userId: string,
  data: Omit<DailyCheckIn, "id" | "userId" | "createdAt">
) {
  const docRef = await addDoc(collection(db, "daily_checkins"), {
    userId,
    ...data,
    notes: sanitizeInput(data.notes),
    triggers: data.triggers.map(sanitizeInput),
    createdAt: new Date().toISOString(),
  });
  await refreshRecoveryScore(userId);
  return docRef.id;
}

export async function getCheckIns(userId: string, max = 30): Promise<DailyCheckIn[]> {
  const q = query(
    collection(db, "daily_checkins"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DailyCheckIn);
}

export async function logRelapse(userId: string, trigger: string, circumstances: string) {
  const now = new Date().toISOString();
  await addDoc(collection(db, "relapses"), {
    userId,
    trigger: sanitizeInput(trigger),
    circumstances: sanitizeInput(circumstances),
    loggedAt: now,
  });
  const profile = (await getDoc(doc(db, "users", userId))).data() as UserProfile;
  const longest = Math.max(profile.currentStreak, profile.longestStreak);
  await updateUserProfile(userId, {
    recoveryStartDate: now,
    currentStreak: 0,
    longestStreak: longest,
  });
}

export async function getRelapses(userId: string): Promise<Relapse[]> {
  const q = query(
    collection(db, "relapses"),
    where("userId", "==", userId),
    orderBy("loggedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Relapse);
}

export async function createJournalEntry(userId: string, title: string, content: string) {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, "journal_entries"), {
    userId,
    title: sanitizeInput(title, 200),
    content: sanitizeInput(content),
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateJournalEntry(id: string, title: string, content: string) {
  await updateDoc(doc(db, "journal_entries", id), {
    title: sanitizeInput(title, 200),
    content: sanitizeInput(content),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteJournalEntry(id: string) {
  await deleteDoc(doc(db, "journal_entries", id));
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const q = query(
    collection(db, "journal_entries"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JournalEntry);
}

export async function createGoal(userId: string, title: string, description?: string, targetDays?: number) {
  const docRef = await addDoc(collection(db, "recovery_goals"), {
    userId,
    title: sanitizeInput(title, 200),
    description: description ? sanitizeInput(description) : "",
    targetDays: targetDays || null,
    status: "active",
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateGoalStatus(id: string, status: RecoveryGoal["status"]) {
  const updates: Record<string, string> = { status };
  if (status === "completed") updates.completedAt = new Date().toISOString();
  await updateDoc(doc(db, "recovery_goals", id), updates);
}

export async function getGoals(userId: string): Promise<RecoveryGoal[]> {
  const q = query(
    collection(db, "recovery_goals"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RecoveryGoal);
}

export async function createTrigger(userId: string, name: string, copingStrategies: string[]) {
  const docRef = await addDoc(collection(db, "triggers"), {
    userId,
    name: sanitizeInput(name, 100),
    copingStrategies: copingStrategies.map((s) => sanitizeInput(s, 200)),
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getTriggers(userId: string): Promise<Trigger[]> {
  const q = query(collection(db, "triggers"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Trigger);
}

export async function createCopingStrategy(userId: string, name: string, description?: string) {
  const docRef = await addDoc(collection(db, "coping_strategies"), {
    userId,
    name: sanitizeInput(name, 100),
    description: description ? sanitizeInput(description) : "",
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getCopingStrategies(userId: string): Promise<CopingStrategy[]> {
  const q = query(collection(db, "coping_strategies"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CopingStrategy);
}

export async function createCommunityPost(
  userId: string,
  anonymousName: string,
  content: string,
  type: CommunityPost["type"]
) {
  const docRef = await addDoc(collection(db, "community_posts"), {
    userId,
    anonymousName: sanitizeInput(anonymousName, 50),
    content: sanitizeInput(content),
    type,
    reportCount: 0,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getCommunityPosts(max = 50): Promise<CommunityPost[]> {
  const q = query(
    collection(db, "community_posts"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunityPost);
}

export async function reportPost(postId: string, reporterId: string, reason: string) {
  await addDoc(collection(db, "reports"), {
    postId,
    reporterId,
    reason: sanitizeInput(reason, 500),
    createdAt: new Date().toISOString(),
  });
  const postRef = doc(db, "community_posts", postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const current = postSnap.data().reportCount || 0;
    await updateDoc(postRef, { reportCount: current + 1 });
  }
}

export async function deleteCommunityPost(postId: string) {
  await deleteDoc(doc(db, "community_posts", postId));
}

export async function getMotivationalContent() {
  const q = query(collection(db, "motivational_content"), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function refreshRecoveryScore(userId: string) {
  const checkIns = await getCheckIns(userId, 100);
  const goals = await getGoals(userId);
  const profile = (await getDoc(doc(db, "users", userId))).data() as UserProfile;
  const { getStreakFromDate } = await import("@/lib/utils/dates");
  const { days } = getStreakFromDate(profile.recoveryStartDate);
  const completed = goals.filter((g) => g.status === "completed").length;
  const score = calculateRecoveryScore(checkIns.length, days, completed, goals.length);
  const longest = Math.max(days, profile.longestStreak);
  await updateUserProfile(userId, {
    recoveryScore: score,
    currentStreak: days,
    longestStreak: longest,
  });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function getReports(): Promise<Array<{ id: string; postId: string; reporterId: string; reason: string; createdAt: string }>> {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{ id: string; postId: string; reporterId: string; reason: string; createdAt: string }>;
}
