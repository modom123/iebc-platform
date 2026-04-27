'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type User = { name?: string | null; email?: string | null }

const NAV = [
  { href: '/workspace', icon: '⊞', label: 'Home', exact: true },
  { href: '/workspace/team', icon: '◉', label: 'My Team' },
  { href: '/workspace/messages', icon: '◈', label: 'Messages' },
  { href: '/workspace/documents', icon: '▤', label: 'Documents' },
]

export default function WorkspaceSidebar({ user }: { user?: User }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const sidebar = (
    <aside className="flex flex-col h-full w-56 bg-[#0B2140] text-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/workspace" className="block">
          <p className="text-lg font-extrabold tracking-tight text-white">IEBC</p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#C9A02E] text-white">
            Advisor Workspace
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive(item.href, item.exact)
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Upgrade CTA */}
      <div className="mx-3 mb-3 rounded-xl p-3.5" style={{ background: 'rgba(201,160,46,0.15)', border: '1px solid rgba(201,160,46,0.3)' }}>
        <p className="text-xs font-bold text-[#C9A02E] mb-1">Upgrade to Full Hub</p>
        <p className="text-[11px] text-white/60 mb-2.5 leading-relaxed">Accounting, CRM, invoicing &amp; automation — all connected.</p>
        <Link
          href="/checkout/hub"
          className="block text-center py-1.5 rounded-lg text-xs font-bold bg-[#C9A02E] text-white hover:bg-yellow-500 transition"
        >
          Upgrade →
        </Link>
      </div>

      {/* User / logout */}
      <div className="px-4 pb-4 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {(user?.name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'My Account'}</p>
            <p className="text-[10px] text-white/50 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2.5">
          <Link href="/hub" className="flex-1 text-center text-[10px] font-bold py-1 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition">
            Full Hub
          </Link>
          <Link href="/auth/login" className="flex-1 text-center text-[10px] font-bold py-1 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition">
            Sign Out
          </Link>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B2140] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-extrabold text-white">IEBC</p>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#C9A02E]">Advisor Workspace</span>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} className="text-white/70 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-56 flex flex-col" onClick={e => e.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-56 shrink-0">
        {sidebar}
      </div>
    </>
  )
}
