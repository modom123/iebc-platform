# IEBC Build Library — Component Catalog
> Assemble SaaS products like a car. Pick components by number, drop in, deploy.

## How It Works
Each component has a number (01–100). Every new client build starts from a
manifest: `{ "components": [01,02,03,11,12,13] }`. A dev assembles those
numbered folders into `/src/app/` and the product is live in hours, not weeks.

---

## Component Map

### FOUNDATION (01–10) — Required for every build
| # | Component | Files | Dependencies |
|---|-----------|-------|--------------|
| 01 | Auth System | `app/auth/login`, `app/auth/signup`, `app/auth/forgot-password`, `app/auth/reset-password`, `app/auth/callback` | 03, 05 |
| 02 | AppShell Navigation | `components/AppShell.tsx` | — |
| 03 | Middleware (auth guard + security headers) | `src/middleware.ts` | 05 |
| 04 | Root Layout + Globals | `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts` | — |
| 05 | Supabase Client (server + browser) | `lib/supabase/server.ts`, `lib/supabase/browser.ts` | — |
| 06 | Database Schema — Core | `supabase-schema-core.sql` (profiles, subscriptions) | — |
| 07 | Landing Page / Marketing Site | `app/page.tsx` | 04 |
| 08 | Not Found + Error pages | `app/not-found.tsx`, `app/error.tsx` | 04 |
| 09 | Charts (bar, donut, line) | `components/Charts.tsx` | — |
| 10 | Toast / Notification | `components/Toast.tsx` | — |

### ACCOUNTING (11–35) — Full accounting suite
| # | Component | Files | Dependencies |
|---|-----------|-------|--------------|
| 11 | Accounting Layout (AppShell wrapper) | `app/accounting/layout.tsx` | 02, 05 |
| 12 | Accounting Dashboard | `app/accounting/page.tsx` | 11, 09 |
| 13 | Transactions (list, add, filter, export) | `app/accounting/transactions/`, `app/api/accounting/transactions/` | 11 |
| 14 | Invoices (line items, PDF, status, share) | `app/accounting/invoices/`, `app/api/accounting/invoices/` | 11, 15 |
| 15 | Customers (CRM-lite, history) | `app/accounting/customers/`, `app/api/accounting/customers/` | 11 |
| 16 | Estimates & Quotes (→ convert to invoice) | `app/accounting/estimates/`, `app/api/accounting/estimates/` | 11, 15 |
| 17 | Bills & Payables | `app/accounting/bills/`, `app/api/accounting/bills/` | 11 |
| 18 | Chart of Accounts | `app/accounting/coa/`, `app/api/accounting/coa/` | 11 |
| 19 | Journal Entries (double-entry, debit/credit) | `app/accounting/journal/`, `app/api/accounting/journal/` | 11, 18 |
| 20 | Bank Reconciliation | `app/accounting/reconcile/`, `app/api/accounting/reconcile/` | 11, 13 |
| 21 | Financial Reports (P&L, Balance Sheet) | `app/accounting/reports/`, `app/api/accounting/reports/` | 11 |
| 22 | Tax Center (quarterly estimates, 1099) | `app/accounting/tax/`, `app/api/accounting/tax/` | 11 |
| 23 | Budgets vs Actual | `app/accounting/budgets/`, `app/api/accounting/budgets/` | 11 |
| 24 | AI Receipt Scanner | `app/accounting/scanner/`, `app/api/accounting/scanner/` | 11 |
| 25 | Cash Flow Forecast | `app/accounting/forecast/`, `app/api/accounting/cash-forecast/` | 11 |
| 26 | Recurring Transactions | `app/accounting/recurring/`, `app/api/accounting/recurring/` | 11, 13 |
| 27 | Transaction Rules (auto-categorize) | `app/accounting/rules/`, `app/api/accounting/rules/` | 11, 13 |
| 28 | Projects & Job Costing | `app/accounting/projects/`, `app/api/accounting/projects/` | 11 |
| 29 | Mileage & Time Tracker | `app/accounting/tracker/`, `app/api/accounting/tracker/` | 11 |
| 30 | Aged Receivables | `app/accounting/aged-receivables/` | 11, 14 |
| 31 | Audit Log (who changed what) | `app/accounting/audit/`, `app/api/accounting/audit/`, `lib/audit.ts` | 11 |
| 32 | Accounts Overview (ledger view) | `app/accounting/accounts/`, `app/api/accounting/accounts/` | 11, 18 |
| 33 | Plaid Bank Connect (live feeds) | `app/accounting/connect/`, `app/api/accounting/plaid/` | 11 |
| 34 | CSV Export (transactions, invoices, leads, customers) | `app/api/export/` | — |
| 35 | Checkout / Subscription Upgrade | `app/accounting/checkout/` | 05 |

### OPERATIONS (36–50) — Back-office / supply chain
| # | Component | Files | Dependencies |
|---|-----------|-------|--------------|
| 36 | Vendors & 1099 | `app/accounting/vendors/`, `app/api/accounting/vendors/` | 11 |
| 37 | Purchase Orders (with line items) | `app/accounting/purchaseorders/`, `app/api/accounting/purchaseorders/` | 11, 36 |
| 38 | Inventory Management (SKU, stock, reorder) | `app/accounting/inventory/`, `app/api/accounting/inventory/` | 11 |
| 39 | Payroll (employees, pay runs, pay stubs) | `app/accounting/payroll/`, `app/api/accounting/payroll/` | 11 |
| 40 | Clients View (client-facing account detail) | `app/accounting/clients/` | 11, 15 |

