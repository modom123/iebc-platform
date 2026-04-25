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
-- =============================================
-- IEBC Platform — Phase 1 Accounting Schema
-- Run AFTER supabase-schema.sql
-- =============================================

-- Chart of Accounts
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  code text not null,
  name text not null,
  type text not null check (type in ('asset','liability','equity','revenue','expense')),
  subtype text,
  balance numeric default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.accounts enable row level security;
create policy "Users manage own accounts" on public.accounts for all using (auth.uid() = user_id);

-- Seed default chart of accounts on first use (called from app)
-- Assets: 1000-1999 | Liabilities: 2000-2999 | Equity: 3000-3999
-- Revenue: 4000-4999 | Expenses: 5000-5999

-- Journal Entries (double-entry ledger)
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null default current_date,
  description text not null,
  reference text,
  status text default 'posted' check (status in ('draft','posted','void')),
  created_at timestamptz default now()
);
alter table public.journal_entries enable row level security;
create policy "Users manage own journal entries" on public.journal_entries for all using (auth.uid() = user_id);

-- Journal Entry Lines (debits + credits must balance)
create table if not exists public.journal_entry_lines (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references public.journal_entries(id) on delete cascade,
  account_id uuid references public.accounts(id),
  debit numeric default 0,
  credit numeric default 0,
  memo text
);
alter table public.journal_entry_lines enable row level security;
create policy "Users manage own entry lines" on public.journal_entry_lines
  for all using (
    exists (select 1 from public.journal_entries je where je.id = entry_id and je.user_id = auth.uid())
  );

-- Customers (for invoicing)
create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  stripe_customer_id text,
  created_at timestamptz default now()
);
alter table public.customers enable row level security;
create policy "Users manage own customers" on public.customers for all using (auth.uid() = user_id);

-- Invoices
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  customer_id uuid references public.customers(id),
  invoice_number text not null,
  status text default 'draft' check (status in ('draft','sent','paid','overdue','void')),
  issue_date date default current_date,
  due_date date,
  subtotal numeric default 0,
  tax_rate numeric default 0,
  tax_amount numeric default 0,
  total numeric default 0,
  amount_paid numeric default 0,
  notes text,
  stripe_invoice_id text,
  stripe_payment_link text,
  created_at timestamptz default now()
);
alter table public.invoices enable row level security;
create policy "Users manage own invoices" on public.invoices for all using (auth.uid() = user_id);

-- Invoice Line Items
create table if not exists public.invoice_line_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric default 1,
  unit_price numeric default 0,
  amount numeric default 0
);
alter table public.invoice_line_items enable row level security;
create policy "Users manage own invoice items" on public.invoice_line_items
  for all using (
    exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())
  );

-- Transactions (bank feed / manual entries)
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  account_id uuid references public.accounts(id),
  date date not null default current_date,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income','expense','transfer')),
  category text,
  vendor text,
  reference text,
  reconciled boolean default false,
  plaid_transaction_id text unique,
  receipt_url text,
  created_at timestamptz default now()
);
alter table public.transactions enable row level security;
create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id);

-- Plaid bank connections
create table if not exists public.bank_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  institution_name text,
  plaid_access_token text,
  plaid_item_id text unique,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);
alter table public.bank_connections enable row level security;
create policy "Users manage own bank connections" on public.bank_connections for all using (auth.uid() = user_id);

-- Auto-increment invoice number function
create sequence if not exists invoice_number_seq start 1001;
create or replace function next_invoice_number(uid uuid)
returns text as $$
  select 'INV-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
$$ language sql;

-- Recalculate account balance trigger
create or replace function update_account_balance()
returns trigger as $$
begin
  update public.accounts
  set balance = (
    select coalesce(sum(debit),0) - coalesce(sum(credit),0)
    from public.journal_entry_lines
    where account_id = coalesce(NEW.account_id, OLD.account_id)
  )
  where id = coalesce(NEW.account_id, OLD.account_id);
  return NEW;
