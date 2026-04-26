-- ============================================================
-- IEBC Platform — Master Schema (single idempotent script)
-- Safe to run multiple times on any Supabase project.
-- Order: extensions → tables → columns → RLS → policies → indexes
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SECTION 1: CREATE ALL TABLES (IF NOT EXISTS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  role text DEFAULT 'client' CHECK (role IN ('client','consultant','admin')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan text CHECK (plan IN ('silver','gold','platinum')),
  status text DEFAULT 'active' CHECK (status IN ('active','canceled','cancelled','past_due','trialing')),
  stripe_subscription_id text UNIQUE,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.iebc_fees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_intent_id text UNIQUE,
  gross_amount_cents int,
  iebc_fee_cents int,
  status text DEFAULT 'succeeded',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name text NOT NULL,
  contact_email text,
  industry text,
  heat text DEFAULT 'warm' CHECK (heat IN ('hot','warm','cold')),
  est_value numeric DEFAULT 0,
  status text DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed_won','closed_lost')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consultant_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES public.profiles(id),
  department text NOT NULL,
  assigned_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
  subtype text,
  balance numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','void')),
  subtotal numeric DEFAULT 0,
  tax_rate numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  due_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric DEFAULT 1,
  unit_price numeric DEFAULT 0,
  amount numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  description text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('income','expense','transfer')),
  category text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bank_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_name text,
  plaid_access_token text,
  plaid_item_id text UNIQUE,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  description text NOT NULL,
  reference text,
  status text DEFAULT 'posted' CHECK (status IN ('draft','posted','void')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  debit numeric DEFAULT 0,
  credit numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','canceled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('admin','editor','viewer')),
  invited_email text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','active','revoked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(owner_id, invited_email)
);

CREATE TABLE IF NOT EXISTS public.formation_checklists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  entity_type text CHECK (entity_type IN ('llc','s_corp','c_corp','sole_prop')),
  business_name text,
  state text,
  steps jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  period text DEFAULT 'monthly' CHECK (period IN ('monthly','yearly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('income','expense')),
  category text,
  vendor text,
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  next_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  last_created_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_name text NOT NULL,
  description text,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid','overdue','void')),
  category text,
  reference text,
  paid_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  client_name text,
  status text DEFAULT 'active' CHECK (status IN ('active','completed','on_hold','canceled')),
  budget numeric DEFAULT 0,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transaction_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_field text NOT NULL CHECK (match_field IN ('description','vendor','amount_gt','amount_lt')),
  match_value text NOT NULL,
  set_category text NOT NULL,
  set_type text,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_obligations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'other' CHECK (type IN ('income_tax','sales_tax','vat','payroll_tax','other')),
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  period_start date,
  period_end date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.estimates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  estimate_number text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  items jsonb DEFAULT '[]'::jsonb,
  subtotal numeric DEFAULT 0,
  tax_rate numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total numeric DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','declined','expired')),
  valid_until date,
  notes text,
  converted_invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mileage_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  purpose text NOT NULL,
  from_location text,
  to_location text,
  miles numeric NOT NULL CHECK (miles > 0),
  deduction_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  client text,
  project text,
  description text NOT NULL,
  hours numeric NOT NULL CHECK (hours > 0),
  rate numeric DEFAULT 0,
  billable boolean DEFAULT true,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text,
  title text,
  pay_type text DEFAULT 'salary' CHECK (pay_type IN ('salary','hourly')),
  pay_rate numeric NOT NULL DEFAULT 0,
  filing_status text DEFAULT 'single' CHECK (filing_status IN ('single','married','married_separately')),
  allowances integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pay_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  pay_date date NOT NULL,
  total_gross numeric DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft','processed','paid','pending')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pay_stubs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_run_id uuid REFERENCES public.pay_runs(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  gross_pay numeric DEFAULT 0,
  federal_tax numeric DEFAULT 0,
  state_tax numeric DEFAULT 0,
  net_pay numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  is_1099 boolean DEFAULT false,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vault_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text DEFAULT 'Other',
  file_size bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  account_type text NOT NULL,
  sub_type text DEFAULT '',
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  po_number text NOT NULL,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name text NOT NULL,
  order_date date NOT NULL,
  expected_date date,
  subtotal numeric DEFAULT 0,
  tax_rate numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total numeric DEFAULT 0,
  notes text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','received','billed','cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_lines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  description text NOT NULL,
  qty numeric DEFAULT 1,
  unit text DEFAULT 'each',
  unit_price numeric DEFAULT 0,
  total numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'Supplies',
  unit text DEFAULT 'each',
  cost_price numeric DEFAULT 0,
  sale_price numeric DEFAULT 0,
  qty_on_hand numeric DEFAULT 0,
  reorder_point numeric DEFAULT 5,
  reorder_qty numeric DEFAULT 20,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sku)
);

CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  qty_change numeric NOT NULL,
  note text,
  adjusted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_portal_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text,
  portal_token_id uuid REFERENCES public.client_portal_tokens(id),
  stripe_payment_id text,
  paid_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.plaid_sync_cursors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  cursor text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(connection_id)
);

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

