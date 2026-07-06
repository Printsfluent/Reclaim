import { PROFANITY_LIST } from "@/lib/constants";

export function sanitizeInput(input: string, maxLength = 5000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

export function filterProfanity(text: string): string {
  let filtered = text;
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  }
  return filtered;
}

export function generateAnonymousName(): string {
  const adjectives = ["Brave", "Calm", "Hopeful", "Strong", "Gentle"];
  const nouns = ["Soul", "Path", "Heart", "Spirit", "Journey"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}
