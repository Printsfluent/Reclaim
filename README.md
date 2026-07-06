# RecoveryHub

A modern, mobile-first addiction recovery platform built with Next.js 15, Supabase, and Groq.

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
| Auth & Database | Supabase (PostgreSQL + Auth) |
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
│   ├── auth/callback/   # OAuth callback
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
    ├── supabase/        # Auth, database, client
    ├── types/           # TypeScript interfaces
    └── utils/           # Dates, sanitize, cn
supabase/schema.sql      # PostgreSQL schema + RLS policies
.env.example             # Environment variable template
```

## Database Schema (Supabase / PostgreSQL)

| Table | Key Fields |
|-------|-----------|
| `profiles` | id, name, email, addiction_types, recovery_start_date, role, streaks, recovery_score |
| `daily_checkins` | user_id, date, mood, had_cravings, triggers, relapsed, notes |
| `journal_entries` | user_id, title, content, created_at, updated_at |
| `recovery_goals` | user_id, title, status, target_days |
| `relapses` | user_id, trigger, circumstances, logged_at |
| `triggers` | user_id, name, coping_strategies |
| `coping_strategies` | user_id, name, description |
| `community_posts` | user_id, anonymous_name, content, type, report_count |
| `reports` | post_id, reporter_id, reason |

## Setup Guide

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Reclaim
npm install
```

### 2. Supabase Setup

1. Create a project at [Supabase Dashboard](https://supabase.com/dashboard)
2. Enable **Authentication** → Email provider and Google OAuth
3. Under **Authentication → URL Configuration**, add:
   - Site URL: `http://localhost:3000` (and your production URL)
   - Redirect URL: `http://localhost:3000/auth/callback`
4. Run the schema in **SQL Editor** — paste contents of `supabase/schema.sql`

### 3. Environment Variables

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GROQ_API_KEY=gsk_...
```

Find Supabase keys under **Project Settings → API**.

### 4. Admin User

Set a user's role to `admin` in the Supabase table editor:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel Deployment

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Add your Vercel URL to Supabase auth redirect URLs
5. Deploy

### Production Checklist

- [ ] Supabase schema applied (`supabase/schema.sql`)
- [ ] Supabase auth redirect URLs include production domain
- [ ] Google OAuth configured in Supabase (if using)
- [ ] Environment variables set in Vercel dashboard
- [ ] Groq API key configured

## Security

- **Row Level Security** — Owner-based access, admin overrides
- **Rate Limiting** — AI coach API (20 req/min per IP)
- **Input Validation** — Zod schemas on API routes, sanitization on writes
- **XSS Protection** — Input sanitization, CSP headers via middleware
- **CSRF** — Same-origin API routes with JSON content-type validation

## License

Private — All rights reserved.
