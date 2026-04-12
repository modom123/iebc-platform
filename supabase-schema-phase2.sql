-- =============================================
-- IEBC Platform — Phase 2 Schema
-- Run AFTER supabase-schema.sql and supabase-schema-phase1.sql
-- =============================================

-- Add user_id to leads (make leads per-user instead of platform-only)
alter table public.leads add column if not exists user_id uuid references public.profiles(id) on delete cascade;

-- Update leads RLS: allow users to manage their own leads
drop policy if exists "Staff manage leads" on public.leads;
create policy "Users manage own leads" on public.leads
  for all using (auth.uid() = user_id);

-- Tasks
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'done', 'canceled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  created_at timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id);

-- Index for performance
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists leads_user_id_idx on public.leads(user_id);
create index if not exists leads_heat_idx on public.leads(heat);
