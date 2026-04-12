-- Users & Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'client' check (role in ('client', 'consultant', 'admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);

-- Subscriptions & Payments
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  plan text check (plan in ('solo', 'business', 'pro', 'starter', 'growth')),
  status text default 'active',
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "Users read own sub" on public.subscriptions for select using (auth.uid() = user_id);

-- Invoices & Fees (0.76% platform cut)
create table if not exists public.iebc_fees (
  id uuid default gen_random_uuid() primary key,
  payment_intent_id text unique,
  gross_amount_cents int,
  iebc_fee_cents int,
  status text default 'succeeded',
  created_at timestamptz default now()
);
alter table public.iebc_fees enable row level security;
create policy "Admin view fees" on public.iebc_fees for select using (auth.role() = 'authenticated');

-- Leads & Pipeline
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  business_name text,
  contact_email text,
  industry text,
  heat text default 'warm',
  est_value numeric default 0,
  status text default 'new',
  created_at timestamptz default now()
);
alter table public.leads enable row level security;
create policy "Staff manage leads" on public.leads for all using (true);

-- Consultant Assignments
create table if not exists public.consultant_assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  consultant_id uuid references public.profiles(id),
  department text,
  assigned_at timestamptz default now()
);
alter table public.consultant_assignments enable row level security;