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
