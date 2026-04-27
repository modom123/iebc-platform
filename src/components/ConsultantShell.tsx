'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type User = { name?: string | null; email?: string | null; role?: string | null }

const NAV = [
  {
    title: 'My Work',
    items: [
      { href: '/consultant',        icon: '⊞', label: 'My Dashboard',   exact: true },
      { href: '/consultant/tasks',  icon: '☑', label: 'My Tasks' },
      { href: '/consultant/pipeline', icon: '◆', label: 'My Pipeline' },
    ],
  },
  {
    title: 'Sales & Outreach',
    items: [
      { href: '/consultant/leads',    icon: '◆', label: 'CRM / Leads' },
      { href: '/consultant/outreach', icon: '✉', label: 'Outreach Center' },
      { href: '/consultant/clients',  icon: '◯', label: 'My Clients' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { href: '/consultant/documents', icon: '⊞', label: 'Proposals & Docs' },
      { href: '/consultant/playbook',  icon: '▤', label: 'Sales Playbook' },
      { href: '/consultant/workspace', icon: '💬', label: 'AI Advisor Support' },
    ],
  },
]

export default function ConsultantShell({ user, children }: { user?: User; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  function active(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'IC'

  const allItems = NAV.flatMap(s => s.items)
  const activeItem = allItems.filter(i => active(i.href, i.exact)).pop()
  const activeSection = NAV.find(s => s.items.some(i => i.href === activeItem?.href))

  const Sidebar = () => (
    <aside className="w-56 flex flex-col bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="h-14 bg-[#0d1f0f] flex items-center px-4 gap-2.5 shrink-0">
        <div className="w-8 h-8 bg-[#C9A02E] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-black text-[10px] tracking-tight">NM</span>
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-sm tracking-wide">New Money</p>
          <p className="text-green-400 text-[9px] font-mono tracking-[0.18em] uppercase">Close · Convert · Collect</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-3 px-2">
        {NAV.map(({ title, items }) => (
          <div key={title}>
            <p className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">{title}</p>
            <div className="space-y-px">
              {items.map(({ href, icon, label, exact }) => {
                const isActive = active(href, exact)
                return (
                  <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-100 ${
                      isActive
                        ? 'bg-green-50 text-[#0d4a1a] font-semibold border-l-[3px] border-[#C9A02E]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
                    }`}>
                    <span className={`text-[15px] leading-none w-4 text-center shrink-0 ${isActive ? 'text-[#0d4a1a]' : 'text-gray-400'}`}>{icon}</span>
                    <span className="truncate">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 p-2 space-y-1">
        {user?.role === 'admin' && (
          <Link href="/hub" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12px] text-gray-500 hover:bg-gray-50 border-l-[3px] border-transparent transition-all">
            <span className="text-[13px] opacity-60 w-4 text-center">⚡</span>
            <span className="truncate">Switch to PHANTOM</span>
            <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">PH</span>
          </Link>
        )}
        <Link href="/settings" onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all ${
            pathname.startsWith('/settings')
              ? 'bg-green-50 text-[#0d4a1a] font-semibold border-l-[3px] border-[#C9A02E]'
              : 'text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent'
          }`}>
          <span className="text-[15px] text-gray-400 w-4 text-center">⚙</span>
          <span>Settings</span>
        </Link>
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-7 h-7 rounded-full bg-[#0d1f0f] flex items-center justify-center text-white text-[11px] font-bold shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-800 truncate">{user?.name ?? 'My Account'}</p>
            <p className="text-[10px] text-gray-400 truncate">New Money · IEBC</p>
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
          <Link href="/consultant/leads" className="hidden sm:flex items-center gap-1.5 text-[13px] text-[#0d4a1a] hover:bg-green-50 px-3 py-1.5 rounded-lg font-medium transition border border-green-200">
            ◆ Add Lead
          </Link>
          <Link href="/consultant/outreach" className="text-[11px] sm:text-[13px] bg-[#C9A02E] hover:bg-yellow-600 text-white px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition shadow-sm whitespace-nowrap">
            ✉ Outreach
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
