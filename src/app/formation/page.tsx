'use client'

import { useState } from 'react'
import Link from 'next/link'

const FORMATION_SERVICES = [
  {
    id: 'llc',
    category: 'Entity Formation',
    name: 'LLC Formation',
    price: 299,
    desc: 'Articles of Organization filed in your state. Includes name availability check and filing confirmation.',
    popular: true,
  },
  {
    id: 'scorp',
    category: 'Entity Formation',
    name: 'S-Corp Election',
    price: 149,
    desc: 'IRS Form 2553 filed on your behalf. Convert your LLC or C-Corp to S-Corp tax status.',
    popular: false,
  },
  {
    id: 'ccorp',
    category: 'Entity Formation',
    name: 'C-Corp Formation',
    price: 499,
    desc: 'Full incorporation package — Articles of Incorporation, initial board resolutions, stock ledger setup.',
    popular: false,
  },
  {
    id: 'nonprofit',
    category: 'Entity Formation',
    name: 'Nonprofit / 501(c)(3)',
    price: 799,
    desc: 'Articles of Incorporation, bylaws, and IRS Form 1023 preparation. Full 501(c)(3) application package.',
    popular: false,
  },
  {
    id: 'ein',
    category: 'Tax & Compliance',
    name: 'EIN Registration',
    price: 79,
    desc: 'Federal Employer Identification Number obtained from the IRS on your behalf. Delivered in 1–2 business days.',
    popular: true,
  },
  {
    id: 'agent',
    category: 'Tax & Compliance',
    name: 'Registered Agent (1 Year)',
    price: 149,
    desc: 'Official registered agent service in your state. Legal notices and state mail handled and forwarded to you.',
    popular: true,
  },
  {
    id: 'opagree',
    category: 'Documents & Agreements',
    name: 'Operating Agreement',
    price: 199,
    desc: 'Custom LLC operating agreement drafted for your business structure — single-member or multi-member.',
    popular: true,
  },
  {
    id: 'bylaws',
    category: 'Documents & Agreements',
    name: 'Corporate Bylaws',
    price: 199,
    desc: 'Custom corporate bylaws for your C-Corp or S-Corp. Covers board, officers, meetings, and voting.',
    popular: false,
  },
  {
    id: 'dba',
    category: 'Documents & Agreements',
    name: 'DBA / Trade Name Filing',
    price: 99,
    desc: 'Doing Business As registration in your state. Required if operating under a name different from your legal entity.',
    popular: false,
  },
  {
    id: 'amendment',
    category: 'Documents & Agreements',
    name: 'Articles of Amendment',
    price: 149,
    desc: 'File a state amendment for name changes, address updates, member/officer changes, or purpose changes.',
    popular: false,
  },
  {
    id: 'annual',
    category: 'Ongoing Compliance',
    name: 'Annual Report Filing',
    price: 99,
    desc: 'State annual report or statement of information filed on your behalf. Keeps your entity in good standing.',
    popular: false,
  },
  {
    id: 'compliance',
    category: 'Ongoing Compliance',
    name: 'Compliance Package (1 Year)',
    price: 249,
    desc: 'Annual filing calendar, deadline reminders, registered agent renewal, and one included state filing.',
    popular: false,
  },
]

const CATEGORIES = ['Entity Formation', 'Tax & Compliance', 'Documents & Agreements', 'Ongoing Compliance']

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

