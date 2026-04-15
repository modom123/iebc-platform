'use client'
import { useState, useEffect } from 'react'

const BUNDLES = [
  {
    id: 'bundle_silver',
    label: 'Silver Bundle',
    tagline: 'For solo founders & small businesses getting started.',
    setupAmount: 1500,
    monthly: 199,
    highlight: false,
    badge: '',
    includes: [
      '1–5 page Intelligent Website (custom design)',
      'Business Hub — CRM, invoicing & client portal',
      'Accounting Silver ($9/mo after launch)',
      'Lead capture wired into your hub',
      'Domain + hosting & support ($149/mo after)',
      '1 IEBC AI Consultant',
      'Email support',
      'Delivered in 4–6 weeks',
    ],
    accentColor: '#0B2140',
  },
  {
    id: 'bundle_gold',
    label: 'Gold Bundle',
    tagline: 'For growing businesses that need the full system.',
    setupAmount: 2500,
    monthly: 349,
    highlight: true,
    badge: 'Most Popular',
    includes: [
      '6–10 page Intelligent Website + booking',
      'Business Hub — full CRM, automation & outreach',
      'Accounting Gold ($22/mo after launch)',
      'Automated lead pipeline & follow-up sequences',
      'Social media scheduling & content calendar',
      'Domain + hosting & support ($149/mo after)',
      '3 IEBC AI Consultants',
      'Priority support + kickoff strategy call',
      'Delivered in 4–6 weeks',
    ],
    accentColor: '#C8902A',
  },
  {
    id: 'bundle_platinum',
    label: 'Platinum Bundle',
    tagline: 'Full-stack infrastructure — no limits.',
    setupAmount: 4000,
    monthly: 549,
    highlight: false,
    badge: '',
    includes: [
      'Unlimited page website + client login portal',
      'Premium Business Hub — all modules, no limits',
      'Accounting Platinum — full 22-module suite ($42/mo after)',
      'Custom automations & API integrations',
      'Payroll, tax center, inventory & job costing',
      'Domain + hosting & support ($149/mo after)',
      '5 IEBC AI Consultants',
      'Dedicated account manager + quarterly reviews',
      'Delivered in 6–8 weeks',
    ],
    accentColor: '#7C3AED',
  },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

function milestones(setup: number) {
  const down = Math.round(setup * 0.25)
  const deploy = Math.round(setup * 0.50)
  const final = setup - down - deploy
  return { down, deploy, final }
}

export default function BundleCheckoutPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [canceled, setCanceled] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', state: '', notes: '',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const plan = params.get('plan')
      if (plan) {
        const match = BUNDLES.find(b => b.id === `bundle_${plan}` || b.label.toLowerCase().includes(plan))
        if (match) setSelectedId(match.id)
      }
      if (params.get('canceled') === 'true') setCanceled(true)
    }
  }, [])

  const bundle = BUNDLES.find(b => b.id === selectedId) ?? null
  const ms = bundle ? milestones(bundle.setupAmount) : null

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bundle || !ms) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/agency-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: bundle.id,
          industryLabel: bundle.label,
          setupAmount: bundle.setupAmount,
          downPaymentAmount: ms.down,
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          state: form.state,
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
    <main className="min-h-screen" style={{ background: '#F8F6F1' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0B2140' }}>
              <span className="text-white font-extrabold text-xs">IEBC</span>
            </div>
            <span className="font-bold text-sm" style={{ color: '#0B2140' }}>Full-Stack Bundle</span>
          </a>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={`font-semibold ${step === 1 ? 'text-[#0B2140]' : ''}`}>1. Choose Bundle</span>
            <span className="mx-1">→</span>
            <span className={`font-semibold ${step === 2 ? 'text-[#0B2140]' : ''}`}>2. Your Info</span>
            <span className="mx-1">→</span>
            <span className="text-gray-300 font-semibold">3. Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {canceled && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            Payment was canceled. Select a bundle below to try again.
          </div>
        )}

        {/* ── STEP 1: Bundle Selection ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>Step 1 of 3</p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>Choose your bundle</h1>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Every bundle includes a custom website, automated business hub, and accounting software — built, connected, and delivered.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {BUNDLES.map(b => {
                const isSelected = selectedId === b.id
                const ms = milestones(b.setupAmount)
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className="rounded-2xl text-left flex flex-col transition-all relative bg-white w-full"
                    style={{
                      border: `2px solid ${isSelected ? b.accentColor : '#e5e7eb'}`,
                      boxShadow: isSelected ? `0 8px 32px ${b.accentColor}22` : undefined,
                    }}
                  >
                    {b.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap" style={{ background: b.accentColor }}>
                          {b.badge}
                        </span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: b.accentColor }}>
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                    )}

                    {/* Color bar */}
                    <div className="h-1.5 rounded-t-2xl w-full" style={{ background: b.accentColor }} />

                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: b.accentColor }}>{b.label}</span>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-3xl font-extrabold" style={{ color: '#0B2140' }}>${b.setupAmount.toLocaleString()}</span>
                          <span className="text-gray-400 text-sm">setup</span>
                          <span className="text-gray-300 text-sm mx-1">+</span>
                          <span className="text-lg font-bold" style={{ color: '#0B2140' }}>${b.monthly}/mo</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{b.tagline}</p>
                        <div className="text-xs rounded-lg px-3 py-2" style={{ background: '#F8F6F1' }}>
                          <span className="font-semibold" style={{ color: b.accentColor }}>${ms.down} due today</span>
                          <span className="text-gray-400"> · ${ms.deploy} at build · ${ms.final} on delivery</span>
                        </div>
                      </div>

                      <ul className="space-y-1.5 flex-1">
                        {b.includes.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="font-bold shrink-0 mt-0.5" style={{ color: b.accentColor }}>✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => { if (selectedId) setStep(2) }}
                disabled={!selectedId}
                className="px-10 py-3.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                style={{ background: bundle?.accentColor ?? '#0B2140' }}
              >
                Continue with {bundle?.label ?? 'a bundle'} →
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              25% down today · 50% at build start · 25% on final delivery
            </p>
          </>
        )}

        {/* ── STEP 2: Your Info ── */}
        {step === 2 && bundle && ms && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>Step 2 of 3</p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>Your information</h1>
              <p className="text-gray-500 text-sm">We&apos;ll reach out within 24 hours to schedule your kickoff call.</p>
            </div>

            {/* Bundle summary */}
            <div className="rounded-xl border p-4 mb-6 flex items-center justify-between bg-white" style={{ borderColor: '#e5e7eb' }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: bundle.accentColor }}>{bundle.label}</span>
                <p className="text-xs text-gray-400 mt-0.5">${bundle.monthly}/mo after launch</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xl font-extrabold" style={{ color: '#0B2140' }}>${bundle.setupAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">${ms.down} due today</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs hover:underline" style={{ color: bundle.accentColor }}>Change</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith', required: true },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@company.com', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 000-0000', required: false },
                { name: 'company', label: 'Business Name', type: 'text', placeholder: 'Your Business LLC', required: false },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleField}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': bundle.accentColor } as React.CSSProperties}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleField}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none bg-white"
                >
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleField}
                  placeholder="Tell us about your business and what you want to accomplish."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Payment breakdown */}
              <div className="rounded-xl p-4 border" style={{ background: '#F8F6F1', borderColor: '#e5e7eb' }}>
                <p className="font-bold text-sm mb-2" style={{ color: '#0B2140' }}>3-Milestone Payment — ${bundle.setupAmount.toLocaleString()} total setup</p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  {[
                    { label: `Down payment (25%) — charged today`, amount: ms.down, done: true },
                    { label: `Build start (50%) — invoiced`, amount: ms.deploy, done: false },
                    { label: `Final delivery (25%) — invoiced on launch`, amount: ms.final, done: false },
                  ].map((m, i) => (
                    <p key={i}>
                      <span className="mr-1">{m.done ? '✓' : '○'}</span>
                      {m.label}:{' '}
                      <span className="font-semibold text-gray-700">${m.amount.toLocaleString()}</span>
                    </p>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                  ${bundle.monthly}/mo retainer begins after your system launches.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-60 shadow-lg"
                  style={{ background: bundle.accentColor }}
                >
                  {loading ? 'Redirecting to payment...' : `Pay $${ms.down.toLocaleString()} Down Payment →`}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Secure checkout via Stripe · balance invoiced at milestones · no long-term contracts
                </p>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">← Back to bundles</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