end;
$$ language plpgsql security definer;

create or replace trigger on_journal_line_change
  after insert or update or delete on public.journal_entry_lines
  for each row execute procedure update_account_balance();
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
-- =============================================
-- IEBC Platform — Phase 3 Schema
-- Run AFTER phase 1 and phase 2
-- =============================================

-- Budget tracking per user/category
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  category text not null,
  amount numeric not null check (amount > 0),
  period text default 'monthly' check (period in ('monthly', 'yearly')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, category)
);
alter table public.budgets enable row level security;
create policy "Users manage own budgets" on public.budgets for all using (auth.uid() = user_id);

-- Add phone/address to customers (if not already there)
alter table public.customers add column if not exists phone text;
alter table public.customers add column if not exists address text;

-- Add indexes for common queries
create index if not exists budgets_user_id_idx on public.budgets(user_id);
create index if not exists transactions_date_idx on public.transactions(user_id, date);
create index if not exists transactions_type_idx on public.transactions(user_id, type);
create index if not exists invoices_status_idx on public.invoices(user_id, status);
create index if not exists customers_user_id_idx on public.customers(user_id);

-- Function to auto-update budgets updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger budgets_updated_at
  before update on public.budgets
  for each row execute procedure update_updated_at();
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
-- =============================================
-- IEBC Platform — Phase 5 Schema
-- Run AFTER phases 1–4
-- Adds: estimates, mileage_log, time_entries,
--       team_members, formation_checklists
-- =============================================

-- Estimates / Quotes (converts to invoices)
create table if not exists public.estimates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  estimate_number text not null,
  client_name text not null,
  client_email text,
  items jsonb default '[]'::jsonb,
  subtotal numeric default 0,
  tax_rate numeric default 0,
  tax_amount numeric default 0,
  total numeric default 0,
  status text default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined', 'expired')),
  valid_until date,
  notes text,
  converted_invoice_id uuid references public.invoices(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.estimates enable row level security;
create policy "Users manage own estimates" on public.estimates for all using (auth.uid() = user_id);
create index if not exists estimates_user_id_idx on public.estimates(user_id);
create index if not exists estimates_status_idx on public.estimates(status);

-- Mileage Log (IRS deduction tracking)
create table if not exists public.mileage_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null default current_date,
  purpose text not null,
  from_location text,
  to_location text,
  miles numeric not null check (miles > 0),
  deduction_amount numeric default 0,
  created_at timestamptz default now()
);
alter table public.mileage_log enable row level security;
create policy "Users manage own mileage" on public.mileage_log for all using (auth.uid() = user_id);
create index if not exists mileage_user_id_idx on public.mileage_log(user_id);
create index if not exists mileage_date_idx on public.mileage_log(user_id, date);

