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
