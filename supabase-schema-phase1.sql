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
