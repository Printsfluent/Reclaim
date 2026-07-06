"use client";

import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ADDICTION_OPTIONS } from "@/lib/constants";
import { Bell } from "lucide-react";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();

  if (!profile) return null;

  const toggleNotification = async (key: keyof typeof profile.notificationSettings) => {
    if (!user) return;
    await updateUserProfile(user.uid, {
      notificationSettings: {
        ...profile.notificationSettings,
        [key]: !profile.notificationSettings[key],
      },
    });
    await refreshProfile();
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <dl className="space-y-3 text-sm">
          <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{profile.name}</dd></div>
          <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{profile.email}</dd></div>
          <div><dt className="text-gray-500">Timezone</dt><dd className="font-medium">{profile.timezone}</dd></div>
          <div>
            <dt className="text-gray-500">Addictions</dt>
            <dd className="font-medium">
              {profile.addictionTypes.map((a) => ADDICTION_OPTIONS.find((o) => o.value === a)?.label).join(", ") || "None set"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {([
            ["dailyCheckIn", "Daily check-in reminders"],
            ["goalReminders", "Goal reminders"],
            ["motivationReminders", "Motivation reminders"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <button
                onClick={() => toggleNotification(key)}
                className={`relative h-6 w-11 rounded-full transition-colors ${profile.notificationSettings[key] ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${profile.notificationSettings[key] ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
