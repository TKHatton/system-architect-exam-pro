-- System Architect Exam Pro — Supabase schema (optional upgrade for cross-device progress + pod leaderboard)
-- Run this in your Supabase project: SQL Editor -> New query -> paste -> Run.

create table if not exists progress (
  user_id text primary key,
  name    text,
  state   jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists leaderboard (
  id         bigint generated always as identity primary key,
  user_id    text not null,
  name       text,
  pod        text default 'Epsilon',
  scaled     int  not null,
  correct    int,
  total      int,
  created_at timestamptz default now()
);

-- This app uses the public anon key with no login, so allow anon read/write.
-- (Fine for a study tool. Do NOT store anything sensitive here.)
alter table progress    enable row level security;
alter table leaderboard enable row level security;

create policy "anon all progress"    on progress    for all using (true) with check (true);
create policy "anon read leaderboard" on leaderboard for select using (true);
create policy "anon insert leaderboard" on leaderboard for insert with check (true);
