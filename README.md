# RecoveryHub

A modern, mobile-first addiction recovery platform built with Next.js 15, Firebase, and Groq.

RecoveryHub helps users track progress, manage relapses, journal privately, interact with an AI recovery coach, and engage with a supportive anonymous community.

> **Disclaimer:** RecoveryHub is not a medical provider and does not offer medical advice, diagnosis, or treatment.

## Features

- **Authentication** — Email/password, Google Sign-In, password reset
- **Onboarding** — Multi-step flow to personalize recovery plan
- **Dashboard** — Streak tracking, recovery score, daily progress
- **Daily Check-In** — Mood, cravings, triggers, relapse logging
- **Relapse Tracker** — Supportive messaging with streak reset
- **Journal** — Private entries with search, edit, delete
- **Trigger Management** — Triggers + coping strategies
- **Goals** — Active, completed, missed goal states
- **Motivation Center** — Daily quotes, tips, reminders
- **Emergency Support** — Breathing/grounding exercises, personal reasons
- **AI Recovery Coach** — Groq-powered motivational interviewing
- **Community** — Anonymous feed with reporting and profanity filter
- **Analytics** — Mood and craving charts (Chart.js)
- **Notifications** — In-app reminders (configurable)
- **Admin Panel** — User management, reports, content moderation
- **Dark/Light Mode** — System-aware theme toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| AI | Groq API (llama-3.3-70b-versatile) |
| Charts | Chart.js + react-chartjs-2 |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, password reset
│   ├── (dashboard)/     # Protected app pages
│   ├── api/coach/       # Groq API route
│   ├── onboarding/      # Onboarding flow
│   └── page.tsx         # Landing page
├── components/
│   ├── auth/            # ProtectedRoute, AdminRoute
│   ├── dashboard/       # InAppNotifications
│   ├── layout/          # DashboardNav
│   ├── providers/       # Theme + Auth providers
│   └── ui/              # Button, Card, Input, etc.
├── contexts/            # AuthContext
└── lib/
    ├── constants/       # App constants, options
    ├── firebase/        # Auth, Firestore, config
    ├── types/           # TypeScript interfaces
    └── utils/           # Dates, sanitize, cn
firestore.rules            # Firebase security rules
.env.example               # Environment variable template
```

## Database Schema (Firestore)

| Collection | Key Fields |
|-----------|-----------|
| `users` | uid, name, email, addictionTypes, recoveryStartDate, role, streaks, recoveryScore |
| `daily_checkins` | userId, date, mood, hadCravings, triggers, relapsed, notes |
| `journal_entries` | userId, title, content, createdAt, updatedAt |
| `recovery_goals` | userId, title, status, targetDays |
| `relapses` | userId, trigger, circumstances, loggedAt |
| `triggers` | userId, name, copingStrategies |
| `coping_strategies` | userId, name, description |
| `community_posts` | userId, anonymousName, content, type, reportCount |
| `reports` | postId, reporterId, reason |
| `notifications` | userId, type, title, message, read |
| `motivational_content` | type, content, author, active |

## Setup Guide

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Reclaim
npm install
```

### 2. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password and Google providers
3. Create a **Firestore Database** (start in production mode)
4. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Register a **Web App** and copy config values

### 3. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GROQ_API_KEY=gsk_...
```

### 4. Firestore Indexes

Create composite indexes in Firebase Console (or via CLI when prompted):

- `daily_checkins`: `userId` ASC, `date` DESC
- `daily_checkins`: `userId` ASC, `date` ASC
- `journal_entries`: `userId` ASC, `updatedAt` DESC
- `recovery_goals`: `userId` ASC, `createdAt` DESC
- `relapses`: `userId` ASC, `loggedAt` DESC
- `community_posts`: `createdAt` DESC
- `reports`: `createdAt` DESC

### 5. Admin User

Set a user's role to `admin` in Firestore:

```
users/{uid}/role = "admin"
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel Deployment

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

Vercel auto-detects Next.js. No extra config needed.

### Production Checklist

- [ ] Firebase Auth authorized domains include your Vercel URL
- [ ] Firestore rules deployed
- [ ] Composite indexes created
- [ ] Environment variables set in Vercel dashboard
- [ ] Groq API key configured

## Security

- **Firestore Rules** — Owner-based access, admin overrides
- **Rate Limiting** — AI coach API (20 req/min per IP)
- **Input Validation** — Zod schemas on API routes, sanitization on Firestore writes
- **XSS Protection** — Input sanitization, CSP headers via middleware
- **CSRF** — Same-origin API routes with JSON content-type validation

## License

Private — All rights reserved.
