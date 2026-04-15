'use client'
import { useState } from 'react'

const HUB_FEATURES = [
  'CRM & lead pipeline — capture, track, and close leads automatically',
  'Invoice automation — create, send, and follow up without lifting a finger',
  'Client payment portal — clients pay online through a branded portal',
  'Social media content calendar & scheduling',
  'Project & task management with team assignments',
  'Automated outreach sequences — SMS & email',
  'Reporting & analytics dashboard',
  'Document vault — store contracts, files, and assets',
  'Dedicated IEBC setup & onboarding specialist',
]

const SETUP_PRICE = 1000
const MONTHLY_PRICE = 199

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

function getMilestones() {
  const down = Math.round(SETUP_PRICE * 0.25)
  const deploy = Math.round(SETUP_PRICE * 0.50)
  const final = SETUP_PRICE - down - deploy
  return { down, deploy, final }
}

const milestones = getMilestones()

export default function HubCheckoutPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', state: '', industry: '', notes: '',
  })

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/agency-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: 'business_hub',
          industryLabel: 'Automated Business Hub',
          setupAmount: SETUP_PRICE,
          downPaymentAmount: milestones.down,
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
            <span className="font-bold text-sm" style={{ color: '#0B2140' }}>Automated Business Hub</span>
          </a>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={`font-semibold ${step === 1 ? 'text-[#0B2140]' : ''}`}>1. Review Package</span>
            <span className="mx-1">→</span>
            <span className={`font-semibold ${step === 2 ? 'text-[#0B2140]' : ''}`}>2. Your Info</span>
            <span className="mx-1">→</span>
            <span className="text-gray-300 font-semibold">3. Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── STEP 1: Package Overview ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>Step 1 of 3</p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>Your Automated Business Hub</h1>
              <p className="text-gray-500 text-sm">Everything your business needs to run — built, automated, and delivered in 4–6 weeks.</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl overflow-hidden border-2 mb-6" style={{ borderColor: '#0B2140' }}>
                {/* Card header */}
                <div className="px-8 py-6" style={{ background: '#0B2140' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">⚙️</span>
                    <div>
                      <h2 className="font-bold text-xl text-white">Automated Business Hub</h2>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>CRM · Invoicing · Outreach · Reporting — in one system</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">${SETUP_PRICE.toLocaleString()}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">one-time build</span>
                    <span className="text-white mx-2">+</span>
                    <span className="text-xl font-bold text-white">${MONTHLY_PRICE}/mo</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">retainer</span>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white px-8 py-6">
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#C8902A' }}>What We Build For You</p>
                  <ul className="space-y-2.5 mb-6">
                    {HUB_FEATURES.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className="font-bold shrink-0 mt-0.5" style={{ color: '#C8902A' }}>→</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Payment schedule */}
                  <div className="rounded-xl p-5 border" style={{ background: '#F8F6F1', borderColor: '#e5e7eb' }}>
                    <p className="font-bold text-sm mb-3" style={{ color: '#0B2140' }}>3-Milestone Payment Schedule</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Down Payment (25%)', amount: milestones.down, note: 'Due today', badge: 'Pay Now', color: '#0B2140' },
                        { label: 'Initial Deployment (50%)', amount: milestones.deploy, note: 'Invoiced when build begins', badge: 'Milestone 2', color: '#C8902A' },
                        { label: 'Final Delivery (25%)', amount: milestones.final, note: 'Invoiced on launch', badge: 'Milestone 3', color: '#6b7280' },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white mr-2" style={{ background: m.color }}>{m.badge}</span>
                            <span className="text-gray-700 font-medium">{m.label}</span>
                            <span className="text-gray-400 text-xs ml-2">— {m.note}</span>
                          </div>
                          <span className="font-bold" style={{ color: m.color }}>${m.amount}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                      Monthly ${MONTHLY_PRICE}/mo retainer begins after your hub launches.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 shadow-lg"
                  style={{ background: '#0B2140' }}
                >
                  Purchase Hub — ${milestones.down} down today →
                </button>
                <a
                  href="https://calendly.com/new56money/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-white text-sm text-center transition-opacity hover:opacity-90"
                  style={{ background: '#C8902A' }}
                >
                  Book a Strategy Call First
                </a>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                25% down · 50% at deployment · 25% on final delivery
              </p>
            </div>
          </>
        )}

        {/* ── STEP 2: Your Info ── */}
        {step === 2 && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>Step 2 of 3</p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>Your information</h1>
              <p className="text-gray-500 text-sm">We&apos;ll use this to set up your hub and reach out for your kickoff call.</p>
            </div>

            {/* Summary */}
            <div className="rounded-xl border p-4 mb-6 flex items-center justify-between bg-white" style={{ borderColor: '#e5e7eb' }}>
              <div>
                <p className="font-bold text-sm" style={{ color: '#0B2140' }}>Automated Business Hub</p>
                <p className="text-xs text-gray-400">${MONTHLY_PRICE}/mo retainer after launch</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xl font-extrabold" style={{ color: '#0B2140' }}>${SETUP_PRICE.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">${milestones.down} due today</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs hover:underline" style={{ color: '#C8902A' }}>Back</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith', required: true },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@company.com', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 000-0000', required: false },
                { name: 'company', label: 'Business Name', type: 'text', placeholder: 'Your Business LLC', required: false },
                { name: 'industry', label: 'Your Industry', type: 'text', placeholder: 'e.g. Real estate, Trucking, Retail…', required: false },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleField}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleField}
                  placeholder="What does your business do? What problems are you solving with the hub?"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <div className="rounded-xl p-4 border" style={{ background: '#F8F6F1', borderColor: '#e5e7eb' }}>
                <p className="font-bold text-sm mb-2" style={{ color: '#0B2140' }}>Payment due today: ${milestones.down}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>✓ Down payment (25%) — <span className="font-semibold text-gray-700">${milestones.down}</span> — charged now</p>
                  <p>○ Deployment (50%) — <span className="font-semibold text-gray-700">${milestones.deploy}</span> — invoiced at build start</p>
                  <p>○ Final delivery (25%) — <span className="font-semibold text-gray-700">${milestones.final}</span> — invoiced on launch</p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
                  style={{ background: '#0B2140' }}
                >
                  {loading ? 'Redirecting to payment...' : `Pay $${milestones.down} Down Payment →`}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Secure checkout via Stripe · balance invoiced at milestones
                </p>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">← Back to overview</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
