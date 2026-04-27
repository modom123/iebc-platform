-- Migration: Fix leads table RLS — prevent consultants from seeing each other's clients
-- Run this in the Supabase SQL editor against the live database

-- 1. Add assigned_to column so leads have an owner
alter table public.leads
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null;

-- 2. Drop the broken policy that let ALL consultants see ALL leads
drop policy if exists "Staff manage leads" on public.leads;

-- 3. Create properly scoped policies
--    Consultants: only see/edit leads assigned to them
--    Admins: full access to all leads
create policy "Consultants manage own leads" on public.leads
  for all
  using (
    auth.uid() = assigned_to
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. Assign existing unassigned leads to the first admin (prevents them going invisible)
--    Remove or adjust this if you want to assign them manually
update public.leads
set assigned_to = (
  select id from public.profiles where role = 'admin' limit 1
)
where assigned_to is null;
