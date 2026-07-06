"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Disclaimer } from "@/components/ui/Disclaimer";
import type { ChatMessage } from "@/lib/types";
import { Send, Bot, User } from "lucide-react";

export default function CoachPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your recovery coach. I'm here to support you with encouragement, reflection, and goal tracking. How are you feeling today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
          userContext: {
            name: profile?.name,
            addictionTypes: profile?.addictionTypes,
            goalType: profile?.goalType,
            currentStreak: profile?.currentStreak,
          },
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message, timestamp: new Date().toISOString() }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Remember: you're doing great, and support is always available.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Recovery Coach</h1>
        <p className="text-gray-500">Supportive guidance for your journey</p>
      </div>

      <Disclaimer compact />

      <Card className="mt-4 flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-teal-100 dark:bg-teal-900" : "bg-violet-100 dark:bg-violet-900"}`}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-teal-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm dark:bg-gray-800">Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="flex gap-2">
            <Textarea
              placeholder="Share how you're feeling..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              className="min-h-[44px] resize-none"
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