-- ============================================================
-- SECTION 2: ADD ALL COLUMNS (every variant from every phase)
-- ADD COLUMN IF NOT EXISTS never errors even if column exists.
-- ============================================================

-- profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes text;

-- invoices (all variants)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_email text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS issue_date date DEFAULT current_date;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total numeric DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stripe_invoice_id text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stripe_payment_link text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;

-- transactions (all variants)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS vendor text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS reference text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS reconciled boolean DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS plaid_transaction_id text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- journal_entry_lines (phase1: entry_id; phase7: journal_entry_id + account_code etc)
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS entry_id uuid REFERENCES public.journal_entries(id) ON DELETE CASCADE;
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS journal_entry_id uuid REFERENCES public.journal_entries(id) ON DELETE CASCADE;
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id);
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS account_code text DEFAULT '';
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS account_name text DEFAULT '';
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS memo text;

-- journal_entries
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS entry_number text;

-- employees (phase6: name; phase7: first_name/last_name)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- pay_runs (phase6: total_taxes/total_net/employee_count; phase7: total_tax/total_net)
ALTER TABLE public.pay_runs ADD COLUMN IF NOT EXISTS total_taxes numeric DEFAULT 0;
ALTER TABLE public.pay_runs ADD COLUMN IF NOT EXISTS total_tax numeric DEFAULT 0;
ALTER TABLE public.pay_runs ADD COLUMN IF NOT EXISTS total_net numeric DEFAULT 0;
ALTER TABLE public.pay_runs ADD COLUMN IF NOT EXISTS employee_count integer DEFAULT 0;

-- pay_stubs (phase6: social_security/medicare/hours/employee_name; phase7: ss_tax/medicare_tax/hours_worked)
ALTER TABLE public.pay_stubs ADD COLUMN IF NOT EXISTS employee_name text;
ALTER TABLE public.pay_stubs ADD COLUMN IF NOT EXISTS social_security numeric DEFAULT 0;
ALTER TABLE public.pay_stubs ADD COLUMN IF NOT EXISTS medicare numeric DEFAULT 0;
ALTER TABLE public.pay_stubs ADD COLUMN IF NOT EXISTS ss_tax numeric DEFAULT 0;
ALTER TABLE public.pay_stubs ADD COLUMN IF NOT EXISTS medicare_tax numeric DEFAULT 0;
ALTER TABLE public.pay_stubs ADD COLUMN IF NOT EXISTS hours numeric;
ALTER TABLE public.pay_stubs ADD COLUMN IF NOT EXISTS hours_worked numeric;

-- vendors (phase6: tin/contact_name; phase7: tax_id/company/payment_terms)
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS tin text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS payment_terms text DEFAULT 'net30';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS vendor_type text DEFAULT 'vendor';

-- vault_documents (phase6: storage_path/file_type/notes; phase7: file_path/mime_type/uploaded_at)
ALTER TABLE public.vault_documents ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.vault_documents ADD COLUMN IF NOT EXISTS file_path text;
ALTER TABLE public.vault_documents ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE public.vault_documents ADD COLUMN IF NOT EXISTS mime_type text;
ALTER TABLE public.vault_documents ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.vault_documents ADD COLUMN IF NOT EXISTS uploaded_at timestamptz DEFAULT now();

-- bills
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;

-- ============================================================
-- SECTION 3: FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;
CREATE OR REPLACE FUNCTION next_invoice_number(uid uuid)
RETURNS text AS $$
  SELECT 'INV-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS budgets_updated_at ON public.budgets;
CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS formation_updated_at ON public.formation_checklists;
CREATE TRIGGER formation_updated_at
  BEFORE UPDATE ON public.formation_checklists
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iebc_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formation_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_stubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaid_sync_cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 5: POLICIES (DROP first so re-runs never error)
-- ============================================================

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_service" ON public.subscriptions;
CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_service" ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "iebc_fees_admin" ON public.iebc_fees;
DROP POLICY IF EXISTS "iebc_fees_service" ON public.iebc_fees;
CREATE POLICY "iebc_fees_admin" ON public.iebc_fees FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "iebc_fees_service" ON public.iebc_fees FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "leads_all" ON public.leads;
CREATE POLICY "leads_all" ON public.leads FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('consultant','admin')));

DROP POLICY IF EXISTS "consultant_assignments_select" ON public.consultant_assignments;
DROP POLICY IF EXISTS "consultant_assignments_admin" ON public.consultant_assignments;
CREATE POLICY "consultant_assignments_select" ON public.consultant_assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "consultant_assignments_admin" ON public.consultant_assignments FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "accounts_all" ON public.accounts;
CREATE POLICY "accounts_all" ON public.accounts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "customers_all" ON public.customers;
CREATE POLICY "customers_all" ON public.customers FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "invoices_all" ON public.invoices;
CREATE POLICY "invoices_all" ON public.invoices FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "invoice_line_items_all" ON public.invoice_line_items;
CREATE POLICY "invoice_line_items_all" ON public.invoice_line_items FOR ALL USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.user_id = auth.uid()));

