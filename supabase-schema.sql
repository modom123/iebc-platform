-- =============================================
-- IEBC Platform - Supabase Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- Users & Auth (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'client' check (role in ('client', 'consultant', 'admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Subscriptions
-- silver  = $9/mo  — 0 consultants, 1 user
-- gold    = $22/mo — 3 consultants, 5 users
-- platinum= $42/mo — 5 consultants, 10 users
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan text check (plan in ('silver', 'gold', 'platinum')),
  status text default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "Users read own sub" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Service role manages subs" on public.subscriptions for all using (auth.role() = 'service_role');

-- IEBC Platform Fees (0.76% cut on each payment)
create table if not exists public.iebc_fees (
  id uuid default gen_random_uuid() primary key,
  payment_intent_id text unique,
  gross_amount_cents int,
  iebc_fee_cents int,
  status text default 'succeeded',
  created_at timestamptz default now()
);
alter table public.iebc_fees enable row level security;
create policy "Admin view fees" on public.iebc_fees for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Service role manages fees" on public.iebc_fees for all using (auth.role() = 'service_role');

-- Leads & Pipeline
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  contact_email text,
  industry text,
  heat text default 'warm' check (heat in ('hot', 'warm', 'cold')),
  est_value numeric default 0,
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'closed_won', 'closed_lost')),
  created_at timestamptz default now()
);
alter table public.leads enable row level security;
create policy "Staff manage leads" on public.leads for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('consultant', 'admin'))
);

-- Consultant Assignments
-- Gold: up to 3 consultants | Platinum: up to 5 consultants
create table if not exists public.consultant_assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  consultant_id uuid references public.profiles(id),
  department text not null,
  assigned_at timestamptz default now()
);
alter table public.consultant_assignments enable row level security;
create policy "Users read own assignments" on public.consultant_assignments for select using (auth.uid() = user_id);
create policy "Admin manage assignments" on public.consultant_assignments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
