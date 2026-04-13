-- =============================================
-- IEBC Platform — Phase 6 Schema (Release)
-- Run AFTER phases 1–5
-- Enterprise: Plaid accounts, audit logs,
--             client portal tokens, security
-- =============================================

-- Connected bank/card accounts (from Plaid)
create table if not exists public.bank_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  connection_id uuid references public.bank_connections(id) on delete cascade,
  plaid_account_id text not null,
  name text not null,
  official_name text,
  type text check (type in ('depository', 'credit', 'investment', 'loan', 'other')),
  subtype text,
  mask text,
  current_balance numeric,
  available_balance numeric,
  iso_currency_code text default 'USD',
  is_active boolean default true,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, plaid_account_id)
);
alter table public.bank_accounts enable row level security;
create policy "Users manage own bank accounts" on public.bank_accounts for all using (auth.uid() = user_id);
create index if not exists bank_accounts_user_id_idx on public.bank_accounts(user_id);

-- Plaid transaction sync cursors (per item)
create table if not exists public.plaid_sync_cursors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  connection_id uuid references public.bank_connections(id) on delete cascade unique,
  cursor text,
  updated_at timestamptz default now()
);
alter table public.plaid_sync_cursors enable row level security;
create policy "Users manage own cursors" on public.plaid_sync_cursors for all using (auth.uid() = user_id);

-- Enterprise audit log
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);
alter table public.audit_logs enable row level security;
create policy "Users view own audit logs" on public.audit_logs for select using (auth.uid() = user_id);
create policy "Service role inserts audit logs" on public.audit_logs for insert with check (true);
create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_resource_idx on public.audit_logs(resource_type, resource_id);

-- Client portal access tokens
create table if not exists public.client_portal_tokens (
  id uuid default gen_random_uuid() primary key,
  token text not null unique default gen_random_uuid()::text,
  user_id uuid references public.profiles(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  label text,
  expires_at timestamptz,
  last_accessed_at timestamptz,
  access_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.client_portal_tokens enable row level security;
create policy "Users manage own portal tokens" on public.client_portal_tokens for all using (auth.uid() = user_id);
create index if not exists portal_tokens_token_idx on public.client_portal_tokens(token);
create index if not exists portal_tokens_user_id_idx on public.client_portal_tokens(user_id);
create index if not exists portal_tokens_customer_id_idx on public.client_portal_tokens(customer_id);

-- Multi-currency support on transactions
alter table public.transactions add column if not exists currency text default 'USD';
alter table public.transactions add column if not exists exchange_rate numeric default 1;
alter table public.transactions add column if not exists amount_usd numeric;

-- Add plaid_transaction_id to prevent duplicate imports
alter table public.transactions add column if not exists plaid_transaction_id text unique;
create index if not exists transactions_plaid_id_idx on public.transactions(plaid_transaction_id);

-- Add two-factor preferences to profiles
alter table public.profiles add column if not exists two_factor_enabled boolean default false;
alter table public.profiles add column if not exists notification_email text;
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists company_logo_url text;
alter table public.profiles add column if not exists timezone text default 'America/New_York';
alter table public.profiles add column if not exists fiscal_year_start integer default 1;

-- Performance indexes for audit
create index if not exists audit_user_action_idx on public.audit_logs(user_id, action, created_at desc);
