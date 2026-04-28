export type Plan = 'silver' | 'gold' | 'platinum'

// Routes each tier ADDS on top of the tier below (cumulative).
// Silver = Quicken (personal finance, connected accounts)
// Gold   = Xero   (small business accounting)
// Platinum = NetSuite (full ERP)
const SILVER_ROUTES = [
  '/accounting',
  '/accounting/transactions',
  '/accounting/connect',    // bank, credit card, investment accounts
  '/accounting/accounts',   // connected account list
  '/accounting/budgets',
]

const GOLD_ROUTES = [
  '/accounting/invoices',
  '/accounting/estimates',
  '/accounting/customers',
  '/accounting/bills',
  '/accounting/vendors',
  '/accounting/reconcile',
  '/accounting/reports',
  '/accounting/scanner',
  '/accounting/recurring',
  '/accounting/rules',
  '/accounting/tracker',
  '/accounting/forecast',
  '/accounting/aged-receivables',
]

const PLATINUM_ROUTES = [
  '/accounting/payroll',
  '/accounting/tax',
  '/accounting/inventory',
  '/accounting/purchaseorders',
  '/accounting/projects',
  '/accounting/coa',
  '/accounting/journal',
  '/accounting/audit',
  '/accounting/clients',
]

const ALL_GOLD_ROUTES = [...SILVER_ROUTES, ...GOLD_ROUTES]
const ALL_PLATINUM_ROUTES = [...ALL_GOLD_ROUTES, ...PLATINUM_ROUTES]

const ALLOWED: Record<Plan, string[]> = {
  silver: SILVER_ROUTES,
  gold: ALL_GOLD_ROUTES,
  platinum: ALL_PLATINUM_ROUTES,
}

export function hasAccess(plan: Plan | null | undefined, pathname: string): boolean {
  if (!plan) return false
  return ALLOWED[plan].some(r => pathname === r || pathname.startsWith(r + '/'))
}

export function requiredPlanFor(pathname: string): Plan {
  if (PLATINUM_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) return 'platinum'
  if (GOLD_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) return 'gold'
  return 'silver'
}

export const PLAN_LABELS: Record<Plan, string> = {
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

export const PLAN_PRICES: Record<Plan, string> = {
  silver: '$9',
  gold: '$22',
  platinum: '$42',
}

export const PLAN_TAGLINES: Record<Plan, string> = {
  silver: 'Connect all your accounts. Track everything.',
  gold: 'Invoice clients. Manage your books. Grow.',
  platinum: 'Payroll, tax, inventory, and the full ERP suite.',
}

// What each plan adds over the previous tier — used in upgrade walls
export const PLAN_UPGRADE_FEATURES: Record<'gold' | 'platinum', string[]> = {
  gold: [
    'Invoicing & estimates',
    'Customer management',
    'Bills & payables',
    'Vendor & 1099 management',
    'Bank reconciliation',
    'P&L, balance sheet & cash flow reports',
    'AI receipt scanner',
    'Recurring transactions & automation rules',
    'Mileage & time tracker',
    'Cash flow forecast',
  ],
  platinum: [
    'Payroll management',
    'Tax center & 1099 filing',
    'Inventory management',
    'Purchase orders',
    'Projects & job costing',
    'Chart of accounts',
    'Full double-entry journal',
    'Audit trail',
  ],
}
