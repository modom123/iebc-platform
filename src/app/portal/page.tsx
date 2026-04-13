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
    <main className="min-h-screen bg-[#F5F7FA] flex flex-col">

      {/* ── Top bar ── */}
      <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F4C81] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-extrabold">I</span>
            </div>
            <span className="text-[#0F4C81] font-extrabold text-base tracking-tight">IEBC</span>
          </Link>
          <Link href="/auth/login" className="text-sm font-medium text-[#0F4C81] hover:underline transition">
            Business login →
          </Link>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">

            {/* Card header */}
            <div className="bg-[#0F4C81] px-8 py-7 text-center">
              <div className="w-16 h-16 bg-white/15 border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1">Client Portal</h1>
              <p className="text-blue-200 text-sm">Secure invoice access & payments</p>
            </div>

            {/* Card body */}
            <div className="px-8 py-7">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Enter your portal token</p>
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <input
                    type="text"
                    value={token}
                    onChange={e => { setToken(e.target.value); setError('') }}
                    placeholder="Paste your secure token here…"
                    className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent transition"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#C02020] hover:bg-[#A01818] text-white py-3 rounded-xl font-bold text-sm transition shadow-md shadow-red-100"
                >
                  Open My Portal
                </button>
              </form>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
                  <span className="bg-white px-2">How to get your token</span>
                </div>
              </div>

              {/* Instructions */}
              <ol className="space-y-3">
                {[
                  'Your service provider sends you a secure portal link via email',
                  'Click the link — it contains your unique token automatically',
                  'Or paste the token above if you received it separately',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 bg-[#0F4C81] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Card footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    SSL secured
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Stripe payments
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-[#C9A02E]/10 border border-[#C9A02E]/30 text-[#C9A02E] text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#C9A02E] rounded-full" />
                  Token-protected
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Are you a business owner?{' '}
            <Link href="/auth/login" className="text-[#0F4C81] font-medium hover:underline">Sign in to your account →</Link>
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 px-6 py-5 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} IEBC — Integrated Efficiency Business Consultants ·{' '}
          <Link href="/" className="text-[#0F4C81] hover:underline">iebc.com</Link>
        </p>
      </footer>

    </main>
  )
}
