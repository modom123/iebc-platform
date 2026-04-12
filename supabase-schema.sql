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

-- =============================================
-- PHASE 2: Extended Feature Tables
-- =============================================

-- Transactions (Income & Expenses)
-- Tracks all financial activity per user
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  description text not null,
  amount numeric not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz default now()
);
alter table public.transactions enable row level security;
create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id);

-- Invoices
-- Gold/Platinum: invoice generation and tracking
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  invoice_number text not null,
  client_name text not null,
  client_email text,
  items jsonb default '[]'::jsonb,
  subtotal numeric default 0,
  tax_rate numeric default 0,
  total_amount numeric default 0,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  due_date date,
  notes text,
  created_at timestamptz default now()
);
alter table public.invoices enable row level security;
create policy "Users manage own invoices" on public.invoices for all using (auth.uid() = user_id);

-- Tasks
-- All plans: personal task management
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id);

-- Team Members
-- Gold: up to 5 users | Platinum: up to 10 users
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade,
  member_id uuid references public.profiles(id) on delete set null,
  role text default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  invited_email text not null,
  status text default 'pending' check (status in ('pending', 'active', 'revoked')),
  created_at timestamptz default now(),
  unique(owner_id, invited_email)
);
alter table public.team_members enable row level security;
create policy "Owners manage their team" on public.team_members for all using (auth.uid() = owner_id);
create policy "Members view own membership" on public.team_members for select using (auth.uid() = member_id);

-- Business Formation Checklists
-- Platinum only: tracks formation steps per user
create table if not exists public.formation_checklists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  entity_type text check (entity_type in ('llc', 's_corp', 'c_corp', 'sole_prop')),
  business_name text,
  state text,
  steps jsonb default '{}'::jsonb,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.formation_checklists enable row level security;
create policy "Users manage own formation" on public.formation_checklists for all using (auth.uid() = user_id);