-- Time Entries (billable hours tracking)
create table if not exists public.time_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null default current_date,
  client text,
  project text,
  description text not null,
  hours numeric not null check (hours > 0),
  rate numeric default 0,
  billable boolean default true,
  invoice_id uuid references public.invoices(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.time_entries enable row level security;
create policy "Users manage own time entries" on public.time_entries for all using (auth.uid() = user_id);
create index if not exists time_entries_user_id_idx on public.time_entries(user_id);
create index if not exists time_entries_date_idx on public.time_entries(user_id, date);

-- Team Members (multi-user access control)
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

-- Business Formation Checklists (per user, one entity at a time)
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

-- Auto-update formation updated_at
create or replace trigger formation_updated_at
  before update on public.formation_checklists
  for each row execute procedure update_updated_at();
-- =============================================
-- IEBC Platform — Phase 6 Schema
-- Run AFTER phases 1–5
-- Adds: employees, pay_runs, pay_stubs,
--       vendors, vault_documents
-- =============================================

-- -----------------------------------------------
-- PAYROLL
-- -----------------------------------------------

-- Employees
create table if not exists public.employees (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  email text,
  title text,
  pay_type text default 'salary' check (pay_type in ('salary', 'hourly')),
  pay_rate numeric not null default 0,
  filing_status text default 'single' check (filing_status in ('single', 'married', 'married_separately')),
  allowances integer default 1,
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now()
);
alter table public.employees enable row level security;
create policy "Users manage own employees" on public.employees for all using (auth.uid() = user_id);
create index if not exists employees_user_id_idx on public.employees(user_id);
create index if not exists employees_status_idx on public.employees(user_id, status);

-- Pay Runs (each payroll run)
create table if not exists public.pay_runs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  pay_date date not null,
  total_gross numeric default 0,
  total_taxes numeric default 0,
  total_net numeric default 0,
  employee_count integer default 0,
  status text default 'processed' check (status in ('draft', 'processed', 'paid')),
  created_at timestamptz default now()
);
alter table public.pay_runs enable row level security;
create policy "Users manage own pay runs" on public.pay_runs for all using (auth.uid() = user_id);
create index if not exists pay_runs_user_id_idx on public.pay_runs(user_id);
create index if not exists pay_runs_pay_date_idx on public.pay_runs(user_id, pay_date);

-- Pay Stubs (individual employee breakdown per run)
create table if not exists public.pay_stubs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  pay_run_id uuid references public.pay_runs(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  employee_name text not null,
  gross_pay numeric default 0,
  federal_tax numeric default 0,
  state_tax numeric default 0,
  social_security numeric default 0,
  medicare numeric default 0,
  net_pay numeric default 0,
  hours numeric,
  created_at timestamptz default now()
);
alter table public.pay_stubs enable row level security;
create policy "Users manage own pay stubs" on public.pay_stubs for all using (auth.uid() = user_id);
create index if not exists pay_stubs_run_idx on public.pay_stubs(pay_run_id);
create index if not exists pay_stubs_employee_idx on public.pay_stubs(employee_id);

-- -----------------------------------------------
-- VENDORS
-- -----------------------------------------------

create table if not exists public.vendors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  tin text,                              -- Tax ID Number (EIN/SSN) for 1099
  vendor_type text default 'vendor' check (vendor_type in ('vendor', 'contractor', 'supplier')),
  is_1099 boolean default false,         -- Requires 1099-NEC filing
  notes text,
  created_at timestamptz default now()
);
alter table public.vendors enable row level security;
create policy "Users manage own vendors" on public.vendors for all using (auth.uid() = user_id);
create index if not exists vendors_user_id_idx on public.vendors(user_id);
create index if not exists vendors_1099_idx on public.vendors(user_id, is_1099);

-- Add vendor_id FK to bills table (backfill existing table)
alter table public.bills add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
create index if not exists bills_vendor_idx on public.bills(vendor_id);

-- -----------------------------------------------
-- DOCUMENT VAULT
-- -----------------------------------------------

create table if not exists public.vault_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  category text default 'Other' check (category in (
    'Contracts', 'Tax Documents', 'Receipts', 'Invoices',
    'Business Formation', 'Insurance', 'HR / Payroll', 'Legal', 'Other'
  )),
  file_type text,
  file_size bigint default 0,
  storage_path text not null,
  notes text,
  created_at timestamptz default now()
);
alter table public.vault_documents enable row level security;
create policy "Users manage own documents" on public.vault_documents for all using (auth.uid() = user_id);
create index if not exists vault_docs_user_id_idx on public.vault_documents(user_id);
create index if not exists vault_docs_category_idx on public.vault_documents(user_id, category);

-- Storage bucket for documents (run in Supabase Dashboard → Storage)
-- Create a private bucket named "documents" with 10MB file size limit
-- insert into storage.buckets (id, name, public, file_size_limit)
-- values ('documents', 'documents', false, 10485760)
-- on conflict (id) do nothing;

