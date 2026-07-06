"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayCheckIn, getGoals } from "@/lib/supabase/database";
import { getStreakFromDate } from "@/lib/utils/dates";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Flame, Trophy, TrendingUp, CalendarCheck } from "lucide-react";
import type { DailyCheckIn, RecoveryGoal } from "@/lib/types";
import { MOOD_OPTIONS, DEFAULT_MOTIVATIONAL_CONTENT } from "@/lib/constants";
import { InAppNotifications } from "@/components/dashboard/InAppNotifications";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [checkIn, setCheckIn] = useState<DailyCheckIn | null>(null);
  const [goals, setGoals] = useState<RecoveryGoal[]>([]);
  const [quote] = useState(() => {
    const quotes = DEFAULT_MOTIVATIONAL_CONTENT.filter((c) => c.type === "quote");
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  useEffect(() => {
    if (!user) return;
    getTodayCheckIn(user.uid).then(setCheckIn);
    getGoals(user.uid).then(setGoals);
  }, [user]);

  if (!profile) return null;

  const { days, hours } = getStreakFromDate(profile.recoveryStartDate);
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile.name.split(" ")[0]}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Keep going — every day matters.</p>
      </div>

      <InAppNotifications />

      <Card gradient className="relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-200/30 dark:bg-teal-800/20" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Recovery Streak
          </CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-600">{days}</p>
            <p className="text-xs text-gray-500">Days Clean</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-violet-600">{hours}</p>
            <p className="text-xs text-gray-500">Hours Clean</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">{profile.currentStreak || days}</p>
            <p className="text-xs text-gray-500">Current Streak</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-500">{profile.longestStreak}</p>
            <p className="text-xs text-gray-500">Longest Streak</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-violet-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (days / 30) * 100)}%` }}
          />
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-teal-500" />
              Recovery Score
            </CardTitle>
          </CardHeader>
          <div className="flex items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                  strokeDasharray={`${profile.recoveryScore * 2.64} 264`}
                  className="text-teal-500 transition-all duration-700"
                />
              </svg>
              <span className="absolute text-2xl font-bold">{profile.recoveryScore}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-4 w-4 text-violet-500" />
              Today&apos;s Check-In
            </CardTitle>
          </CardHeader>
          {checkIn ? (
            <div className="space-y-2">
              <p className="text-sm">
                Mood: {MOOD_OPTIONS.find((m) => m.value === checkIn.mood)?.emoji}{" "}
                {MOOD_OPTIONS.find((m) => m.value === checkIn.mood)?.label}
              </p>
              <p className="text-sm text-gray-500">
                Cravings: {checkIn.hadCravings ? "Yes" : "No"}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm text-gray-500">You haven&apos;t checked in today yet.</p>
              <Link href="/check-in"><Button size="sm">Check In Now</Button></Link>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-amber-500" />
              Goals
            </CardTitle>
          </CardHeader>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-teal-600">{activeGoals}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
          <Link href="/goals" className="mt-3 inline-block text-sm text-teal-600 hover:underline">Manage goals</Link>
        </Card>
      </div>

      <Card>
        <CardDescription>Daily Inspiration</CardDescription>
        <blockquote className="mt-2 text-lg italic text-gray-700 dark:text-gray-300">
          &ldquo;{quote.content}&rdquo;
        </blockquote>
        {quote.author && <p className="mt-2 text-sm text-gray-500">— {quote.author}</p>}
      </Card>

      <Disclaimer compact />
    </div>
  );
}