DROP POLICY IF EXISTS "transactions_all" ON public.transactions;
CREATE POLICY "transactions_all" ON public.transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bank_connections_all" ON public.bank_connections;
CREATE POLICY "bank_connections_all" ON public.bank_connections FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "journal_entries_all" ON public.journal_entries;
CREATE POLICY "journal_entries_all" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "journal_entry_lines_all" ON public.journal_entry_lines;
CREATE POLICY "journal_entry_lines_all" ON public.journal_entry_lines FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_all" ON public.tasks;
CREATE POLICY "tasks_all" ON public.tasks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "team_members_owner" ON public.team_members;
DROP POLICY IF EXISTS "team_members_member" ON public.team_members;
CREATE POLICY "team_members_owner" ON public.team_members FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "team_members_member" ON public.team_members FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "formation_checklists_all" ON public.formation_checklists;
CREATE POLICY "formation_checklists_all" ON public.formation_checklists FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "budgets_all" ON public.budgets;
CREATE POLICY "budgets_all" ON public.budgets FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "recurring_transactions_all" ON public.recurring_transactions;
CREATE POLICY "recurring_transactions_all" ON public.recurring_transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bills_all" ON public.bills;
CREATE POLICY "bills_all" ON public.bills FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_all" ON public.projects;
CREATE POLICY "projects_all" ON public.projects FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transaction_rules_all" ON public.transaction_rules;
CREATE POLICY "transaction_rules_all" ON public.transaction_rules FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tax_obligations_all" ON public.tax_obligations;
CREATE POLICY "tax_obligations_all" ON public.tax_obligations FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "estimates_all" ON public.estimates;
CREATE POLICY "estimates_all" ON public.estimates FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mileage_log_all" ON public.mileage_log;
CREATE POLICY "mileage_log_all" ON public.mileage_log FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "time_entries_all" ON public.time_entries;
CREATE POLICY "time_entries_all" ON public.time_entries FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "employees_all" ON public.employees;
CREATE POLICY "employees_all" ON public.employees FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pay_runs_all" ON public.pay_runs;
CREATE POLICY "pay_runs_all" ON public.pay_runs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pay_stubs_all" ON public.pay_stubs;
CREATE POLICY "pay_stubs_all" ON public.pay_stubs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vendors_all" ON public.vendors;
CREATE POLICY "vendors_all" ON public.vendors FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vault_documents_all" ON public.vault_documents;
CREATE POLICY "vault_documents_all" ON public.vault_documents FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chart_of_accounts_all" ON public.chart_of_accounts;
CREATE POLICY "chart_of_accounts_all" ON public.chart_of_accounts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchase_orders_all" ON public.purchase_orders;
CREATE POLICY "purchase_orders_all" ON public.purchase_orders FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchase_order_lines_all" ON public.purchase_order_lines;
CREATE POLICY "purchase_order_lines_all" ON public.purchase_order_lines FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "inventory_items_all" ON public.inventory_items;
CREATE POLICY "inventory_items_all" ON public.inventory_items FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "inventory_adjustments_all" ON public.inventory_adjustments;
CREATE POLICY "inventory_adjustments_all" ON public.inventory_adjustments FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "client_portal_tokens_owner" ON public.client_portal_tokens;
DROP POLICY IF EXISTS "client_portal_tokens_public" ON public.client_portal_tokens;
CREATE POLICY "client_portal_tokens_owner" ON public.client_portal_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "client_portal_tokens_public" ON public.client_portal_tokens FOR SELECT USING (true);

DROP POLICY IF EXISTS "invoice_payments_all" ON public.invoice_payments;
CREATE POLICY "invoice_payments_all" ON public.invoice_payments FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bank_accounts_all" ON public.bank_accounts;
CREATE POLICY "bank_accounts_all" ON public.bank_accounts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "plaid_sync_cursors_all" ON public.plaid_sync_cursors;
CREATE POLICY "plaid_sync_cursors_all" ON public.plaid_sync_cursors FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "hub_prospects_staff" ON public.hub_prospects;
CREATE POLICY "hub_prospects_staff" ON public.hub_prospects FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('consultant','admin')));

DROP POLICY IF EXISTS "audit_logs_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_admin" ON public.audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- SECTION 6: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_user ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON public.journal_entry_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_je ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user_date ON public.recurring_transactions(user_id, next_date);
CREATE INDEX IF NOT EXISTS idx_bills_user ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_due ON public.bills(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_obligations_user ON public.tax_obligations(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_estimates_user ON public.estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_mileage_user_date ON public.mileage_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON public.time_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_employees_user ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_pay_runs_user ON public.pay_runs(user_id, pay_date);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_run ON public.pay_stubs(pay_run_id);
CREATE INDEX IF NOT EXISTS idx_vendors_user ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_docs_user ON public.vault_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_coa_user ON public.chart_of_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_po_user ON public.purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON public.inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_token ON public.client_portal_tokens(token);
CREATE INDEX IF NOT EXISTS idx_portal_invoice ON public.client_portal_tokens(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments ON public.invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

