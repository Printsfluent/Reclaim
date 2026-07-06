"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createCheckIn, getTodayCheckIn, logRelapse } from "@/lib/firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Input";
import { MOOD_OPTIONS, RELAPSE_SUPPORT_MESSAGE } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import type { Mood } from "@/lib/types";
import { todayKey } from "@/lib/utils/dates";

export default function CheckInPage() {
  const { user, refreshProfile } = useAuth();
  const [mood, setMood] = useState<Mood | "">("");
  const [hadCravings, setHadCravings] = useState<boolean | null>(null);
  const [triggers, setTriggers] = useState("");
  const [relapsed, setRelapsed] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showRelapseForm, setShowRelapseForm] = useState(false);
  const [relapseTrigger, setRelapseTrigger] = useState("");
  const [relapseCircumstances, setRelapseCircumstances] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  useEffect(() => {
    if (!user) return;
    getTodayCheckIn(user.uid).then((ci) => {
      if (ci) {
        setAlreadyCheckedIn(true);
        setMood(ci.mood);
        setHadCravings(ci.hadCravings);
        setTriggers(ci.triggers.join(", "));
        setRelapsed(ci.relapsed);
        setNotes(ci.notes);
        setSubmitted(true);
      }
    });
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !mood || hadCravings === null || relapsed === null) return;
    setLoading(true);
    await createCheckIn(user.uid, {
      date: todayKey(),
      mood,
      hadCravings,
      triggers: triggers ? triggers.split(",").map((t) => t.trim()).filter(Boolean) : [],
      relapsed,
      notes,
    });
    if (relapsed) setShowRelapseForm(true);
    setSubmitted(true);
    setLoading(false);
    await refreshProfile();
  };

  const handleRelapseLog = async () => {
    if (!user) return;
    setLoading(true);
    await logRelapse(user.uid, relapseTrigger, relapseCircumstances);
    setShowRelapseForm(false);
    setLoading(false);
    await refreshProfile();
  };

  if (showRelapseForm) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>We&apos;re Here For You</CardTitle>
            <CardDescription>{RELAPSE_SUPPORT_MESSAGE}</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input placeholder="What triggered the relapse?" value={relapseTrigger} onChange={(e) => setRelapseTrigger(e.target.value)} />
            <Textarea placeholder="Describe the circumstances..." rows={4} value={relapseCircumstances} onChange={(e) => setRelapseCircumstances(e.target.value)} />
            <Button className="w-full" onClick={handleRelapseLog} disabled={loading}>
              {loading ? "Saving..." : "Log & Continue"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Daily Check-In</h1>
        <p className="text-gray-500">Take a moment to reflect on how you&apos;re doing today.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. How are you feeling?</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          {MOOD_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              disabled={alreadyCheckedIn}
              onClick={() => setMood(value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 transition-all",
                mood === value ? "border-teal-500 bg-teal-50 dark:bg-teal-950" : "border-gray-200 dark:border-gray-700",
                alreadyCheckedIn && "opacity-60"
              )}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Did you experience cravings?</CardTitle></CardHeader>
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <Button key={String(val)} variant={hadCravings === val ? "primary" : "outline"} disabled={alreadyCheckedIn} onClick={() => setHadCravings(val)}>
              {val ? "Yes" : "No"}
            </Button>
          ))}
        </div>
      </Card>

      {hadCravings && (
        <Card>
          <CardHeader><CardTitle>3. What triggered them?</CardTitle></CardHeader>
          <Input placeholder="e.g. Stress, loneliness, social event" value={triggers} onChange={(e) => setTriggers(e.target.value)} disabled={alreadyCheckedIn} />
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{hadCravings ? "4" : "3"}. Did you relapse?</CardTitle></CardHeader>
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <Button key={String(val)} variant={relapsed === val ? "primary" : "outline"} disabled={alreadyCheckedIn} onClick={() => setRelapsed(val)}>
              {val ? "Yes" : "No"}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Any notes?</CardTitle></CardHeader>
        <Textarea placeholder="Write anything you'd like to remember..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={alreadyCheckedIn} />
      </Card>

      {!alreadyCheckedIn && (
        <Button className="w-full" size="lg" disabled={!mood || hadCravings === null || relapsed === null || loading} onClick={handleSubmit}>
          {loading ? "Saving..." : "Submit Check-In"}
        </Button>
      )}

      {submitted && !showRelapseForm && (
        <div className="rounded-xl bg-green-50 p-4 text-center text-green-700 dark:bg-green-950 dark:text-green-300">
          Check-in saved! Great job taking care of yourself today.
        </div>
      )}
    </div>
  );
}
