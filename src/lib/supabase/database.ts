import { getSupabaseClient } from "./client";
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

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
  addiction_types: UserProfile["addictionTypes"];
  struggle_duration: UserProfile["struggleDuration"] | null;
  goal_type: UserProfile["goalType"] | null;
  recovery_start_date: string;
  timezone: string;
  onboarding_complete: boolean;
  role: UserProfile["role"];
  notification_settings: UserProfile["notificationSettings"];
  personal_reasons: string[];
  longest_streak: number;
  current_streak: number;
  recovery_score: number;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  return {
    uid: row.id,
    name: row.name,
    email: row.email,
    photoURL: row.photo_url || undefined,
    addictionTypes: row.addiction_types || [],
    struggleDuration: row.struggle_duration || undefined,
    goalType: row.goal_type || undefined,
    recoveryStartDate: row.recovery_start_date,
    timezone: row.timezone,
    onboardingComplete: row.onboarding_complete,
    role: row.role,
    notificationSettings: row.notification_settings,
    personalReasons: row.personal_reasons || [],
    longestStreak: row.longest_streak,
    currentStreak: row.current_streak,
    recoveryScore: row.recovery_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function profileUpdates(data: Partial<UserProfile>): Record<string, unknown> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.name !== undefined) updates.name = data.name;
  if (data.email !== undefined) updates.email = data.email;
  if (data.photoURL !== undefined) updates.photo_url = data.photoURL;
  if (data.addictionTypes !== undefined) updates.addiction_types = data.addictionTypes;
  if (data.struggleDuration !== undefined) updates.struggle_duration = data.struggleDuration;
  if (data.goalType !== undefined) updates.goal_type = data.goalType;
  if (data.recoveryStartDate !== undefined) updates.recovery_start_date = data.recoveryStartDate;
  if (data.timezone !== undefined) updates.timezone = data.timezone;
  if (data.onboardingComplete !== undefined) updates.onboarding_complete = data.onboardingComplete;
  if (data.role !== undefined) updates.role = data.role;
  if (data.notificationSettings !== undefined) updates.notification_settings = data.notificationSettings;
  if (data.personalReasons !== undefined) updates.personal_reasons = data.personalReasons;
  if (data.longestStreak !== undefined) updates.longest_streak = data.longestStreak;
  if (data.currentStreak !== undefined) updates.current_streak = data.currentStreak;
  if (data.recoveryScore !== undefined) updates.recovery_score = data.recoveryScore;
  return updates;
}

export async function createUserProfile(userId: string, name: string, email: string) {
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    name,
    email,
    addiction_types: [],
    recovery_start_date: now,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    onboarding_complete: false,
    role: "user",
    notification_settings: {
      dailyCheckIn: true,
      goalReminders: true,
      motivationReminders: true,
    },
    personal_reasons: [],
    longest_streak: 0,
    current_streak: 0,
    recovery_score: 0,
    created_at: now,
    updated_at: now,
  });
  if (error) throw error;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update(profileUpdates(data))
    .eq("id", userId);
  if (error) throw error;
}

export async function getTodayCheckIn(userId: string): Promise<DailyCheckIn | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("date", todayKey())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    mood: data.mood,
    hadCravings: data.had_cravings,
    triggers: data.triggers || [],
    relapsed: data.relapsed,
    notes: data.notes || "",
    createdAt: data.created_at,
  };
}

export async function createCheckIn(
  userId: string,
  data: Omit<DailyCheckIn, "id" | "userId" | "createdAt">
) {
  const supabase = getSupabaseClient();
  const { data: row, error } = await supabase
    .from("daily_checkins")
    .insert({
      user_id: userId,
      date: data.date,
      mood: data.mood,
      had_cravings: data.hadCravings,
      triggers: data.triggers.map(sanitizeInput),
      relapsed: data.relapsed,
      notes: sanitizeInput(data.notes),
    })
    .select("id")
    .single();
  if (error) throw error;
  await refreshRecoveryScore(userId);
  return row.id as string;
}

export async function getCheckIns(userId: string, max = 30): Promise<DailyCheckIn[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(max);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    mood: row.mood,
    hadCravings: row.had_cravings,
    triggers: row.triggers || [],
    relapsed: row.relapsed,
    notes: row.notes || "",
    createdAt: row.created_at,
  }));
}

