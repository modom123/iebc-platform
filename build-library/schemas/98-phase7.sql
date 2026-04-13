-- ============================================================
-- Component 98 — Phase 7 Schema
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CHART OF ACCOUNTS
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  account_type  TEXT NOT NULL,
  sub_type      TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  balance       NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY coa_owner ON chart_of_accounts FOR ALL USING (user_id = auth.uid());

-- JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS journal_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_number  TEXT NOT NULL,
  date          DATE NOT NULL,
  description   TEXT NOT NULL,
  reference     TEXT,
  status        TEXT NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
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
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY jel_owner ON journal_entry_lines FOR ALL USING (user_id = auth.uid());

-- PURCHASE ORDERS
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
  status          TEXT NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
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
ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY pol_owner ON purchase_order_lines FOR ALL USING (user_id = auth.uid());

-- INVENTORY
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

-- CLIENT PORTAL TOKENS
CREATE TABLE IF NOT EXISTS client_portal_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE client_portal_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY portal_token_owner ON client_portal_tokens FOR ALL USING (user_id = auth.uid());
CREATE POLICY portal_token_public_read ON client_portal_tokens FOR SELECT USING (true);

-- INVOICE PAYMENTS
CREATE TABLE IF NOT EXISTS invoice_payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id            UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount                NUMERIC(14,2) NOT NULL,
  method                TEXT,
  portal_token_id       UUID REFERENCES client_portal_tokens(id),
  stripe_payment_id     TEXT,
  paid_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_owner ON invoice_payments FOR ALL USING (user_id = auth.uid());

-- ALTER INVOICES: add paid_at + payment_method
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- EMPLOYEES (payroll)
CREATE TABLE IF NOT EXISTS employees (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  title           TEXT,
  department      TEXT,
  pay_type        TEXT NOT NULL DEFAULT 'salary',
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
  status          TEXT NOT NULL DEFAULT 'pending',
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

-- VENDORS
CREATE TABLE IF NOT EXISTS vendors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  company         TEXT,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  vendor_type     TEXT NOT NULL DEFAULT 'vendor',
  payment_terms   TEXT NOT NULL DEFAULT 'net30',
  tax_id          TEXT,
  is_1099         BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_owner ON vendors FOR ALL USING (user_id = auth.uid());

-- DOCUMENT VAULT
CREATE TABLE IF NOT EXISTS vault_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'Other',
  notes           TEXT,
  file_type       TEXT,
  file_size       BIGINT,
  storage_path    TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_owner ON vault_documents FOR ALL USING (user_id = auth.uid());

-- STORAGE BUCKET (run separately in Supabase Dashboard > Storage)
-- CREATE BUCKET "documents" (private)
-- Policy: users can only access their own folder (path starts with their user_id)