-- Storage RLS policy for documents bucket
-- create policy "Users access own documents"
--   on storage.objects for all
--   using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
-- ============================================================
-- IEBC Platform — Phase 7 Schema
-- Chart of Accounts, Journal Entries, Purchase Orders,
-- Inventory, Client Portal, Invoice Payments
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CHART OF ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  account_type  TEXT NOT NULL, -- Asset, Liability, Equity, Revenue, Expense, COGS
  sub_type      TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coa_user ON chart_of_accounts(user_id);

ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY coa_owner ON chart_of_accounts FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_number  TEXT NOT NULL,
  date          DATE NOT NULL,
  description   TEXT NOT NULL,
  reference     TEXT,
  status        TEXT NOT NULL DEFAULT 'draft', -- draft, posted
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY je_owner ON journal_entries FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id  UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_code      TEXT NOT NULL DEFAULT '',
  account_name      TEXT NOT NULL DEFAULT '',
  description       TEXT NOT NULL DEFAULT '',
  debit             NUMERIC(14,2) NOT NULL DEFAULT 0,
  credit            NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_jel_entry ON journal_entry_lines(journal_entry_id);
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY jel_owner ON journal_entry_lines FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  po_number       TEXT NOT NULL,
  vendor_id       UUID,
  vendor_name     TEXT NOT NULL,
  order_date      DATE NOT NULL,
  expected_date   DATE,
  subtotal        NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(6,3) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(14,2) NOT NULL DEFAULT 0,
  total           NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'draft', -- draft, sent, received, billed, cancelled
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_po_user ON purchase_orders(user_id);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY po_owner ON purchase_orders FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id   UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description         TEXT NOT NULL,
  qty                 NUMERIC(12,3) NOT NULL DEFAULT 1,
  unit                TEXT NOT NULL DEFAULT 'each',
  unit_price          NUMERIC(14,2) NOT NULL DEFAULT 0,
  total               NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pol_po ON purchase_order_lines(purchase_order_id);
ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY pol_owner ON purchase_order_lines FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sku             TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'Supplies',
  unit            TEXT NOT NULL DEFAULT 'each',
  cost_price      NUMERIC(14,2) NOT NULL DEFAULT 0,
  sale_price      NUMERIC(14,2) NOT NULL DEFAULT 0,
  qty_on_hand     NUMERIC(12,3) NOT NULL DEFAULT 0,
  reorder_point   NUMERIC(12,3) NOT NULL DEFAULT 5,
  reorder_qty     NUMERIC(12,3) NOT NULL DEFAULT 20,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_inv_user ON inventory_items(user_id);
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY inv_owner ON inventory_items FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id   UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  qty_change          NUMERIC(12,3) NOT NULL,
  note                TEXT,
  adjusted_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY inv_adj_owner ON inventory_adjustments FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- CLIENT PORTAL TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS client_portal_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_token ON client_portal_tokens(token);
CREATE INDEX IF NOT EXISTS idx_portal_invoice ON client_portal_tokens(invoice_id);

-- No RLS auth check on SELECT for token lookup (public portal page validates by token value)
ALTER TABLE client_portal_tokens ENABLE ROW LEVEL SECURITY;
-- Users can manage their own tokens
CREATE POLICY portal_token_owner ON client_portal_tokens FOR ALL USING (user_id = auth.uid());
-- Public read by token value (for portal page — no auth)
CREATE POLICY portal_token_public_read ON client_portal_tokens FOR SELECT USING (true);

-- ============================================================
-- INVOICE PAYMENTS (tracks payments made via portal or manually)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id            UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount                NUMERIC(14,2) NOT NULL,
  method                TEXT, -- card, ach, check, cash
  portal_token_id       UUID REFERENCES client_portal_tokens(id),
  stripe_payment_id     TEXT,
  paid_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON invoice_payments(invoice_id);
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_owner ON invoice_payments FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- ALTER INVOICES: add paid_at + payment_method columns
-- ============================================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- ============================================================
-- PHASE 6 TABLES (payroll, vendors, documents) — included here
-- for completeness if not yet applied
-- ============================================================

