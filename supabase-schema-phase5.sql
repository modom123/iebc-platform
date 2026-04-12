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
