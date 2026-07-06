"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getGoals, createGoal, updateGoalStatus } from "@/lib/firebase/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { RecoveryGoal } from "@/lib/types";
import { Plus, CheckCircle, XCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function GoalsPage() {
  const { user, refreshProfile } = useAuth();
  const [goals, setGoals] = useState<RecoveryGoal[]>([]);
  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    if (user) getGoals(user.uid).then(setGoals);
  };

  useEffect(load, [user]);

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    await createGoal(user.uid, title);
    setTitle("");
    setShowForm(false);
    load();
    await refreshProfile();
  };

  const handleStatus = async (id: string, status: RecoveryGoal["status"]) => {
    await updateGoalStatus(id, status);
    load();
    await refreshProfile();
  };

  const statusIcon = {
    active: <Target className="h-4 w-4 text-teal-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    missed: <XCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recovery Goals</h1>
          <p className="text-gray-500">Set milestones for your journey</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> New Goal</Button>
      </div>

      {showForm && (
        <Card>
          <div className="flex gap-2">
            <Input placeholder="e.g. Stay clean for 7 days" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button onClick={handleCreate}>Add</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {goals.length === 0 ? (
          <Card><p className="text-center text-gray-500">No goals yet. Create your first one!</p></Card>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcon[goal.status]}
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <span className={cn("text-xs capitalize", {
                      "text-teal-600": goal.status === "active",
                      "text-green-600": goal.status === "completed",
                      "text-red-600": goal.status === "missed",
                    })}>{goal.status}</span>
                  </div>
                </div>
                {goal.status === "active" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleStatus(goal.id, "completed")}>Complete</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleStatus(goal.id, "missed")}>Missed</Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
