'use client'

import { useState } from 'react'
import Link from 'next/link'

const TIERS = [
  {
    id: 'starter',
    label: 'Starter',
    build: 500,
    monthly: 149,
    badge: '',
    desc: 'A clean, professional web presence — fast.',
    features: [
      'Up to 5 custom pages',
      'Mobile-first responsive design',
      'Online booking & contact form',
      'Lead capture → flows into IEBC hub',
      'Domain + hosting setup included',
      'SEO optimized at launch',
      'Delivered in 2–3 weeks',
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    build: 1000,
    monthly: 149,
    badge: 'Most Popular',
    desc: 'More content, client portal, and payments built in.',
    features: [
      'Up to 10 custom pages',
      'Client payment portal integration',
      'Blog or resource section',
      'Appointment & event booking system',
      'Lead capture + CRM sync to hub',
      'Custom branding & brand kit',
      'Domain + hosting included',
      'Delivered in 3–4 weeks',
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    build: 2500,
    monthly: 249,
    badge: '',
    desc: 'Unlimited scale — e-commerce, portals, and integrations.',
    features: [
      'Unlimited pages',
      'E-commerce / product catalog',
      'Custom client login portal',
      'Advanced API integrations',
      'Multi-location or franchise ready',
      'Priority 2-week build',
      'Dedicated project manager',
      'Ongoing monthly enhancements',
    ],
  },
]

const DARK = '#0B2140'
const BLUE = '#1D4ED8'
const GOLD = '#C9A02E'

export default function WebsiteCheckout() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })

  const tier = TIERS.find(t => t.id === selected)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/infrastructure/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'website', ...form, plan: selected, build: tier?.build, monthly: tier?.monthly }),
      })
    } catch { /* non-blocking */ }
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted && tier) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F5F7FA' }}>
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: BLUE }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GOLD }}>Order Received</p>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: DARK }}>Your website is on the way!</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Your <strong>{tier.label} website</strong> order is in. An IEBC web specialist will contact <strong>{form.email}</strong> within 2 business hours to start the build.
          </p>
          <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
            <p className="font-bold text-sm mb-3" style={{ color: DARK }}>Your Order</p>
            <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">{tier.label} website build</span><span className="font-bold">${tier.build.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Monthly hosting & support</span><span className="font-bold" style={{ color: GOLD }}>${tier.monthly}/mo</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="px-7 py-3 rounded-xl font-bold text-sm text-white shadow-md" style={{ background: DARK }}>Back to Homepage</Link>
            <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="px-7 py-3 rounded-xl font-bold text-sm border-2 hover:bg-gray-50 transition" style={{ borderColor: DARK, color: DARK }}>Book a Call</a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div style={{ background: DARK }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="text-blue-300 text-sm hover:text-white mb-4 inline-block">← Back to IEBC</Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Intelligent Website Plans</h1>
          <p className="text-blue-200 text-base max-w-2xl">
            AI-powered, mobile-first websites built for your industry — booking, payments, and lead capture connected directly to your IEBC hub.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-blue-300">
            <span>✓ Mobile-first design</span>
            <span>✓ Connected to your hub</span>
            <span>✓ Hosting included</span>
            <span>✓ Delivered in weeks, not months</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Pricing tiers */}
        {!showForm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {TIERS.map(t => (
                <div
                  key={t.id}
                  className={`bg-white rounded-2xl border-2 p-7 flex flex-col relative transition ${
                    selected === t.id ? 'border-[#1D4ED8] shadow-xl' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  {t.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap text-white" style={{ background: GOLD }}>{t.badge}</span>
                    </div>
                  )}

                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">{t.label}</h3>
                  <p className="text-sm text-gray-500 mb-5">{t.desc}</p>

                  <div className="mb-1">
                    <span className="text-4xl font-black text-gray-900">${t.build.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 ml-1.5">one-time build</span>
                  </div>
                  <p className="text-sm font-semibold mb-6" style={{ color: GOLD }}>${t.monthly}/mo hosting & support</p>

                  <ul className="space-y-2.5 flex-1 mb-8">
                    {t.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="font-bold shrink-0 mt-0.5" style={{ color: BLUE }}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    <button
                      onClick={() => { setSelected(t.id); setShowForm(true) }}
                      className="w-full py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 shadow-md"
                      style={{ background: GOLD }}
                    >
                      Order Now →
                    </button>
                    <a
                      href="https://calendly.com/new56money/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl font-semibold text-sm text-center block border-2 transition hover:bg-gray-50"
                      style={{ borderColor: DARK, color: DARK }}
                    >
                      Book a Call Instead
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-400">
              Not sure which to pick?{' '}
              <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="underline font-medium text-gray-600">Book a free 30-min call</a>{' '}
              and we&apos;ll recommend the right fit.
            </p>
          </>
        )}

        {/* Order form */}
        {showForm && tier && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">← Back to plans</button>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5" style={{ background: DARK }}>
                <p className="text-white font-bold">Order: {tier.label} Website</p>
                <p className="text-blue-300 text-sm">${tier.build.toLocaleString()} build · ${tier.monthly}/mo hosting & support</p>
              </div>
              <div className="p-6">
                {/* Payment milestones */}
                <div className="rounded-xl p-4 mb-5 border border-gray-100" style={{ background: '#F8F8F8' }}>
                  <p className="text-xs font-bold text-gray-700 mb-3">Payment Milestones</p>
                  <div className="space-y-2">
                    {[
                      { pct: '25%', label: 'Down Payment', timing: 'Due upon signing agreement', color: '#C9A02E', done: false },
                      { pct: '50%', label: 'Build Complete', timing: 'Invoiced when site is delivered', color: '#0B2140', done: false },
                      { pct: '25%', label: 'Launch Approved', timing: 'Invoiced after you approve launch', color: '#6B7280', done: false },
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent" placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent" placeholder="jane@company.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent" placeholder="(555) 000-0000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Business Name *</label>
                      <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent" placeholder="Acme Corp" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tell us about your business & website goals</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent resize-none" placeholder="Industry, what pages you need, style preferences, any specific features…" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md disabled:opacity-50 transition" style={{ background: GOLD }}>
                    {submitting ? 'Submitting…' : 'Submit Order →'}
                  </button>
                  <div className="text-center pt-1">
                    <p className="text-xs text-gray-400 mb-1.5">Prefer to talk through it first?</p>
                    <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline" style={{ color: DARK }}>Book a 30-min call →</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