### HUB / WORKSPACE (51–65) — Business operations
| # | Component | Files | Dependencies |
|---|-----------|-------|--------------|
| 51 | Hub Layout (AppShell wrapper) | `app/hub/layout.tsx` | 02, 05 |
| 52 | Hub Dashboard (subscriptions, tasks, leads) | `app/hub/page.tsx` | 51 |
| 53 | Leads CRM Pipeline (kanban + table) | `app/hub/leads/`, `app/api/leads/` | 51 |
| 54 | Tasks & Projects | `app/hub/tasks/`, `app/api/tasks/` | 51 |
| 55 | Team Members (roles, seats, invite) | `app/hub/team/`, `app/api/team/` | 51 |
| 56 | Business Formation (LLC, S-Corp, C-Corp) | `app/hub/formation/`, `app/api/formation/` | 51 |
| 57 | Document Vault (upload, categorize, download) | `app/hub/documents/`, `app/api/hub/documents/` | 51 |

### CLIENT PORTAL (66–75) — Public-facing
| # | Component | Files | Dependencies |
|---|-----------|-------|--------------|
| 66 | Client Portal Shell | `app/portal/page.tsx` | — |
| 67 | Invoice Portal View (public token page) | `app/portal/[token]/page.tsx`, `app/portal/[token]/ClientPortalView.tsx` | — |
| 68 | Portal Payment Form (Card + ACH) | inside 67 | 67 |
| 69 | Share Invoice Link (generate + copy) | inside `app/accounting/invoices/` | 14 |
| 70 | Portal Token API (generate, list, revoke) | `app/api/portal/route.ts`, `app/api/portal/generate/` | — |
| 71 | Portal Pay API (process, mark paid, log) | `app/api/portal/pay/` | 70 |

### SETTINGS (76–80)
| # | Component | Files | Dependencies |
|---|-----------|-------|--------------|
| 76 | Settings Layout | `app/settings/layout.tsx` | 02, 05 |
| 77 | Settings Page (profile, password, plan, billing) | `app/settings/page.tsx` | 76 |

### PAYMENTS / INTEGRATIONS (81–90)
| # | Component | Files | Dependencies |
|---|-----------|-------|--------------|
| 81 | Stripe Checkout API | `app/api/stripe/checkout/` | — |
| 82 | Stripe Webhook (subscription lifecycle) | `app/api/stripe/webhook/` | 81 |
| 83 | Plaid Link + Sync | `app/api/accounting/plaid/` | — |

### DATABASE SCHEMAS (91–100) — Run once per project in Supabase SQL editor
| # | Schema | Tables Created |
|---|--------|---------------|
| 91 | Core Schema | `profiles`, `subscriptions`, `consultant_assignments` |
| 92 | Phase 1 Schema | `transactions`, `invoices`, `invoice_lines`, `customers`, `bills`, `budgets`, `estimates` |
| 93 | Phase 2 Schema | `projects`, `mileage_log`, `time_entries`, `team_members`, `formation_checklists`, `recurring_rules`, `transaction_rules` |
| 94 | Phase 3 Schema | `leads`, `tasks` |
| 95 | Phase 4 Schema | `reconciliation_sessions`, `bank_accounts` |
| 96 | Phase 5 Schema | `employees`, `pay_runs`, `pay_stubs`, `vendors`, `vault_documents` |
| 97 | Phase 6 Schema | `chart_of_accounts`, `journal_entries`, `journal_entry_lines`, `audit_log`, `plaid_connections` |
| 98 | Phase 7 Schema | `purchase_orders`, `purchase_order_lines`, `inventory_items`, `inventory_adjustments`, `client_portal_tokens`, `invoice_payments` |
| 99 | Storage Buckets | Supabase Storage: `documents` bucket + RLS policies |
| 100 | Admin Schema | `admin_logs`, `platform_settings` |

---

## Pre-Built Product Configurations

### Config A — Accounting SaaS (QuickBooks competitor)
```
Components: 01–09, 11–35, 76–77, 81–82, 91–95
```

### Config B — Full Business Platform (NetSuite competitor)
```
Components: 01–100 (everything)
```

### Config C — CRM + Hub Only
```
Components: 01–09, 51–57, 76–77, 81–82, 91–94
```

### Config D — Client Portal + Invoicing
```
Components: 01–09, 11, 14–16, 34, 66–71, 76–77, 81–82, 91–92
```

### Config E — Payroll + HR
```
Components: 01–09, 11, 15, 36, 39, 55, 76–77, 91–96
```

---

## Assembly Instructions (for your tech team)

1. Clone the base repo: `git clone https://github.com/modom123/iebc-platform`
2. Open `build-library/manifest.json`
3. Set the components you need for this client build
4. Run: `node build-library/assemble.js --config=A --client=ClientName`
5. Set env vars (Supabase URL/key, Stripe keys, Anthropic key)
6. Run the required schema files in Supabase SQL editor (components 91–100)
7. Deploy to Vercel: `vercel --prod`

**Build time estimate per config:**
- Config A: ~2 hours (env vars + schema + Vercel)
- Config B: ~4 hours (all schemas + Stripe/Plaid setup)
- Config C: ~1 hour
- Config D: ~1.5 hours
- Config E: ~2 hours
