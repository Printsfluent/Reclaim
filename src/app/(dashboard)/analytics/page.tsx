"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCheckIns, getRelapses } from "@/lib/firebase/firestore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DailyCheckIn } from "@/lib/types";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const moodScore: Record<string, number> = { great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };

export default function AnalyticsPage() {
  const { user, profile } = useAuth();
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [relapseCount, setRelapseCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getCheckIns(user.uid, 30).then(setCheckIns);
    getRelapses(user.uid).then((r) => setRelapseCount(r.length));
  }, [user]);

  const sorted = [...checkIns].reverse();
  const labels = sorted.map((c) => c.date.slice(5));

  const moodData = {
    labels,
    datasets: [{
      label: "Mood",
      data: sorted.map((c) => moodScore[c.mood] || 3),
      borderColor: "rgb(20, 184, 166)",
      backgroundColor: "rgba(20, 184, 166, 0.1)",
      fill: true,
      tension: 0.4,
    }],
  };

  const cravingData = {
    labels,
    datasets: [{
      label: "Cravings",
      data: sorted.map((c) => c.hadCravings ? 1 : 0),
      backgroundColor: "rgba(139, 92, 246, 0.7)",
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500">Track your recovery trends over time</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-2xl font-bold text-teal-600">{checkIns.length}</p><p className="text-sm text-gray-500">Total Check-Ins</p></Card>
        <Card><p className="text-2xl font-bold text-violet-600">{profile?.longestStreak || 0}</p><p className="text-sm text-gray-500">Longest Streak (days)</p></Card>
        <Card><p className="text-2xl font-bold text-amber-600">{relapseCount}</p><p className="text-sm text-gray-500">Relapses Logged</p></Card>
      </div>

      {sorted.length > 0 ? (
        <>
          <Card>
            <CardHeader><CardTitle>Mood Trends</CardTitle></CardHeader>
            <Line data={moodData} options={chartOptions} />
          </Card>
          <Card>
            <CardHeader><CardTitle>Craving Trends</CardTitle></CardHeader>
            <Bar data={cravingData} options={chartOptions} />
          </Card>
        </>
      ) : (
        <Card><p className="text-center text-gray-500">Complete daily check-ins to see your analytics.</p></Card>
      )}
    </div>
  );
}
