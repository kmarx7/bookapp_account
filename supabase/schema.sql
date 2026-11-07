-- 1인가구 재무제표 — 클라우드 동기화 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.

create table if not exists public.app_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_data enable row level security;

drop policy if exists "own row select" on public.app_data;
drop policy if exists "own row insert" on public.app_data;
drop policy if exists "own row update" on public.app_data;

create policy "own row select" on public.app_data
  for select using (auth.uid() = user_id);

create policy "own row insert" on public.app_data
  for insert with check (auth.uid() = user_id);

create policy "own row update" on public.app_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
