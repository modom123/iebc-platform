'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Industries', href: '#industries' },
  { label: 'How It Works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
]

export default function HomeMobileNav() {
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
  }

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Full-screen overlay menu */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col md:hidden"
          style={{ background: '#0B2140' }}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-6 h-16 shrink-0"
            style={{ borderBottom: '1px solid rgba(200,144,42,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#C8902A' }}
              >
                <span className="text-white font-black text-[10px] tracking-tight">IEBC</span>
              </div>
              <div className="leading-tight">
                <p className="text-white font-bold text-sm leading-none">Integrated Efficiency</p>
                <p className="text-[10px] leading-none mt-0.5" style={{ color: '#C8902A' }}>
                  Business Consultants
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={close}
                className="block py-3 text-lg font-semibold transition-colors hover:text-[#C8902A]"
                style={{ color: 'rgba(255,255,255,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                {label}
              </a>
            ))}

            <div className="pt-8 space-y-3">
              <Link
                href="/accounting/checkout?plan=silver"
                onClick={close}
                className="block w-full text-center py-3 rounded-xl font-bold text-base transition-opacity hover:opacity-90"
                style={{ background: '#C8902A', color: '#fff' }}
              >
                Get Financial Infrastructure — $9/mo
              </Link>

              <div className="pt-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Sign In
                </p>
                <Link
                  href="/auth/login"
                  onClick={close}
                  className="block w-full text-center py-3 rounded-xl font-semibold text-base transition-colors hover:bg-white/10 border mb-2"
                  style={{ borderColor: 'rgba(200,144,42,0.5)', color: '#C8902A' }}
                >
                  Client Portal
                </Link>
                <Link
                  href="/auth/login?next=/hub/consultants"
                  onClick={close}
                  className="block w-full text-center py-3 rounded-xl font-semibold text-base transition-colors hover:bg-white/10 border"
                  style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.75)' }}
                >
                  IEBC Consultants
                </Link>
              </div>

              <Link
                href="/efficient"
                onClick={close}
                className="block w-full text-center py-3 rounded-xl font-bold text-base transition-opacity hover:opacity-90"
                style={{ background: '#C8902A', color: '#fff' }}
              >
                Get Efficient Accounting
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