export default function FormationPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', state: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleService(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedItems = FORMATION_SERVICES.filter(s => selected.has(s.id))
  const total = selectedItems.reduce((sum, s) => sum + s.price, 0)

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (selectedItems.length === 0 || !form.name || !form.email) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/formation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: selectedItems.map(s => ({ id: s.id, name: s.name, price: s.price })),
          total,
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          state: form.state,
          notes: form.notes,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0B2140] text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-white/50 hover:text-white text-sm transition">← Back to Home</Link>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>
                Service 01 · Business Formation
              </p>
              <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-2">
                Build your legal foundation.
              </h1>
              <p className="text-white/70 text-sm max-w-xl">
                Select the services you need. All 50 states. Handled by IEBC — documents delivered, filings submitted, EIN secured.
              </p>
            </div>
            {selected.size > 0 && (
              <div className="hidden md:block shrink-0 bg-white/10 rounded-xl p-4 text-right min-w-[160px]">
                <p className="text-xs text-white/60 mb-1">{selected.size} service{selected.size > 1 ? 's' : ''} selected</p>
                <p className="text-2xl font-extrabold">${total.toLocaleString()}</p>
                <p className="text-xs text-white/50">total</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs">
          <span className={`font-semibold ${step === 1 ? 'text-[#0B2140]' : 'text-gray-400'}`}>1. Select Services</span>
          <span className="text-gray-300 mx-1">→</span>
          <span className={`font-semibold ${step === 2 ? 'text-[#0B2140]' : 'text-gray-400'}`}>2. Your Info</span>
          <span className="text-gray-300 mx-1">→</span>
          <span className="text-gray-300 font-semibold">3. Payment</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── STEP 1: Service Selection ── */}
        {step === 1 && (
          <>
            {CATEGORIES.map(cat => (
              <div key={cat} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{cat}</p>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FORMATION_SERVICES.filter(s => s.category === cat).map(service => {
                    const isSelected = selected.has(service.id)
                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`rounded-xl border-2 p-4 text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-[#C8902A] bg-[#C8902A]/5 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-[#C8902A]/40'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected ? 'border-[#C8902A] bg-[#C8902A]' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-gray-900">{service.name}</p>
                              {service.popular && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8902A]">Popular</span>
                              )}
                            </div>
                            <p className="text-sm font-extrabold text-[#0B2140] shrink-0">${service.price}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{service.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Floating summary bar */}
            <div className={`sticky bottom-6 transition-all ${selected.size === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-[#0B2140] rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white text-sm font-semibold">
                    {selected.size} service{selected.size > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {selectedItems.map(s => s.name).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-white">${total.toLocaleString()}</p>
                    <p className="text-white/50 text-[10px]">total</p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 whitespace-nowrap"
                    style={{ background: '#C8902A', color: '#fff' }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>

            {selected.size === 0 && (
              <p className="text-center text-sm text-gray-400 mt-4">Select at least one service to continue.</p>
            )}
          </>
        )}

        {/* ── STEP 2: Contact Info + Checkout ── */}
        {step === 2 && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold text-[#C8902A] uppercase tracking-widest mb-2">Step 2 of 3</p>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your information</h2>
              <p className="text-gray-500 text-sm">Tell us about you and your business. We&apos;ll handle the rest.</p>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Order Summary</p>
              <div className="space-y-2 mb-3">
                {selectedItems.map(s => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="font-semibold text-gray-900">${s.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-[#0B2140] text-lg">${total.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input name="name" type="text" required value={form.name} onChange={handleField}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input name="email" type="email" required value={form.email} onChange={handleField}
                    placeholder="jane@company.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleField}
                    placeholder="(555) 000-0000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business / Entity Name</label>
                  <input name="company" type="text" value={form.company} onChange={handleField}
                    placeholder="Acme LLC"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State of Formation <span className="text-red-500">*</span></label>
                <select name="state" required value={form.state} onChange={handleField}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] bg-white">
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleField} rows={3}
                  placeholder="Members, ownership structure, business purpose, or anything else we should know..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] resize-none" />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                  style={{ background: '#0B2140', color: '#fff' }}
                >
                  {loading ? 'Redirecting to payment...' : `Pay $${total.toLocaleString()} — Secure Checkout`}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm text-gray-500 hover:text-gray-800 transition"
                >
                  ← Back to services
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Secure checkout via Stripe · One-time payment · All 50 states · Processing begins within 1 business day
              </p>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
