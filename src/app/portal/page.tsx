'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PortalHomePage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = token.trim()
    if (!clean) {
      setError('Please enter your portal token.')
      return
    }
    router.push(`/portal/${clean}`)
  }

  return (
    <main className="min-h-screen bg-[#050F1C] flex flex-col">

      {/* ── Top bar ── */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0F4C81] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-extrabold">I</span>
          </div>
          <span className="text-white font-extrabold text-base tracking-tight">IEBC</span>
        </Link>
        <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition">
          Business login →
        </Link>
      </nav>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#0F4C81]/20 border border-[#0F4C81]/40 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-[#4A9EE8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Client Portal</h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              Access your invoices, view account statements, and make secure payments — all in one place.
            </p>
          </div>

          {/* Token form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Enter your portal token</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={token}
                  onChange={e => { setToken(e.target.value); setError('') }}
                  placeholder="Paste your secure token here…"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent transition"
                  autoComplete="off"
                  spellCheck={false}
                />
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-[#0F4C81] hover:bg-[#1560A0] text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-900/30"
              >
                Open My Portal
              </button>
            </form>
          </div>

          {/* Instructions */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">How to get your token</p>
            <ol className="space-y-2.5">
              {[
                'Your service provider sends you a secure portal link via email',
                'Click the link — it contains your unique token automatically',
                'Or paste the token above if you received it separately',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="w-5 h-5 bg-[#0F4C81]/30 text-[#4A9EE8] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              SSL secured
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Payments via Stripe
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Token-protected
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-6 py-5 text-center">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} IEBC — Integrated Efficiency Business Consultants ·{' '}
          <Link href="/" className="hover:text-slate-400 transition">iebc.com</Link>
        </p>
      </footer>

    </main>
  )
}
