'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { hasAccess, type Plan, PLAN_LABELS, PLAN_PRICES } from '@/lib/plan-features'

type User = { name?: string | null; email?: string | null; role?: string | null }

type NavItem = {
  href: string
  icon: string
  label: string
  exact?: boolean
  minPlan: Plan
}

// Silver = Quicken | Gold = Xero | Platinum = NetSuite
const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: 'Accounts & Money',
    items: [
      { href: '/accounting',              icon: '◈', label: 'Overview',              exact: true, minPlan: 'silver' },
      { href: '/accounting/connect',      icon: '🏦', label: 'Connected Accounts',               minPlan: 'silver' },
      { href: '/accounting/transactions', icon: '⇄', label: 'Transactions',                      minPlan: 'silver' },
      { href: '/accounting/budgets',      icon: '◎', label: 'Budgets',                           minPlan: 'silver' },
    ],
  },
  {
    title: 'Business Accounting',
    items: [
      { href: '/accounting/invoices',     icon: '▤', label: 'Invoices & Estimates',              minPlan: 'gold' },
      { href: '/accounting/customers',    icon: '◯', label: 'Customers',                         minPlan: 'gold' },
      { href: '/accounting/bills',        icon: '▥', label: 'Bills & Payables',                  minPlan: 'gold' },
      { href: '/accounting/vendors',      icon: '⬡', label: 'Vendors & 1099',                   minPlan: 'gold' },
      { href: '/accounting/recurring',    icon: '↺', label: 'Recurring',                         minPlan: 'gold' },
      { href: '/accounting/rules',        icon: '⚙', label: 'Automation Rules',                  minPlan: 'gold' },
    ],
  },
  {
    title: 'Finance & Reports',
    items: [
      { href: '/accounting/reconcile',    icon: '⇌', label: 'Reconciliation',                    minPlan: 'gold' },
      { href: '/accounting/reports',      icon: '▦', label: 'Reports',                           minPlan: 'gold' },
      { href: '/accounting/forecast',     icon: '🔮', label: 'Cash Flow Forecast',               minPlan: 'gold' },
      { href: '/accounting/scanner',      icon: '✦', label: 'AI Receipt Scanner',                minPlan: 'gold' },
      { href: '/accounting/tracker',      icon: '▷', label: 'Mileage & Time',                   minPlan: 'gold' },
      { href: '/accounting/coa',          icon: '≡', label: 'Chart of Accounts',                 minPlan: 'platinum' },
      { href: '/accounting/journal',      icon: '⊟', label: 'Journal Entries',                   minPlan: 'platinum' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/accounting/payroll',        icon: '◫', label: 'Payroll',                         minPlan: 'platinum' },
      { href: '/accounting/tax',            icon: '🧮', label: 'Tax Center',                     minPlan: 'platinum' },
      { href: '/accounting/inventory',      icon: '▣', label: 'Inventory',                       minPlan: 'platinum' },
      { href: '/accounting/purchaseorders', icon: '⊕', label: 'Purchase Orders',                 minPlan: 'platinum' },
      { href: '/accounting/projects',       icon: '◧', label: 'Projects',                        minPlan: 'platinum' },
    ],
  },
]

const PLAN_BADGE: Record<Plan, { label: string; cls: string }> = {
  silver:   { label: 'Silver',   cls: 'bg-slate-100 text-slate-500' },
  gold:     { label: 'Gold',     cls: 'bg-amber-100 text-amber-700' },
  platinum: { label: 'Platinum', cls: 'bg-blue-100 text-[#0F4C81]' },
}

const UPGRADE_TO: Record<Plan, Plan> = {
  silver: 'gold',
  gold: 'platinum',
  platinum: 'platinum',
}

