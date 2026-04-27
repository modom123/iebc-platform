'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// ── Animated counter ────────────────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let current = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

// ── Demo data ────────────────────────────────────────────────────────
const TRANSACTIONS = [
  { label: 'Invoice paid · Acme Corp',      amount: '+$4,200',  pos: true },
  { label: 'Expense · Cloud hosting',        amount: '-$890',    pos: false },
  { label: 'Invoice sent · Metro LLC',       amount: '+$12,500', pos: true },
  { label: 'Payroll processed',              amount: '-$8,400',  pos: false },
  { label: 'Invoice paid · Bright & Co',     amount: '+$3,100',  pos: true },
  { label: 'Receipt scanned · Office depot', amount: '-$245',    pos: false },
]

const BARS = [
  { month: 'Nov', inc: 58, exp: 38 },
  { month: 'Dec', inc: 74, exp: 47 },
  { month: 'Jan', inc: 66, exp: 33 },
  { month: 'Feb', inc: 85, exp: 51 },
  { month: 'Mar', inc: 80, exp: 40 },
  { month: 'Apr', inc: 100, exp: 44 },
]

// ── Left panel (hidden on mobile) ────────────────────────────────────
function LivePanel() {
  const revenue  = useCounter(124892, 2400)
  const expenses = useCounter(43211,  1900)
  const [txIdx, setTxIdx]   = useState(0)
  const [txShow, setTxShow] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setTxShow(false)
      setTimeout(() => { setTxIdx(i => (i + 1) % TRANSACTIONS.length); setTxShow(true) }, 380)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const profit = revenue - expenses
  const tx = TRANSACTIONS[txIdx]

  return (
    <>
      <style>{`
        @keyframes growBar { from { transform: scaleY(0) } to { transform: scaleY(1) } }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .bar-anim { transform-origin: bottom; animation: growBar 0.7s cubic-bezier(.22,1,.36,1) both }
        .fade-slide { animation: fadeSlide 0.5s ease both }
      `}</style>

      <div className="hidden lg:flex flex-col justify-between px-10 py-10 relative overflow-hidden select-none"
           style={{ background: 'linear-gradient(150deg, #071628 0%, #0B2140 55%, #0a1e3d 100%)' }}>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Ambient glows */}
        <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
             style={{ background: 'rgba(200,144,42,0.12)' }} />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
             style={{ background: 'rgba(15,76,129,0.18)' }} />

        {/* ── Brand + live badge ── */}
        <div>
          <div className="flex items-center justify-between mb-9">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style={{ background: '#C8902A' }}>
                <span className="text-white font-black text-[11px] tracking-tight">EFF</span>
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">Efficient</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[11px] font-semibold tracking-wide">LIVE</span>
            </div>
          </div>

          {/* ── KPI row ── */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { label: 'Revenue',    val: revenue,  color: '#34d399' },
              { label: 'Expenses',   val: expenses, color: '#f87171' },
              { label: 'Net Profit', val: profit,   color: '#C8902A' },
            ].map(k => (
              <div key={k.label} className="rounded-xl px-4 py-3.5 border border-white/[0.07]"
                   style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-white/35 text-[9px] font-semibold uppercase tracking-widest mb-1">{k.label}</p>
                <p className="font-bold text-base leading-none" style={{ color: k.color }}>
                  ${k.val.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* ── Bar chart ── */}
          <div className="rounded-xl px-4 pt-4 pb-3 border border-white/[0.07] mb-3"
               style={{ background: 'rgba(255,255,255,0.035)' }}>
            <p className="text-white/35 text-[9px] font-semibold uppercase tracking-widest mb-3">6-Month Overview</p>
            <div className="flex items-end gap-2 h-[56px]">
              {BARS.map((d, i) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-[2px] items-end" style={{ height: '44px' }}>
                    <div className="flex-1 rounded-sm bar-anim"
                         style={{ height: `${d.inc * 0.44}px`, background: '#1d4ed8', opacity: 0.85,
                                  animationDelay: `${i * 0.09}s` }} />
                    <div className="flex-1 rounded-sm bar-anim"
                         style={{ height: `${d.exp * 0.44}px`, background: '#C8902A', opacity: 0.75,
                                  animationDelay: `${i * 0.09 + 0.04}s` }} />
                  </div>
                  <span className="text-white/25 text-[9px]">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ background: '#1d4ed8', opacity: 0.85 }} />
                <span className="text-white/30 text-[9px]">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ background: '#C8902A', opacity: 0.75 }} />
                <span className="text-white/30 text-[9px]">Expenses</span>
              </div>
            </div>
          </div>

          {/* ── Live transaction feed ── */}
          <div className="rounded-xl px-4 py-3.5 border border-white/[0.07]"
               style={{ background: 'rgba(255,255,255,0.035)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-white/35 text-[9px] font-semibold uppercase tracking-widest">Recent Activity</p>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div style={{ opacity: txShow ? 1 : 0, transition: 'opacity 0.38s ease' }}>
              <div className="flex items-center justify-between gap-3 fade-slide" key={txIdx}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm"
                       style={{ background: tx.pos ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                                border: `1px solid ${tx.pos ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                    <span style={{ color: tx.pos ? '#34d399' : '#f87171' }}>{tx.pos ? '↑' : '↓'}</span>
                  </div>
                  <span className="text-white/60 text-xs truncate">{tx.label}</span>
                </div>
                <span className="text-xs font-bold shrink-0"
                      style={{ color: tx.pos ? '#34d399' : '#f87171' }}>{tx.amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom tagline ── */}
        <div className="relative z-10">
          <p className="text-white/50 text-sm leading-relaxed italic">
            &ldquo;Your finances, automated and<br />visible in real time.&rdquo;
          </p>
          <p className="text-white/20 text-[11px] mt-2 font-medium">Efficient by IEBC · Financial Infrastructure</p>
        </div>
      </div>
    </>
  )
}

// ── Login form ───────────────────────────────────────────────────────
function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') || '/accounting'
  const isConsultant = next.includes('/hub/consultants') || next.includes('consultant')
  const isEfficient  = !isConsultant && (next.startsWith('/accounting') || next === '/')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push(next)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication service unavailable.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-[1fr_420px]" style={{ background: '#F5F7FA' }}>

      {/* Left: live dashboard preview */}
      <LivePanel />

      {/* Right: login form */}
      <div className="flex flex-col justify-center items-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: isEfficient ? '#0F4C81' : '#0B2140' }}>
                <span className="text-white font-black text-[10px] tracking-tight">
                  {isEfficient ? 'EFF' : 'IEBC'}
                </span>
              </div>
              <span className="font-extrabold text-[#0B2140] text-lg">
                {isConsultant ? 'Consultants' : isEfficient ? 'Efficient' : 'IEBC'}
              </span>
            </Link>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
              {isConsultant ? 'Welcome back' : 'Sign in'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isConsultant
                ? 'Access your IEBC Consultant Hub'
                : isEfficient
                ? 'Continue to your accounting dashboard'
                : 'Sign in to your account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#0B2140' } as React.CSSProperties}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs font-medium hover:underline"
                      style={{ color: '#C8902A' }}>
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#0B2140' } as React.CSSProperties}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error === 'Invalid login credentials'
                  ? 'Email or password is incorrect.'
                  : error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md mt-1"
              style={{ background: 'linear-gradient(135deg, #0B2140 0%, #17377A 100%)' }}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                : 'Sign In →'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-7 pt-6 border-t border-gray-100 space-y-3 text-center">
            {isConsultant ? (
              <p className="text-sm text-gray-500">
                Looking for Efficient?{' '}
                <Link href="/auth/login?next=/accounting" className="font-semibold hover:underline"
                      style={{ color: '#0B2140' }}>
                  Sign in here
                </Link>
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  New to Efficient?{' '}
                  <Link href="/accounting/checkout?plan=silver" className="font-semibold hover:underline"
                        style={{ color: '#0F4C81' }}>
                    Start free — from $9/mo
                  </Link>
                </p>
                <p className="text-xs text-gray-400">
                  Have an account but no login?{' '}
                  <Link href="/auth/signup" className="font-medium hover:underline"
                        style={{ color: '#C8902A' }}>
                    Create password →
                  </Link>
                </p>
              </>
            )}
          </div>

          <div className="text-center mt-5">
            <Link href="/" className="text-xs text-gray-300 hover:text-gray-500 transition">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
