'use client'

import { useState, useEffect } from 'react'
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
    title: 'Orders & Clients',
    items: [
      { href: '/hub/orders',     icon: '📋', label: 'Orders Inbox' },
      { href: '/hub/clients',    icon: '◯',  label: 'Client Directory' },
      { href: '/hub/leads',      icon: '◆',  label: 'CRM / Leads' },
      { href: '/hub/tasks',      icon: '☑',  label: 'Tasks' },
    ],
  },
  {
    title: 'Advisor Operations',
    items: [
      { href: '/hub/workspace',  icon: '💬', label: 'Advisor Workspace' },
      { href: '/hub/workforce',  icon: '🏗️', label: 'AI Advisor Workforce' },
      { href: '/hub/consultants',icon: '🤖', label: 'AI Consultants' },
      { href: '/hub/team',       icon: '◉',  label: 'Team Members' },
    ],
  },
  {
    title: 'Business Tools',
    items: [
      { href: '/hub/documents',  icon: '⊞',  label: 'Document Vault' },
      { href: '/hub/formation',  icon: '⌂',  label: 'Business Formation' },
      { href: '/hub/social',     icon: '📱',  label: 'Social Optimize' },
    ],
  },
  {
    title: 'Accounting & Finance',
    items: [
      { href: '/accounting',              icon: '◈', label: 'Overview' },
      { href: '/accounting/transactions', icon: '⇄', label: 'Transactions' },
      { href: '/accounting/invoices',     icon: '▤', label: 'Invoices' },
      { href: '/accounting/reports',      icon: '▦', label: 'Reports' },
      { href: '/accounting/coa',          icon: '≡', label: 'Chart of Accounts' },
      { href: '/accounting/payroll',      icon: '◫', label: 'Payroll' },
      { href: '/accounting/tax',          icon: '◈', label: 'Tax Center' },
      { href: '/accounting/bills',        icon: '▥', label: 'Bills & Payables' },
    ],
  },
]

export default function AppShell({ user, children }: { user?: User; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)
  const pathname = usePathname()

  // Poll for pending orders count (new II/bundle/website orders)
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/infrastructure/order')
        if (!res.ok) return
        const data = await res.json()
        const pending = (data.orders as { status?: string }[]).filter(o => o.status === 'pending').length
        setPendingOrders(pending)
      } catch { /* non-blocking */ }
    }
    fetchCount()
    const id = setInterval(fetchCount, 60_000)
    return () => clearInterval(id)
  }, [])

  function active(href: string, exact?: boolean) {
    if (exact) return pathname === href
    if (href === '/hub') return pathname === '/hub'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  const allItems = NAV_SECTIONS.flatMap(s => s.items)
  const activeItem = allItems.filter(i => active(i.href, i.exact)).pop()
  const activeSection = NAV_SECTIONS.find(s => s.items.some(i => i.href === activeItem?.href))

  const Sidebar = () => (
    <aside className="w-56 flex flex-col bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="h-14 bg-[#0F4C81] flex items-center px-4 gap-2.5 shrink-0">
        <div className="w-8 h-8 bg-[#C9A02E] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-black text-[11px] tracking-tight">IEBC</span>
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-sm">Master Hub</p>
          <p className="text-blue-300 text-[10px]">Operations · Infrastructure</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-3 px-2">
        {NAV_SECTIONS.map(({ title, items }) => (
          <div key={title}>
            <p className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">{title}</p>
            <div className="space-y-px">
              {items.map(({ href, icon, label, exact }) => {
                const isActive = active(href, exact)
                const badge = href === '/hub/orders' && pendingOrders > 0 ? pendingOrders : null
                return (
                  <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-100 ${
                      isActive
                        ? 'bg-blue-50 text-[#0F4C81] font-semibold border-l-[3px] border-[#0F4C81]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
                    }`}>
                    <span className={`text-[15px] leading-none w-4 text-center shrink-0 ${isActive ? 'text-[#0F4C81]' : 'text-gray-400'}`}>{icon}</span>
                    <span className="truncate flex-1">{label}</span>
                    {badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-[18px] text-center">
                        {badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Quick links */}
        <div>
          <p className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">Quick Links</p>
          <Link href="/infrastructure" className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent transition-all">
            <span className="text-[15px] text-gray-400 w-4 text-center">🏗️</span>
            <span className="truncate">Hire Advisors</span>
            <span className="ml-auto text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-bold">II</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 p-2">
        <Link href="/settings" onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all mb-1 ${
            pathname.startsWith('/settings') ? 'bg-blue-50 text-[#0F4C81] font-semibold border-l-[3px] border-[#0F4C81]' : 'text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent'
          }`}>
          <span className="text-[15px] text-gray-400 w-4 text-center">⚙</span>
          <span>Settings</span>
        </Link>
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-7 h-7 rounded-full bg-[#0F4C81] flex items-center justify-center text-white text-[11px] font-bold shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-800 truncate">{user?.name ?? 'My Account'}</p>
            <p className="text-[10px] text-gray-400 capitalize truncate">{user?.role ?? 'admin'}</p>
          </div>
          <span className="w-2 h-2 bg-green-400 rounded-full shrink-0 border-2 border-white" />
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="hidden lg:flex shrink-0"><Sidebar /></div>
      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden flex transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition min-w-[44px] min-h-[44px] flex items-center justify-center">
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
          {pendingOrders > 0 && (
            <Link href="/hub/orders" className="hidden sm:flex items-center gap-1.5 text-[13px] text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold transition border border-red-200 animate-pulse">
              🔔 {pendingOrders} new order{pendingOrders !== 1 ? 's' : ''}
            </Link>
          )}
          <Link href="/hub/orders" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
            <span className="text-lg">🔔</span>
            {pendingOrders > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pendingOrders}</span>
            )}
          </Link>
          <Link href="/accounting/checkout" className="text-[11px] sm:text-[13px] bg-[#C9A02E] hover:bg-yellow-600 text-white px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition shadow-sm whitespace-nowrap">
            ★ Upgrade
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
