import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(2000),
  })).max(20),
  userContext: z.object({
    name: z.string().optional(),
    addictionTypes: z.array(z.string()).optional(),
    goalType: z.string().optional(),
    currentStreak: z.number().optional(),
  }).optional(),
});

const SYSTEM_PROMPT = `You are a supportive AI recovery coach for RecoveryHub, an addiction recovery platform.

Your approach:
- Use motivational interviewing techniques
- Be warm, empathetic, and non-judgmental
- Encourage reflection with open-ended questions
- Celebrate progress and small wins
- Help users identify triggers and coping strategies
- Support goal setting and tracking

Strict rules:
- NEVER diagnose any condition
- NEVER prescribe medication or medical treatment
- NEVER claim to replace professional help
- ALWAYS recommend professional help for serious crises
- If user mentions self-harm or suicide, immediately provide crisis resources (988 Suicide & Crisis Lifeline)
- Keep responses concise (2-4 paragraphs max)
- Remind users you are an AI support tool, not a medical professional when appropriate`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({
      message: "I'm here to support you. While my full AI capabilities aren't configured yet, remember: every step forward counts. What's on your mind today?",
    });
  }

  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { messages, userContext } = parsed.data;
    const contextNote = userContext
      ? `\nUser context: Name: ${userContext.name || "User"}, Addictions: ${userContext.addictionTypes?.join(", ") || "not specified"}, Goal: ${userContext.goalType || "not specified"}, Current streak: ${userContext.currentStreak ?? 0} days.`
      : "";

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextNote },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      return NextResponse.json({ error: "Failed to generate response" }, { status: 502 });
    }

    const completion = (await groqRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const message =
      completion.choices?.[0]?.message?.content ||
      "I'm here for you. Tell me more about how you're feeling.";

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
