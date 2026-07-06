"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/supabase/database";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  ADDICTION_OPTIONS, STRUGGLE_DURATION_OPTIONS, GOAL_TYPE_OPTIONS, APP_NAME,
} from "@/lib/constants";
import type { AddictionType, StruggleDuration, RecoveryGoalType } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [addictions, setAddictions] = useState<AddictionType[]>([]);
  const [duration, setDuration] = useState<StruggleDuration | "">("");
  const [goal, setGoal] = useState<RecoveryGoalType | "">("");
  const [loading, setLoading] = useState(false);

  const toggleAddiction = (value: AddictionType) => {
    setAddictions((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    const now = new Date().toISOString();
    await updateUserProfile(user.uid, {
      addictionTypes: addictions,
      struggleDuration: duration as StruggleDuration,
      goalType: goal as RecoveryGoalType,
      recoveryStartDate: now,
      onboardingComplete: true,
    });
    await refreshProfile();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-violet-50 px-4 py-12 dark:from-teal-950/30 dark:via-gray-900 dark:to-violet-950/30">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
            Welcome to {APP_NAME}
          </h1>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={cn("h-2 w-12 rounded-full transition-colors", s <= step ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700")} />
            ))}
          </div>
        </div>

        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>What addiction are you trying to overcome?</CardTitle>
                <CardDescription>Select all that apply</CardDescription>
              </CardHeader>
              <div className="grid grid-cols-2 gap-3">
                {ADDICTION_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleAddiction(value)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                      addictions.includes(value)
                        ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    )}
                  >
                    {addictions.includes(value) && <Check className="h-4 w-4" />}
                    {label}
                  </button>
                ))}
              </div>
              <Button className="mt-6 w-full" disabled={addictions.length === 0} onClick={() => setStep(2)}>
                Continue
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>How long have you been struggling?</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {STRUGGLE_DURATION_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDuration(value)}
                    className={cn(
                      "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                      duration === value
                        ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" disabled={!duration} onClick={() => setStep(3)}>Continue</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>What is your goal?</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {GOAL_TYPE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setGoal(value)}
                    className={cn(
                      "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                      goal === value
                        ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" disabled={!goal} onClick={() => setStep(4)}>Continue</Button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Your Recovery Plan</CardTitle>
                <CardDescription>Here&apos;s a summary of your personalized plan</CardDescription>
              </CardHeader>
              <div className="space-y-4 rounded-xl bg-gradient-to-br from-teal-50 to-violet-50 p-4 dark:from-teal-950/40 dark:to-violet-950/40">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Focus Areas</p>
                  <p className="mt-1 font-medium">
                    {addictions.map((a) => ADDICTION_OPTIONS.find((o) => o.value === a)?.label).join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Duration</p>
                  <p className="mt-1 font-medium">
                    {STRUGGLE_DURATION_OPTIONS.find((o) => o.value === duration)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Goal</p>
                  <p className="mt-1 font-medium">
                    {GOAL_TYPE_OPTIONS.find((o) => o.value === goal)?.label}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Your plan includes daily check-ins, streak tracking, journaling, trigger management, and access to our AI recovery coach and community.
              </p>
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                <Button className="flex-1" disabled={loading} onClick={handleComplete}>
                  {loading ? "Creating plan..." : "Start My Recovery"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
