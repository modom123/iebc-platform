'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type CartContractor = {
  id: string
  name: string
  title: string
  rate: number
  deptName: string
}

type CartData = {
  contractors: CartContractor[]
  duration: number
  total: number
  monthlyTotal: number
}

const DARK = '#0B2140'
const GOLD = '#C9A02E'

export default function InfrastructureCheckout() {
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('infra_cart')
    if (raw) setCartData(JSON.parse(raw))
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    // In production this posts to an API / triggers Stripe invoice
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      sessionStorage.removeItem('infra_cart')
    }, 1800)
  }

  if (submitted && cartData) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F5F7FA' }}>
        <div className="max-w-lg w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: DARK }}
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GOLD }}>Request Received</p>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: DARK }}>Your team is being assembled!</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Your IEBC infrastructure team of {cartData.contractors.length} expert{cartData.contractors.length > 1 ? 's' : ''} will
            be assembled and ready within 24 hours. You'll receive onboarding details at <strong>{form.email}</strong>.
          </p>

          {/* Team summary */}
          <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
            <p className="font-bold text-sm mb-4" style={{ color: DARK }}>Your Contracted Team</p>
            <div className="space-y-3">
              {cartData.contractors.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ background: DARK }}>
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.title} · {c.deptName}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-800 shrink-0">${c.rate.toLocaleString()}/mo</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between text-sm font-bold" style={{ color: DARK }}>
              <span>{cartData.duration}-month contract total</span>
              <span>${cartData.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Next steps */}
          <div className="rounded-2xl p-6 mb-8 text-left space-y-4" style={{ background: DARK }}>
            <p className="font-bold text-sm text-white">What happens next:</p>
            {[
              { step: '1', label: 'Contract sent within 2 hours', desc: 'You\'ll receive a digital services agreement at your email to review and sign.' },
              { step: '2', label: 'Team introduction call', desc: 'Your IEBC account manager schedules a 30-minute kickoff call with your full team.' },
              { step: '3', label: 'Onboarding & access', desc: 'Each expert is onboarded into your IEBC hub and given context about your business.' },
              { step: '4', label: 'Work begins within 24 hours', desc: 'Your contractors are active and ready to engage on day one.' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: GOLD }}>
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/hub" className="px-7 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-md" style={{ background: DARK }}>
              Go to Dashboard →
            </Link>
            <Link href="/infrastructure" className="px-7 py-3 rounded-xl font-bold text-sm border-2 transition-colors hover:text-white hover:bg-gray-800" style={{ borderColor: DARK, color: DARK }}>
              Add More Experts
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Questions?{' '}
            <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="underline">Book a call</a>{' '}
            with your IEBC account manager.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: '#F5F7FA' }}>
      <div className="max-w-5xl mx-auto">
        <Link href="/infrastructure" className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block transition">← Back to Team Builder</Link>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
              <h1 className="text-2xl font-extrabold mb-1" style={{ color: DARK }}>Complete Your Request</h1>
              <p className="text-sm text-gray-500 mb-6">An IEBC account manager will confirm your team and send your contract within 2 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                      style={{ '--tw-ring-color': DARK } as React.CSSProperties}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Company Name *</label>
                    <input
                      required
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Additional Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
                    placeholder="Tell us about your business, key priorities, or specific challenges you want the team to address…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !cartData || cartData.contractors.length === 0}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition shadow-md disabled:opacity-50"
                  style={{ background: GOLD }}
                >
                  {submitting ? 'Submitting…' : 'Submit Request & Assemble My Team →'}
                </button>

                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                  By submitting you agree to our Terms of Service. Your IEBC manager will send a contract before any charges.
                </p>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
              <div className="px-5 py-4" style={{ background: DARK }}>
                <p className="text-white font-bold text-sm">Order Summary</p>
              </div>
              <div className="p-5">
                {!cartData || cartData.contractors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 mb-3">No team selected.</p>
                    <Link href="/infrastructure" className="text-sm font-semibold underline" style={{ color: DARK }}>← Build your team</Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cartData.contractors.map(c => (
                        <div key={c.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ background: DARK }}>
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{c.title}</p>
                          </div>
                          <p className="text-xs font-bold text-gray-700 shrink-0">${c.rate.toLocaleString()}/mo</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{cartData.contractors.length} expert{cartData.contractors.length > 1 ? 's' : ''} × {cartData.duration} mo</span>
                        <span>${(cartData.monthlyTotal * cartData.duration).toLocaleString()}</span>
                      </div>
                      {cartData.total < cartData.monthlyTotal * cartData.duration && (
                        <div className="flex justify-between text-xs text-green-600 font-medium">
                          <span>Multi-month discount</span>
                          <span>−${(cartData.monthlyTotal * cartData.duration - cartData.total).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-100" style={{ color: DARK }}>
                        <span>Total</span>
                        <span>${cartData.total.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        ${Math.round(cartData.total / cartData.duration).toLocaleString()}/mo · {cartData.duration}-month contract
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl p-3 bg-blue-50 border border-blue-100">
                      <p className="text-xs font-bold text-[#0F4C81] mb-1">✓ What's included</p>
                      <ul className="text-[11px] text-blue-700 space-y-0.5">
                        <li>· Direct access to each expert via your hub</li>
                        <li>· Weekly check-in calls available</li>
                        <li>· Monthly progress reports</li>
                        <li>· Cancel with 30 days notice</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