CREATE TABLE IF NOT EXISTS employees (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  title           TEXT,
  department      TEXT,
  pay_type        TEXT NOT NULL DEFAULT 'salary', -- salary, hourly
  pay_rate        NUMERIC(14,2) NOT NULL DEFAULT 0,
  filing_status   TEXT NOT NULL DEFAULT 'single',
  allowances      INTEGER NOT NULL DEFAULT 1,
  start_date      DATE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY emp_owner ON employees FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS pay_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  pay_date        DATE NOT NULL,
  total_gross     NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_tax       NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_net       NUMERIC(14,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending, paid
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pay_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY payrun_owner ON pay_runs FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS pay_stubs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pay_run_id      UUID NOT NULL REFERENCES pay_runs(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  gross_pay       NUMERIC(14,2) NOT NULL DEFAULT 0,
  federal_tax     NUMERIC(14,2) NOT NULL DEFAULT 0,
  state_tax       NUMERIC(14,2) NOT NULL DEFAULT 0,
  ss_tax          NUMERIC(14,2) NOT NULL DEFAULT 0,
  medicare_tax    NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_pay         NUMERIC(14,2) NOT NULL DEFAULT 0,
  hours_worked    NUMERIC(8,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pay_stubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY stub_owner ON pay_stubs FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS vendors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  company         TEXT,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  vendor_type     TEXT NOT NULL DEFAULT 'vendor', -- vendor, contractor
  payment_terms   TEXT NOT NULL DEFAULT 'net30',
  tax_id          TEXT,
  is_1099         BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_owner ON vendors FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS vault_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'General',
  file_path       TEXT NOT NULL,
  file_size       BIGINT,
  mime_type       TEXT,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_owner ON vault_documents FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET for Document Vault
-- Run in Supabase dashboard > Storage
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
-- CREATE POLICY "Users manage own documents" ON storage.objects FOR ALL USING (
--   bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- ============================================================
-- FIXUPS: Add columns that later phases expect but base schema
-- didn't include (all idempotent with IF NOT EXISTS)
-- ============================================================

-- profiles: extra fields written by webhook / checkout
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- subscriptions: stripe_customer_id column used by webhook
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- invoices: extra columns from phase1 that base schema missed
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS issue_date date DEFAULT current_date;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total numeric DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stripe_invoice_id text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stripe_payment_link text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method text;

-- transactions: extra columns from phase1
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS account_id uuid;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS vendor text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS reference text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS reconciled boolean DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS plaid_transaction_id text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS project_id uuid;

-- bank_accounts (Plaid connected accounts)
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  plaid_account_id text NOT NULL,
  name text NOT NULL,
  official_name text,
  type text,
  subtype text,
  mask text,
  current_balance numeric DEFAULT 0,
  available_balance numeric,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bank accounts" ON public.bank_accounts FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS bank_accounts_user_id_idx ON public.bank_accounts(user_id);

-- plaid_sync_cursors (Plaid transaction sync state)
CREATE TABLE IF NOT EXISTS public.plaid_sync_cursors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  cursor text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(connection_id)
);
ALTER TABLE public.plaid_sync_cursors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sync cursors" ON public.plaid_sync_cursors FOR ALL USING (auth.uid() = user_id);

-- hub_prospects (Master Hub lead pipeline)
CREATE TABLE IF NOT EXISTS public.hub_prospects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name text NOT NULL,
  contact_name text,
  contact_email text,
  phone text,
  industry text,
  stage text DEFAULT 'new' CHECK (stage IN ('new','contacted','demo','proposal','closed_won','closed_lost')),
  est_value numeric DEFAULT 0,
  notes text,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.hub_prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage prospects" ON public.hub_prospects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('consultant','admin'))
);

-- audit_logs (immutable event trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Service role writes audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs(created_at DESC);
