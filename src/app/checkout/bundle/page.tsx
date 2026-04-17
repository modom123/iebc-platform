'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Bundle',
    setup: 1500,
    monthly: 299,
    desc: 'Website + Hub + Accounting + 8 AI Advisors',
    includes: ['Intelligent Website (5 pages)', 'Automated Business Hub', 'Accounting — Silver plan', '8 IEBC AI Consultants', 'Business Formation assistance', 'Hosting + domain included', 'Delivered in 6 weeks'],
  },
  {
    id: 'growth',
    name: 'Growth Bundle',
    setup: 3500,
    monthly: 499,
    desc: 'Website + Hub + Accounting + AI Workforce — fully integrated',
    includes: ['Website — 10 pages + booking + payments', 'Full Hub — CRM, invoicing, outreach', 'Accounting — Gold plan', 'AI Advisor Workforce (3 advisors)', '25 IEBC AI Consultants', 'Complete workflow automations', 'Priority build + dedicated manager'],
  },
  {
    id: 'pro',
    name: 'Pro Bundle',
    setup: 6500,
    monthly: 799,
    desc: 'All six services, enterprise-grade, no limits',
    includes: ['Unlimited pages + client login portal', 'Every hub module — zero restrictions', 'Accounting — Platinum plan', 'AI Advisor Workforce (5 advisors)', 'All 60 IEBC AI Consultants', 'Custom automations + API integrations', 'SLA guarantee + priority support'],
  },
]

const DARK = '#0B2140'
const GOLD = '#C9A02E'

function BundleCheckoutContent() {
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState('growth')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })

  useEffect(() => {
    const p = searchParams.get('plan')
    if (p && PLANS.find(x => x.id === p)) setSelectedPlan(p)
  }, [searchParams])

  const plan = PLANS.find(p => p.id === selectedPlan)!

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/infrastructure/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bundle', ...form, plan: selectedPlan, setup: plan.setup, monthly: plan.monthly }),
      })
    } catch { /* non-blocking */ }
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F5F7FA' }}>
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: DARK }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GOLD }}>Order Received</p>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: DARK }}>You&apos;re in!</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Your <strong>{plan.name}</strong> order is confirmed. An IEBC account manager will reach out to <strong>{form.email}</strong> within 2 business hours to kick off onboarding.
          </p>
          <div className="rounded-2xl p-5 mb-6 text-left space-y-3" style={{ background: DARK }}>
            <p className="font-bold text-sm text-white mb-1">What happens next:</p>
            {[
              { n: '1', t: 'Kickoff call scheduled', d: 'We reach out within 2 hours to book your onboarding session.' },
              { n: '2', t: 'Contract + invoice sent', d: 'You receive a services agreement and setup invoice via email.' },
              { n: '3', t: 'Build begins', d: 'Website, hub, and accounting are built in parallel by your IEBC team.' },
              { n: '4', t: 'Portal access granted', d: 'Sign in to manage accounting, hub, and your AI Advisor workforce.' },
            ].map(s => (
              <div key={s.n} className="flex gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5" style={{ background: GOLD }}>{s.n}</div>
                <div><p className="text-sm font-semibold text-white">{s.t}</p><p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.d}</p></div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/hub" className="px-7 py-3 rounded-xl font-bold text-sm text-white shadow-md" style={{ background: DARK }}>Go to Hub →</Link>
            <Link href="/" className="px-7 py-3 rounded-xl font-bold text-sm border-2 hover:bg-gray-50 transition" style={{ borderColor: DARK, color: DARK }}>Back to Homepage</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: '#F5F7FA' }}>
      <div className="max-w-5xl mx-auto">
        <Link href="/#pricing" className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">← Back to Pricing</Link>

        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: GOLD }}>Bundle Order</p>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: DARK }}>Choose Your Bundle</h1>
          <p className="text-gray-500 text-sm">Select a plan, fill in your info — we reach out within 2 hours. No payment until you sign the agreement.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* Plan selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Select Bundle</p>
              <div className="space-y-3">
                {PLANS.map(p => (
                  <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition ${selectedPlan === p.id ? 'border-[#0B2140] bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === p.id ? 'border-[#0B2140] bg-[#0B2140]' : 'border-gray-300'}`}>
                            {selectedPlan === p.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <p className="font-bold text-sm text-gray-900">{p.name}</p>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">{p.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-gray-900 text-sm">${p.setup.toLocaleString()} <span className="font-normal text-xs text-gray-400">setup</span></p>
                        <p className="text-xs font-semibold" style={{ color: GOLD }}>${p.monthly}/mo</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Your Information</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent" placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent" placeholder="jane@company.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent" placeholder="(555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Company *</label>
                    <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent" placeholder="Acme Corp" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tell us about your business</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent resize-none" placeholder="Industry, current challenges, goals…" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition shadow-md disabled:opacity-50" style={{ background: GOLD }}>
                  {submitting ? 'Submitting…' : `Place Order — ${plan.name} →`}
                </button>
                <p className="text-[11px] text-gray-400 text-center">No payment until you review and sign the services agreement. We contact you within 2 business hours.</p>
              </form>
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-2">Prefer to talk first?</p>
                <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer"
                  className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-gray-50" style={{ borderColor: DARK, color: DARK }}>
                  Book a 30-min Call →
                </a>
              </div>
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4" style={{ background: DARK }}>
                <p className="text-white font-bold text-sm">Order Summary</p>
              </div>
              <div className="p-5">
                <p className="font-bold text-gray-900 mb-1">{plan.name}</p>
                <p className="text-xs text-gray-500 mb-4">{plan.desc}</p>
                <ul className="space-y-2 mb-5">
                  {plan.includes.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="font-bold shrink-0 mt-0.5" style={{ color: GOLD }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">One-time setup</span><span className="font-bold text-gray-900">${plan.setup.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Monthly retainer</span><span className="font-bold" style={{ color: GOLD }}>${plan.monthly}/mo</span></div>
                </div>
                <div className="mt-4 rounded-xl p-3 text-xs" style={{ background: '#F0F4FF', border: '1px solid #C7D7FF' }}>
                  <p className="font-bold text-[#0B2140] mb-1">Includes all 6 services</p>
                  <p className="text-blue-700">Website · Hub · Accounting · AI Advisors · Workflow · Infrastructure — fully integrated.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function BundleCheckout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400 text-sm">Loading…</div></div>}>
      <BundleCheckoutContent />
    </Suspense>
  )
}
