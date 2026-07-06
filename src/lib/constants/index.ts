import type { AddictionType, Mood, StruggleDuration, RecoveryGoalType } from "@/lib/types";

export const APP_NAME = "RecoveryHub";

export const DISCLAIMER =
  "RecoveryHub is not a medical provider and does not offer medical advice, diagnosis, or treatment. If you are in crisis, please contact emergency services or a licensed healthcare professional.";

export const ADDICTION_OPTIONS: { value: AddictionType; label: string }[] = [
  { value: "alcohol", label: "Alcohol" },
  { value: "drugs", label: "Drugs" },
  { value: "smoking", label: "Smoking" },
  { value: "gambling", label: "Gambling" },
  { value: "porn", label: "Porn" },
  { value: "social_media", label: "Social Media" },
  { value: "gaming", label: "Gaming" },
  { value: "shopping", label: "Shopping" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
];

export const STRUGGLE_DURATION_OPTIONS: { value: StruggleDuration; label: string }[] = [
  { value: "less_than_6_months", label: "Less than 6 months" },
  { value: "6_months_to_1_year", label: "6 months to 1 year" },
  { value: "1_to_3_years", label: "1-3 years" },
  { value: "3_to_5_years", label: "3-5 years" },
  { value: "more_than_5_years", label: "More than 5 years" },
];

export const GOAL_TYPE_OPTIONS: { value: RecoveryGoalType; label: string }[] = [
  { value: "quit_completely", label: "Quit completely" },
  { value: "reduce_usage", label: "Reduce usage" },
  { value: "build_habits", label: "Build healthier habits" },
];

export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: "great", label: "Great", emoji: "😊", color: "bg-emerald-500" },
  { value: "good", label: "Good", emoji: "🙂", color: "bg-green-400" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-yellow-400" },
  { value: "bad", label: "Bad", emoji: "😔", color: "bg-orange-400" },
  { value: "terrible", label: "Terrible", emoji: "😢", color: "bg-red-400" },
];

export const DEFAULT_COPING_STRATEGIES = [
  "Take a walk outside",
  "Practice deep breathing",
  "Call a friend or sponsor",
  "Exercise for 10 minutes",
  "Write in your journal",
  "Meditate for 5 minutes",
  "Listen to calming music",
  "Drink a glass of water",
];

export const DEFAULT_MOTIVATIONAL_CONTENT = [
  { type: "quote" as const, content: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought.", author: "Unknown" },
  { type: "quote" as const, content: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { type: "quote" as const, content: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { type: "tip" as const, content: "When cravings hit, try the HALT method: ask yourself if you're Hungry, Angry, Lonely, or Tired." },
  { type: "tip" as const, content: "Keep a list of reasons why you started recovery. Read it when motivation is low." },
  { type: "tip" as const, content: "Build a daily routine. Structure helps reduce idle time that can lead to triggers." },
  { type: "reminder" as const, content: "Every day clean is a victory worth celebrating, no matter how small it feels." },
  { type: "reminder" as const, content: "You are stronger than your cravings. This feeling will pass." },
  { type: "reminder" as const, content: "Progress isn't always linear. Setbacks are part of the journey, not the end of it." },
];

export const RELAPSE_SUPPORT_MESSAGE =
  "A setback does not erase your progress. Recovery is a journey. Be kind to yourself, reflect on what happened, and take the next step forward.";

export const ANONYMOUS_NAMES = [
  "BraveSoul", "NewDay", "HopeSeeker", "SteadyPath", "CalmWave",
  "RisingStar", "QuietStrength", "FreshStart", "TrueNorth", "GentleHeart",
];

export const PROFANITY_LIST = ["damn", "hell", "shit", "fuck", "ass", "bitch", "bastard"];
