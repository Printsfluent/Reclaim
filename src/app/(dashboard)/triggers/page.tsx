"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTriggers, createTrigger, getCopingStrategies, createCopingStrategy,
} from "@/lib/firebase/firestore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DEFAULT_COPING_STRATEGIES } from "@/lib/constants";
import type { Trigger, CopingStrategy } from "@/lib/types";
import { Plus, Zap, Shield } from "lucide-react";

export default function TriggersPage() {
  const { user } = useAuth();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [strategies, setStrategies] = useState<CopingStrategy[]>([]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newStrategy, setNewStrategy] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);

  const load = () => {
    if (!user) return;
    getTriggers(user.uid).then(setTriggers);
    getCopingStrategies(user.uid).then(setStrategies);
  };

  useEffect(load, [user]);

  const handleAddTrigger = async () => {
    if (!user || !newTrigger.trim()) return;
    await createTrigger(user.uid, newTrigger, DEFAULT_COPING_STRATEGIES.slice(0, 3));
    setNewTrigger("");
    load();
  };

  const handleAddStrategy = async () => {
    if (!user || !newStrategy.trim()) return;
    await createCopingStrategy(user.uid, newStrategy);
    setNewStrategy("");
    load();
  };

  const suggestedStrategies = selectedTrigger
    ? [...selectedTrigger.copingStrategies, ...DEFAULT_COPING_STRATEGIES].slice(0, 5)
    : DEFAULT_COPING_STRATEGIES.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Trigger Management</h1>
        <p className="text-gray-500">Identify triggers and build coping strategies</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-orange-500" /> Your Triggers</CardTitle>
          </CardHeader>
          <div className="mb-4 flex gap-2">
            <Input placeholder="e.g. Stress, Loneliness" value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} />
            <Button onClick={handleAddTrigger}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">
            {triggers.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTrigger(t)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${selectedTrigger?.id === t.id ? "border-teal-500 bg-teal-50 dark:bg-teal-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
              >
                {t.name}
              </button>
            ))}
            {triggers.length === 0 && <p className="text-sm text-gray-500">No triggers added yet.</p>}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-teal-500" /> Coping Strategies</CardTitle>
          </CardHeader>
          <div className="mb-4 flex gap-2">
            <Input placeholder="e.g. Walk outside" value={newStrategy} onChange={(e) => setNewStrategy(e.target.value)} />
            <Button onClick={handleAddStrategy}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">
            {strategies.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-200 px-4 py-3 text-sm dark:border-gray-700">
                {s.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {selectedTrigger && (
        <Card gradient>
          <CardHeader>
            <CardTitle>Suggested Strategies for &ldquo;{selectedTrigger.name}&rdquo;</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {suggestedStrategies.map((s, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2 text-sm dark:bg-gray-800/60">
                <Shield className="h-4 w-4 shrink-0 text-teal-500" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
