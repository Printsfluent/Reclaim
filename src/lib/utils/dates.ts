import { differenceInDays, differenceInHours, parseISO, format, startOfDay } from "date-fns";

export function getStreakFromDate(recoveryStartDate: string): { days: number; hours: number } {
  const start = parseISO(recoveryStartDate);
  const now = new Date();
  const days = Math.max(0, differenceInDays(now, start));
  const totalHours = Math.max(0, differenceInHours(now, start));
  const hours = totalHours % 24;
  return { days, hours };
}

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function todayKey(): string {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
}

export function calculateRecoveryScore(
  checkInCount: number,
  streakDays: number,
  completedGoals: number,
  totalGoals: number
): number {
  const checkInScore = Math.min(checkInCount * 5, 40);
  const streakScore = Math.min(streakDays * 2, 30);
  const goalScore = totalGoals > 0 ? (completedGoals / totalGoals) * 30 : 0;
  return Math.round(Math.min(100, checkInScore + streakScore + goalScore));
}
