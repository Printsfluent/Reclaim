"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { Bell, CalendarCheck, Target, Heart } from "lucide-react";
import Link from "next/link";

export function InAppNotifications() {
  const { profile } = useAuth();
  if (!profile) return null;

  const reminders = [];
  if (profile.notificationSettings.dailyCheckIn) {
    reminders.push({ icon: CalendarCheck, text: "Don't forget your daily check-in!", href: "/check-in" });
  }
  if (profile.notificationSettings.goalReminders) {
    reminders.push({ icon: Target, text: "Review your recovery goals today.", href: "/goals" });
  }
  if (profile.notificationSettings.motivationReminders) {
    reminders.push({ icon: Heart, text: "Visit the Motivation Center for today's inspiration.", href: "/motivation" });
  }

  if (reminders.length === 0) return null;

  return (
    <Card className="border-teal-200 bg-teal-50/50 dark:border-teal-800 dark:bg-teal-950/30">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-teal-600" />
        <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Reminders</span>
      </div>
      <ul className="space-y-2">
        {reminders.map(({ icon: Icon, text, href }) => (
          <li key={href}>
            <Link href={href} className="flex items-center gap-2 text-sm text-teal-700 hover:underline dark:text-teal-300">
              <Icon className="h-4 w-4 shrink-0" />
              {text}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
