'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

type FormData = {
  name: string
  email: string
  password: string
  confirm: string
  phone: string
  business_name: string
  street: string
  city: string
  state: string
  zip: string
}

export default function Signup() {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormData>({
    name: '', email: '', password: '', confirm: '',
    phone: '', business_name: '',
    street: '', city: '', state: '', zip: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function validateStep1() {
    if (!form.name.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return ''
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!form.street || !form.city || !form.state || !form.zip) {
      setError('Please complete your billing address.')
      return
    }
    setError('')
    setLoading(true)

    try {
      // 1. Call our register API — creates Supabase user + Stripe customer + profile
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          business_name: form.business_name,
          billing_address: {
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed.')

      // 2. Sign in client-side (sets auth cookie) so they're logged in when they return from Stripe
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInErr) throw new Error('Account created but sign-in failed. Please log in manually.')

      // 3. Redirect to Stripe to save card on file (no charge — for future upsells)
      if (data.setupUrl) {
        window.location.href = data.setupUrl
      } else {
        window.location.href = '/accounting?welcome=1'
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-[#0B2140] px-8 py-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#C8902A] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px] tracking-tight">IEBC</span>
            </div>
            <span className="text-white font-extrabold text-base">Efficient Portal</span>
          </Link>
          <p className="text-white/60 text-xs">Create your account — takes 2 minutes</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[
              { n: 1, label: 'Account' },
              { n: 2, label: 'Business & Billing' },
              { n: 3, label: 'Card on File' },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-px ${step > i ? 'bg-[#C8902A]' : 'bg-white/20'}`} />}
                <div className={`flex items-center gap-1.5`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step > s.n ? 'bg-[#C8902A] text-white' :
                    step === s.n ? 'bg-white text-[#0B2140]' :
                    'bg-white/20 text-white/40'
                  }`}>
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <span className={`text-[10px] font-semibold hidden sm:block ${step === s.n ? 'text-white' : 'text-white/40'}`}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6">

          {/* ── STEP 1: Account ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-800 mb-4">Your account information</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input name="name" type="text" required value={form.name} onChange={handleField}
                  placeholder="Jane Smith"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input name="email" type="email" required value={form.email} onChange={handleField}
                  placeholder="jane@company.com"
                  autoComplete="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Password <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(min. 8 characters)</span>
                </label>
                <input name="password" type="password" required minLength={8} value={form.password} onChange={handleField}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input name="confirm" type="password" required value={form.confirm} onChange={handleField}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <button type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ background: '#0B2140' }}>
                Continue →
              </button>
            </form>
          )}

          {/* ── STEP 2: Business + Billing ── */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">Business & billing info</p>
                <p className="text-xs text-gray-400 mb-4">Used for invoicing and to personalize your IEBC experience.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleField}
                    placeholder="(555) 000-0000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Name</label>
                  <input name="business_name" type="text" value={form.business_name} onChange={handleField}
                    placeholder="Acme LLC"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Billing Address <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <input name="street" type="text" required value={form.street} onChange={handleField}
                    placeholder="Street address"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                  <div className="grid grid-cols-2 gap-2">
                    <input name="city" type="text" required value={form.city} onChange={handleField}
                      placeholder="City"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                    <select name="state" required value={form.state} onChange={handleField}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] bg-white">
                      <option value="">State</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <input name="zip" type="text" required value={form.zip} onChange={handleField}
                    placeholder="ZIP code" maxLength={10}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                </div>
              </div>

              {/* Card on file notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-lg shrink-0">🔒</span>
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-1">Next: Secure card on file</p>
                    <p className="text-xs text-blue-600 leading-relaxed">
                      After this step, you&apos;ll be taken to Stripe to securely save a card. <strong>No charge today</strong> — your card is saved for easy future upgrades and purchases.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError('') }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
                  style={{ background: '#0B2140' }}>
                  {loading ? 'Creating account...' : 'Continue to Card →'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#0B2140] font-semibold hover:underline">Sign in</Link>
            </p>
            <p className="text-xs text-gray-400">
              <Link href="/" className="hover:text-gray-600">← Back to home</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
