export type AddictionType =
  | "alcohol"
  | "drugs"
  | "smoking"
  | "gambling"
  | "porn"
  | "social_media"
  | "gaming"
  | "shopping"
  | "food"
  | "other";

export type StruggleDuration =
  | "less_than_6_months"
  | "6_months_to_1_year"
  | "1_to_3_years"
  | "3_to_5_years"
  | "more_than_5_years";

export type RecoveryGoalType = "quit_completely" | "reduce_usage" | "build_habits";

export type Mood = "great" | "good" | "neutral" | "bad" | "terrible";

export type GoalStatus = "active" | "completed" | "missed";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  addictionTypes: AddictionType[];
  struggleDuration?: StruggleDuration;
  goalType?: RecoveryGoalType;
  recoveryStartDate: string;
  timezone: string;
  onboardingComplete: boolean;
  role: "user" | "admin";
  notificationSettings: {
    dailyCheckIn: boolean;
    goalReminders: boolean;
    motivationReminders: boolean;
  };
  personalReasons: string[];
  longestStreak: number;
  currentStreak: number;
  recoveryScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  mood: Mood;
  hadCravings: boolean;
  triggers: string[];
  relapsed: boolean;
  notes: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetDays?: number;
  status: GoalStatus;
  createdAt: string;
  completedAt?: string;
}

export interface Relapse {
  id: string;
  userId: string;
  trigger: string;
  circumstances: string;
  loggedAt: string;
}

export interface Trigger {
  id: string;
  userId: string;
  name: string;
  copingStrategies: string[];
  createdAt: string;
}

export interface CopingStrategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  anonymousName: string;
  content: string;
  type: "update" | "victory" | "question";
  reportCount: number;
  createdAt: string;
}

export interface Report {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
}

export interface MotivationalContent {
  id: string;
  type: "quote" | "tip" | "reminder";
  content: string;
  author?: string;
  active: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: "check_in" | "goal" | "motivation";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
