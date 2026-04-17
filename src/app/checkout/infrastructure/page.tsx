'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type CartAdvisor = {
  id: string
  name: string
  title: string
  rate: number
  deptName: string
}

type CartData = {
  contractors: CartAdvisor[]
  duration: number
  total: number
  monthlyTotal: number
}

const DARK = '#0B2140'
const GOLD = '#C9A02E'

export default function InfrastructureCheckout() {
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('infra_cart')
    if (raw) setCartData(JSON.parse(raw))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/infrastructure/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...cartData }),
      })
    } catch { /* non-blocking */ }
    setSubmitting(false)
    setSubmitted(true)
    sessionStorage.removeItem('infra_cart')
  }

  if (submitted && cartData) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F5F7FA' }}>
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: DARK }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GOLD }}>Request Received</p>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: DARK }}>Your AI Advisor team is being assembled!</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Your {cartData.contractors.length} IEBC AI Advisor{cartData.contractors.length !== 1 ? 's' : ''} will be assembled and ready within 24 hours.
            Onboarding details will be sent to <strong>{form.email}</strong>.
          </p>

          {/* Team summary */}
          <div className="rounded-2xl p-5 mb-5 text-left" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
            <p className="font-bold text-sm mb-4" style={{ color: DARK }}>Your IEBC AI Advisor Team</p>
            <div className="space-y-3">
              {cartData.contractors.map(a => (
                <div key={a.id} className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(a.name)}&backgroundColor=0B2140`}
                    alt={a.name}
                    className="w-9 h-9 rounded-full border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.title} · {a.deptName}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700 shrink-0">${a.rate.toLocaleString()}/mo</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between text-sm font-bold" style={{ color: DARK }}>
              <span>{cartData.duration}-month contract total</span>
              <span>${cartData.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Portal access CTA */}
          <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: DARK }}>
            <p className="font-bold text-sm text-white mb-1">Access Your Portal</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Sign in (or create your free account) to manage your AI Advisor workforce, accounting, and hub — all in one place.
            </p>
            <div className="flex gap-2">
              <Link
                href={`/auth/login?email=${encodeURIComponent(form.email)}&next=/hub/workforce`}
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white transition"
                style={{ background: GOLD }}
              >
                Sign In to Portal →
              </Link>
              <Link
                href={`/auth/signup?email=${encodeURIComponent(form.email)}&next=/hub/workforce`}
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold border-2 border-white text-white hover:bg-white hover:text-[#0B2140] transition"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Next steps */}
          <div className="rounded-2xl p-6 mb-6 text-left space-y-4" style={{ background: '#F8F8F8', border: '1px solid #e5e7eb' }}>
            <p className="font-bold text-sm" style={{ color: DARK }}>What happens next:</p>
            {[
              { n: '1', title: 'Contract sent within 2 hours', desc: 'A digital services agreement arrives at your email to review and sign.' },
              { n: '2', title: 'Team introduction call', desc: 'Your IEBC account manager books a 30-min kickoff call with your full advisor team.' },
              { n: '3', title: 'Onboarding & portal access', desc: 'Each AI Advisor is activated in your hub with full context about your business.' },
              { n: '4', title: 'Work begins within 24 hours', desc: 'Log into the portal — your advisors are live and ready to engage.' },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: GOLD }}>{item.n}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/hub/workforce" className="px-7 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-md" style={{ background: DARK }}>
              View My Workforce →
            </Link>
            <Link href="/infrastructure" className="px-7 py-3 rounded-xl font-bold text-sm border-2 hover:bg-gray-50 transition" style={{ borderColor: DARK, color: DARK }}>
              Add More Advisors
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Questions?{' '}
            <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="underline">Book a call</a> with your IEBC account manager.
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
              <p className="text-sm text-gray-500 mb-6">An IEBC account manager will confirm your AI Advisor team and send your contract within 2 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent transition" placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent transition" placeholder="jane@company.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent transition" placeholder="(555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Company Name *</label>
                    <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent transition" placeholder="Acme Corp" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent transition resize-none" placeholder="Tell us about your business, key priorities, or specific challenges you want the team to address…" />
                </div>
                {/* Payment milestones */}
                <div className="rounded-xl p-3 border border-gray-100" style={{ background: '#F8F8F8' }}>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">Payment Milestones</p>
                  <div className="space-y-2">
                    {[
                      { pct: '25%', label: 'Down Payment', timing: 'Due upon signing agreement', color: GOLD },
                      { pct: '50%', label: 'Team Onboarded', timing: 'Invoiced when advisors go live', color: DARK },
                      { pct: '25%', label: 'First Month Complete', timing: 'Invoiced at day 30', color: '#6B7280' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px]" style={{ background: m.color }}>{i + 1}</div>
                          <div>
                            <p className="font-semibold text-gray-700">{m.label}</p>
                            <p className="text-gray-400">{m.timing}</p>
                          </div>
                        </div>
                        <span className="font-bold shrink-0" style={{ color: m.color }}>{m.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={submitting || !cartData || cartData.contractors.length === 0} className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition shadow-md disabled:opacity-50" style={{ background: GOLD }}>
                  {submitting ? 'Submitting…' : 'Assemble My AI Advisor Team →'}
                </button>
                <p className="text-[11px] text-gray-400 text-center">Your IEBC manager will send a contract before any charges. Portal access granted upon signing.</p>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
              <div className="px-5 py-4" style={{ background: DARK }}>
                <p className="text-white font-bold text-sm">AI Advisor Team Summary</p>
              </div>
              <div className="p-5">
                {!cartData || cartData.contractors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 mb-3">No advisors selected.</p>
                    <Link href="/infrastructure" className="text-sm font-semibold underline" style={{ color: DARK }}>← Build your team</Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cartData.contractors.map(a => (
                        <div key={a.id} className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(a.name)}&backgroundColor=0B2140`}
                            alt={a.name}
                            className="w-9 h-9 rounded-full border border-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{a.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{a.title}</p>
                          </div>
                          <p className="text-xs font-bold text-gray-700 shrink-0">${a.rate.toLocaleString()}/mo</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{cartData.contractors.length} advisor{cartData.contractors.length !== 1 ? 's' : ''} × {cartData.duration} mo</span>
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
                      <p className="text-[10px] text-gray-400">${Math.round(cartData.total / cartData.duration).toLocaleString()}/mo · {cartData.duration}-month contract</p>
                    </div>
                    <div className="mt-4 rounded-xl p-3 bg-blue-50 border border-blue-100">
                      <p className="text-xs font-bold text-[#0B2140] mb-1">✓ Portal access included</p>
                      <ul className="text-[11px] text-blue-700 space-y-0.5">
                        <li>· Accounting dashboard</li>
                        <li>· Business hub & workforce tools</li>
                        <li>· Direct advisor messaging</li>
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
