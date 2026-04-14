'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type User = { name?: string | null; email?: string | null; role?: string | null }

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { href: '/hub', icon: '⊞', label: 'Dashboard', exact: true },
    ],
  },
  {
    title: 'Accounting',
    items: [
      { href: '/accounting', icon: '◈', label: 'Overview', exact: true },
      { href: '/accounting/transactions', icon: '⇄', label: 'Transactions' },
      { href: '/accounting/invoices', icon: '▤', label: 'Invoices' },
      { href: '/accounting/estimates', icon: '◻', label: 'Estimates' },
      { href: '/accounting/bills', icon: '▥', label: 'Bills & Payables' },
      { href: '/accounting/customers', icon: '◯', label: 'Customers' },
      { href: '/accounting/vendors', icon: '⬡', label: 'Vendors & 1099' },
      { href: '/accounting/payroll', icon: '◫', label: 'Payroll' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/accounting/coa', icon: '≡', label: 'Chart of Accounts' },
      { href: '/accounting/journal', icon: '⊟', label: 'Journal Entries' },
      { href: '/accounting/reconcile', icon: '⇌', label: 'Reconciliation' },
      { href: '/accounting/reports', icon: '▦', label: 'Reports' },
      { href: '/accounting/tax', icon: '◈', label: 'Tax Center' },
      { href: '/accounting/budgets', icon: '◎', label: 'Budgets' },
      { href: '/accounting/aged-receivables', icon: '⏱', label: 'Aged Receivables' },
      { href: '/accounting/forecast', icon: '▲', label: 'Cash Forecast' },
      { href: '/accounting/rules', icon: '⚡', label: 'Auto Rules' },
      { href: '/accounting/scanner', icon: '✦', label: 'AI Receipt Scanner' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/accounting/purchaseorders', icon: '⊕', label: 'Purchase Orders' },
      { href: '/accounting/inventory', icon: '▣', label: 'Inventory' },
      { href: '/accounting/projects', icon: '◧', label: 'Projects' },
      { href: '/accounting/tracker', icon: '▷', label: 'Mileage & Time' },
      { href: '/accounting/recurring', icon: '↺', label: 'Recurring' },
    ],
  },
  {
    title: 'Connect & Portals',
    items: [
      { href: '/accounting/connect', icon: '⬡', label: 'Bank Connect' },
      { href: '/accounting/clients', icon: '◈', label: 'Client Portals' },
      { href: '/accounting/audit', icon: '◉', label: 'Audit Trail' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { href: '/hub/consultants', icon: '🤖', label: 'AI Consultants' },
      { href: '/hub/leads', icon: '◆', label: 'CRM / Leads' },
      { href: '/hub/tasks', icon: '☑', label: 'Tasks' },
      { href: '/hub/team', icon: '◉', label: 'Team Members' },
      { href: '/hub/formation', icon: '⌂', label: 'Business Formation' },
      { href: '/hub/documents', icon: '⊞', label: 'Document Vault' },
    ],
  },
]

export default function AppShell({ user, children }: { user?: User; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  function active(href: string, exact?: boolean) {
    if (exact) return pathname === href
    if (href === '/hub') return pathname === '/hub'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  const Sidebar = () => (
    <aside className="w-56 flex flex-col bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="h-14 bg-[#0F4C81] flex items-center px-4 gap-2.5 shrink-0">
        <div className="w-8 h-8 bg-[#C9A02E] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-black text-[11px] tracking-tight">IEBC</span>
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-sm">Integrated Efficiency</p>
          <p className="text-blue-300 text-[10px]">Infrastructure · Automation</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-3 px-2">
        {NAV_SECTIONS.map(({ title, items }) => (
          <div key={title}>
            <p className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">
              {title}
            </p>
            <div className="space-y-px">
              {items.map(({ href, icon, label, exact }) => {
                const isActive = active(href, exact)
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
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 p-2">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all mb-1 ${
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
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden flex transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <div className="flex-1 hidden sm:block">
            {(() => {
              const allItems = NAV_SECTIONS.flatMap(s => s.items)
              const match = allItems.filter(i => i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + '/')).pop()
              const section = NAV_SECTIONS.find(s => s.items.some(i => i.href === match?.href))
              if (!match) return null
              return (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  {section && <span>{section.title}</span>}
                  {section && <span>/</span>}
                  <span className="font-semibold text-gray-600">{match.label}</span>
                </div>
              )
            })()}
          </div>
          <div className="flex-1" />
          <Link
            href="/accounting/scanner"
            className="hidden sm:flex items-center gap-1.5 text-[13px] text-[#0F4C81] hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition border border-blue-100"
          >
            ✦ AI Scanner
          </Link>
          <Link
            href="/accounting/checkout"
            className="text-[13px] bg-[#C9A02E] hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-semibold transition shadow-sm"
          >
            ★ Upgrade
          </Link>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