export async function logRelapse(userId: string, trigger: string, circumstances: string) {
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error("Profile not found");

  const { error: relapseError } = await supabase.from("relapses").insert({
    user_id: userId,
    trigger: sanitizeInput(trigger),
    circumstances: sanitizeInput(circumstances),
    logged_at: now,
  });
  if (relapseError) throw relapseError;

  const longest = Math.max(profile.currentStreak, profile.longestStreak);
  await updateUserProfile(userId, {
    recoveryStartDate: now,
    currentStreak: 0,
    longestStreak: longest,
  });
}

export async function getRelapses(userId: string): Promise<Relapse[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("relapses")
    .select("*")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    trigger: row.trigger,
    circumstances: row.circumstances,
    loggedAt: row.logged_at,
  }));
}

export async function createJournalEntry(userId: string, title: string, content: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: userId,
      title: sanitizeInput(title, 200),
      content: sanitizeInput(content),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateJournalEntry(id: string, title: string, content: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("journal_entries")
    .update({
      title: sanitizeInput(title, 200),
      content: sanitizeInput(content),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteJournalEntry(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) throw error;
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createGoal(userId: string, title: string, description?: string, targetDays?: number) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("recovery_goals")
    .insert({
      user_id: userId,
      title: sanitizeInput(title, 200),
      description: description ? sanitizeInput(description) : "",
      target_days: targetDays || null,
      status: "active",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateGoalStatus(id: string, status: RecoveryGoal["status"]) {
  const supabase = getSupabaseClient();
  const updates: Record<string, string> = { status };
  if (status === "completed") updates.completed_at = new Date().toISOString();
  const { error } = await supabase.from("recovery_goals").update(updates).eq("id", id);
  if (error) throw error;
}

export async function getGoals(userId: string): Promise<RecoveryGoal[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("recovery_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || undefined,
    targetDays: row.target_days || undefined,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at || undefined,
  }));
}

export async function createTrigger(userId: string, name: string, copingStrategies: string[]) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("triggers")
    .insert({
      user_id: userId,
      name: sanitizeInput(name, 100),
      coping_strategies: copingStrategies.map((s) => sanitizeInput(s, 200)),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function getTriggers(userId: string): Promise<Trigger[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("triggers")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    copingStrategies: row.coping_strategies || [],
    createdAt: row.created_at,
  }));
}

export async function createCopingStrategy(userId: string, name: string, description?: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("coping_strategies")
    .insert({
      user_id: userId,
      name: sanitizeInput(name, 100),
      description: description ? sanitizeInput(description) : "",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function getCopingStrategies(userId: string): Promise<CopingStrategy[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("coping_strategies")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || undefined,
    createdAt: row.created_at,
  }));
}

export async function createCommunityPost(
  userId: string,
  anonymousName: string,
  content: string,
  type: CommunityPost["type"]
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: userId,
      anonymous_name: sanitizeInput(anonymousName, 50),
      content: sanitizeInput(content),
      type,
      report_count: 0,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function getCommunityPosts(max = 50): Promise<CommunityPost[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(max);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    anonymousName: row.anonymous_name,
    content: row.content,
    type: row.type,
    reportCount: row.report_count,
    createdAt: row.created_at,
  }));
}

export async function reportPost(postId: string, reporterId: string, reason: string) {
  const supabase = getSupabaseClient();
  const { error: reportError } = await supabase.from("reports").insert({
    post_id: postId,
    reporter_id: reporterId,
    reason: sanitizeInput(reason, 500),
  });
  if (reportError) throw reportError;

  const { error: rpcError } = await supabase.rpc("increment_report_count", {
    post_id: postId,
  });
  if (rpcError) throw rpcError;
}

export async function deleteCommunityPost(postId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("community_posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function refreshRecoveryScore(userId: string) {
  const checkIns = await getCheckIns(userId, 100);
  const goals = await getGoals(userId);
  const profile = await getUserProfile(userId);
  if (!profile) return;

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
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return (data || []).map((row) => mapProfile(row as ProfileRow));
}

export async function getReports(): Promise<
  Array<{ id: string; postId: string; reporterId: string; reason: string; createdAt: string }>
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    postId: row.post_id,
    reporterId: row.reporter_id,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}