export default function AccountingShell({
  user,
  plan = 'silver',
  children,
}: {
  user?: User
  plan?: Plan
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const isAdmin = user?.role === 'admin' || user?.role === 'iebc_staff'

  function active(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  const allItems = NAV.flatMap(s => s.items)
  const activeItem = allItems.filter(i => active(i.href, i.exact)).pop()
  const activeSection = NAV.find(s => s.items.some(i => i.href === activeItem?.href))

  const upgradeTo = UPGRADE_TO[plan]
  const badge = PLAN_BADGE[plan]

  const Sidebar = () => (
    <aside className="w-56 flex flex-col bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="h-14 bg-[#0F4C81] flex items-center px-4 gap-2.5 shrink-0">
        <div className="w-8 h-8 bg-[#C8902A] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-black text-[11px] tracking-tight">IEBC</span>
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-sm">Efficient</p>
          <p className="text-blue-300 text-[10px]">Accounting & Finance</p>
        </div>
      </div>

      {/* Plan badge */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badge.cls}`}>
            {badge.label} Plan
          </span>
          {plan !== 'platinum' && (
            <Link
              href={`/accounting/checkout?plan=${upgradeTo}&upgrade=1`}
              className="text-[10px] font-semibold text-[#C8902A] hover:underline"
            >
              Upgrade →
            </Link>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-3 px-2">
        {NAV.map(({ title, items }) => {
          const visibleItems = items.filter(item => {
            // Always show items the user can access; also show locked items so they know what exists
            return true
          })
          return (
            <div key={title}>
              <p className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">{title}</p>
              <div className="space-y-px">
                {visibleItems.map(({ href, icon, label, exact, minPlan }) => {
                  const isActive = active(href, exact)
                  const canAccess = hasAccess(plan, href)

                  if (!canAccess) {
                    const needed = PLAN_LABELS[minPlan]
                    const neededPrice = PLAN_PRICES[minPlan]
                    return (
                      <Link
                        key={label}
                        href={`/accounting/checkout?plan=${minPlan}&upgrade=1`}
                        className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] text-gray-300 hover:bg-gray-50 hover:text-gray-400 border-l-[3px] border-transparent transition-all group"
                        title={`Requires ${needed} plan — ${neededPrice}/mo`}
                      >
                        <span className="text-[15px] leading-none w-4 text-center shrink-0 opacity-30">{icon}</span>
                        <span className="truncate flex-1 line-through">{label}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${
                          minPlan === 'gold' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {needed}
                        </span>
                      </Link>
                    )
                  }

                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-100 ${
                        isActive
                          ? 'bg-blue-50 text-[#0F4C81] font-semibold border-l-[3px] border-[#0F4C81]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
                      }`}
                    >
                      <span className={`text-[15px] leading-none w-4 text-center shrink-0 ${isActive ? 'text-[#0F4C81]' : 'text-gray-400'}`}>
                        {icon}
                      </span>
                      <span className="truncate">{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 p-2 space-y-1">
        {isAdmin && (
          <Link
            href="/hub"
            className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent transition-all"
          >
            <span className="text-[15px] text-gray-400 w-4 text-center">⊞</span>
            <span>Master Hub</span>
          </Link>
        )}
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all ${
            pathname.startsWith('/settings')
              ? 'bg-blue-50 text-[#0F4C81] font-semibold border-l-[3px] border-[#0F4C81]'
              : 'text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent'
          }`}
        >
          <span className="text-[15px] text-gray-400 w-4 text-center">⚙</span>
          <span>Settings</span>
        </Link>
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-7 h-7 rounded-full bg-[#0F4C81] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-800 truncate">{user?.name ?? 'My Account'}</p>
            <p className="text-[10px] text-gray-400 capitalize truncate">{user?.role ?? 'owner'}</p>
          </div>
          <span className="w-2 h-2 bg-green-400 rounded-full shrink-0 border-2 border-white" />
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          role="button"
          aria-label="Close navigation"
          tabIndex={-1}
        />
      )}

      <div className="hidden lg:flex shrink-0"><Sidebar /></div>
      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden flex transition-transform duration-200 will-change-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="lg:hidden p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <div className="flex-1 hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            {activeSection && <span>{activeSection.title}</span>}
            {activeSection && <span>/</span>}
            {activeItem && <span className="font-semibold text-gray-600">{activeItem.label}</span>}
          </div>
          <div className="flex-1" />
          {plan !== 'platinum' && (
            <Link
              href={`/accounting/checkout?plan=${upgradeTo}&upgrade=1`}
              className="text-[11px] sm:text-[13px] bg-[#C8902A] hover:bg-[#b07820] text-white px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition shadow-sm whitespace-nowrap min-h-[36px] inline-flex items-center"
            >
              ★ Upgrade to {PLAN_LABELS[upgradeTo]}
            </Link>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
