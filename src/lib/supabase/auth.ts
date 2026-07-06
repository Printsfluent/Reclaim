import { getSupabaseClient } from "./client";
import { getUserProfile, createUserProfile } from "./database";

export async function signUpWithEmail(email: string, password: string, name: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, full_name: name } },
  });
  if (error) throw error;
  if (data.user) {
    await createUserProfile(data.user.id, name, data.user.email || email);
  }
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
}

export async function logOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function ensureUserProfile(userId: string, name: string, email: string) {
  const existing = await getUserProfile(userId);
  if (!existing) {
    await createUserProfile(userId, name, email);
  }
}

export { getUserProfile } from "./database";
