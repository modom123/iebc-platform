'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavLink {
  label: string
  href: string
  external?: boolean
}

interface MobileNavProps {
  links: NavLink[]
  cta: { label: string; href: string }
  loginHref?: string
  loginLabel?: string
  brandName?: string
  brandSub?: string
}

export default function MobileNav({ links, cta, loginHref, loginLabel, brandName = 'IEBC', brandSub }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col md:hidden bg-white">
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F4C81] rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-sm">I</span>
              </div>
              <div className="leading-tight">
                <p className="text-[#0F4C81] font-extrabold text-base leading-none">{brandName}</p>
                {brandSub && <p className="text-[10px] text-gray-400 leading-none mt-0.5">{brandSub}</p>}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
            {links.map(({ label, href, external }) => (
              external ? (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-semibold text-gray-700 border-b border-gray-100 hover:text-[#0F4C81] transition"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-semibold text-gray-700 border-b border-gray-100 hover:text-[#0F4C81] transition"
                >
                  {label}
                </Link>
              )
            ))}

            <div className="pt-6 space-y-3">
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="block w-full text-center py-3.5 rounded-xl font-bold text-base bg-[#0F4C81] hover:bg-[#082D4F] text-white transition shadow-md"
              >
                {cta.label}
              </Link>
              {loginHref && loginLabel && (
                <Link
                  href={loginHref}
                  onClick={() => setOpen(false)}
                  className="block w-full text-center py-3 rounded-xl font-semibold text-base border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  {loginLabel}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
