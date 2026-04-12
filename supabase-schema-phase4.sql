-- =============================================
-- IEBC Platform — Phase 4 Schema
-- Run AFTER phases 1, 2, and 3
-- =============================================

-- Recurring Transactions
create table if not exists public.recurring_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text,
  vendor text,
  frequency text default 'monthly' check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_date date not null,
  end_date date,
  is_active boolean default true,
  last_created_at timestamptz,
  created_at timestamptz default now()
);
alter table public.recurring_transactions enable row level security;
create policy "Users manage own recurring" on public.recurring_transactions for all using (auth.uid() = user_id);
create index if not exists recurring_user_id_idx on public.recurring_transactions(user_id);

-- Bills / Accounts Payable
create table if not exists public.bills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  vendor_name text not null,
  description text,
  amount numeric not null,
  due_date date not null,
  status text default 'unpaid' check (status in ('unpaid', 'paid', 'overdue', 'void')),
  category text,
  reference text,
  paid_date date,
  created_at timestamptz default now()
);
alter table public.bills enable row level security;
create policy "Users manage own bills" on public.bills for all using (auth.uid() = user_id);
create index if not exists bills_user_id_idx on public.bills(user_id);
create index if not exists bills_status_idx on public.bills(status);

-- Projects / Job Costing
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  client_name text,
  status text default 'active' check (status in ('active', 'completed', 'on_hold', 'canceled')),
  budget numeric default 0,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);
alter table public.projects enable row level security;
create policy "Users manage own projects" on public.projects for all using (auth.uid() = user_id);
create index if not exists projects_user_id_idx on public.projects(user_id);

-- Add project_id to transactions for job costing
alter table public.transactions add column if not exists project_id uuid references public.projects(id) on delete set null;
alter table public.transactions add column if not exists reconciled boolean default false;
create index if not exists transactions_project_id_idx on public.transactions(project_id);

-- Automation Rules
create table if not exists public.transaction_rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  match_field text not null check (match_field in ('description', 'vendor', 'amount_gt', 'amount_lt')),
  match_value text not null,
  set_category text not null,
  set_type text,
  priority integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.transaction_rules enable row level security;
create policy "Users manage own rules" on public.transaction_rules for all using (auth.uid() = user_id);

-- Tax Obligations
create table if not exists public.tax_obligations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text default 'other' check (type in ('income_tax', 'sales_tax', 'vat', 'payroll_tax', 'other')),
  amount numeric not null,
  due_date date not null,
  status text default 'pending' check (status in ('pending', 'paid', 'overdue')),
  period_start date,
  period_end date,
  notes text,
  created_at timestamptz default now()
);
alter table public.tax_obligations enable row level security;
create policy "Users manage own tax obligations" on public.tax_obligations for all using (auth.uid() = user_id);
create index if not exists tax_obligations_user_id_idx on public.tax_obligations(user_id);

-- Performance indexes
create index if not exists recurring_next_date_idx on public.recurring_transactions(user_id, next_date);
create index if not exists bills_due_date_idx on public.bills(user_id, due_date);
create index if not exists tax_due_date_idx on public.tax_obligations(user_id, due_date);
