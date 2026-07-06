"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertTriangle, Wind, Anchor, Heart, Plus } from "lucide-react";

export default function EmergencyPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [active, setActive] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [newReason, setNewReason] = useState("");

  const handleAddReason = async () => {
    if (!user || !profile || !newReason.trim()) return;
    await updateUserProfile(user.uid, {
      personalReasons: [...(profile.personalReasons || []), newReason.trim()],
    });
    setNewReason("");
    await refreshProfile();
  };

  if (active) {
    return (
      <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle>You&apos;re Going to Be Okay</CardTitle>
            <CardDescription>Take a moment. This feeling will pass.</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5 text-teal-500" /> Breathing Exercise</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-center py-8">
            <div className={`flex h-32 w-32 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 ${breathing ? "animate-breathe" : ""}`}>
              <span className="text-lg font-medium text-teal-700 dark:text-teal-300">
                {breathing ? "Breathe..." : "Ready?"}
              </span>
            </div>
            <Button className="mt-6" onClick={() => setBreathing(!breathing)}>
              {breathing ? "Stop" : "Start Breathing Exercise"}
            </Button>
            <p className="mt-4 text-sm text-gray-500">Breathe in for 4 seconds, hold for 4, exhale for 4.</p>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Anchor className="h-5 w-5 text-violet-500" /> Grounding Exercise (5-4-3-2-1)</CardTitle>
          </CardHeader>
          <ol className="space-y-2 text-sm">
            <li><strong>5</strong> things you can see</li>
            <li><strong>4</strong> things you can touch</li>
            <li><strong>3</strong> things you can hear</li>
            <li><strong>2</strong> things you can smell</li>
            <li><strong>1</strong> thing you can taste</li>
          </ol>
        </Card>

        <Card gradient>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> Your Reasons for Quitting</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {(profile?.personalReasons || []).map((reason, i) => (
              <li key={i} className="rounded-lg bg-white/60 px-4 py-2 text-sm dark:bg-gray-800/60">{reason}</li>
            ))}
            {(!profile?.personalReasons || profile.personalReasons.length === 0) && (
              <p className="text-sm text-gray-500">Add your personal reasons below to see them here during tough moments.</p>
            )}
          </ul>
          <div className="mt-4 flex gap-2">
            <Input placeholder="e.g. For my family" value={newReason} onChange={(e) => setNewReason(e.target.value)} />
            <Button onClick={handleAddReason}><Plus className="h-4 w-4" /></Button>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recovery Reminders</CardTitle></CardHeader>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Cravings typically last 15-20 minutes. You can get through this.</li>
            <li>You&apos;ve already proven you can overcome difficult moments.</li>
            <li>Reach out to someone you trust if you need support.</li>
            <li>This craving is temporary. Your recovery is permanent.</li>
          </ul>
        </Card>

        <Button variant="outline" className="w-full" onClick={() => { setActive(false); setBreathing(false); }}>
          I&apos;m Feeling Better
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center animate-fade-in">
      <AlertTriangle className="mb-6 h-16 w-16 text-amber-500" />
      <h1 className="mb-2 text-2xl font-bold text-center">Emergency Support</h1>
      <p className="mb-8 max-w-md text-center text-gray-500">
        If you&apos;re experiencing strong cravings, tap the button below for immediate support tools.
      </p>
      <Button size="lg" variant="danger" className="px-12 py-6 text-lg" onClick={() => setActive(true)}>
        I&apos;m Having Strong Cravings
      </Button>
    </div>
  );
}
