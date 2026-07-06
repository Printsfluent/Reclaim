-- RecoveryHub Supabase schema
-- Run in the Supabase SQL Editor (Dashboard → SQL → New query)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.increment_report_count(post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.community_posts
  set report_count = report_count + 1
  where id = post_id;
$$;

grant execute on function public.increment_report_count(uuid) to authenticated;

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  photo_url text,
  addiction_types text[] not null default '{}',
  struggle_duration text,
  goal_type text,
  recovery_start_date timestamptz not null default now(),
  timezone text not null default 'UTC',
  onboarding_complete boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  notification_settings jsonb not null default '{"dailyCheckIn":true,"goalReminders":true,"motivationReminders":true}',
  personal_reasons text[] not null default '{}',
  longest_streak integer not null default 0,
  current_streak integer not null default 0,
  recovery_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  mood text not null,
  had_cravings boolean not null,
  triggers text[] not null default '{}',
  relapsed boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recovery_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  target_days integer,
  status text not null default 'active' check (status in ('active', 'completed', 'missed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.relapses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  trigger text not null,
  circumstances text not null,
  logged_at timestamptz not null default now()
);

create table if not exists public.triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  coping_strategies text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.coping_strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  anonymous_name text not null,
  content text not null,
  type text not null check (type in ('update', 'victory', 'question')),
  report_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.journal_entries enable row level security;
alter table public.recovery_goals enable row level security;
alter table public.relapses enable row level security;
alter table public.triggers enable row level security;
alter table public.coping_strategies enable row level security;
alter table public.community_posts enable row level security;
alter table public.reports enable row level security;

-- Profiles policies
create policy "Users read own profile or admin reads all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users update own profile or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Admin deletes profiles"
  on public.profiles for delete
  using (public.is_admin());

-- Owner-scoped tables
create policy "Owner access daily_checkins"
  on public.daily_checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner access journal_entries"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner access recovery_goals"
  on public.recovery_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner access relapses"
  on public.relapses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner access triggers"
  on public.triggers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner access coping_strategies"
  on public.coping_strategies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Community
create policy "Authenticated read community posts"
  on public.community_posts for select
  using (auth.uid() is not null);

create policy "Users create own community posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "Users update own posts or admin"
  on public.community_posts for update
  using (auth.uid() = user_id or public.is_admin());

create policy "Users delete own posts or admin"
  on public.community_posts for delete
  using (auth.uid() = user_id or public.is_admin());

-- Reports
create policy "Admin read reports"
  on public.reports for select
  using (public.is_admin());

create policy "Users create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Admin manage reports"
  on public.reports for update
  using (public.is_admin());

create policy "Admin delete reports"
  on public.reports for delete
  using (public.is_admin());

-- Indexes
create index if not exists daily_checkins_user_date_idx on public.daily_checkins (user_id, date desc);
create index if not exists journal_entries_user_updated_idx on public.journal_entries (user_id, updated_at desc);
create index if not exists recovery_goals_user_created_idx on public.recovery_goals (user_id, created_at desc);
create index if not exists relapses_user_logged_idx on public.relapses (user_id, logged_at desc);
create index if not exists community_posts_created_idx on public.community_posts (created_at desc);
create index if not exists reports_created_idx on public.reports (created_at desc);
