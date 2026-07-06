"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { DEFAULT_MOTIVATIONAL_CONTENT } from "@/lib/constants";
import { Quote, Lightbulb, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

function getDailyContent() {
  const day = new Date().getDate();
  const quotes = DEFAULT_MOTIVATIONAL_CONTENT.filter((c) => c.type === "quote");
  const tips = DEFAULT_MOTIVATIONAL_CONTENT.filter((c) => c.type === "tip");
  const reminders = DEFAULT_MOTIVATIONAL_CONTENT.filter((c) => c.type === "reminder");
  return {
    quote: quotes[day % quotes.length],
    tip: tips[day % tips.length],
    reminder: reminders[day % reminders.length],
  };
}

export default function MotivationPage() {
  const [content, setContent] = useState(getDailyContent);

  const refresh = () => {
    const all = DEFAULT_MOTIVATIONAL_CONTENT;
    setContent({
      quote: all.filter((c) => c.type === "quote")[Math.floor(Math.random() * 3)],
      tip: all.filter((c) => c.type === "tip")[Math.floor(Math.random() * 3)],
      reminder: all.filter((c) => c.type === "reminder")[Math.floor(Math.random() * 3)],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Motivation Center</h1>
          <p className="text-gray-500">Daily inspiration for your recovery</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>

      <Card gradient>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Quote className="h-5 w-5 text-violet-500" /> Daily Quote</CardTitle>
        </CardHeader>
        <blockquote className="text-lg italic">&ldquo;{content.quote.content}&rdquo;</blockquote>
        {content.quote.author && <p className="mt-2 text-sm text-gray-500">— {content.quote.author}</p>}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /> Recovery Tip</CardTitle>
        </CardHeader>
        <p>{content.tip.content}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-teal-500" /> Success Reminder</CardTitle>
        </CardHeader>
        <p>{content.reminder.content}</p>
      </Card>
    </div>
  );
}
