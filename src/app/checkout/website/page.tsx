'use client'
import { useState } from 'react'

const PACKAGES = [
  {
    id: 'starter',
    label: '1–5 Page Website',
    price: 500,
    displayPrice: '$500',
    desc: 'Perfect for solo businesses, freelancers, and service providers who need a clean, professional web presence fast.',
    features: [
      'Up to 5 custom pages (Home, About, Services, Contact + 1 more)',
      'Mobile-first responsive design',
      'Online booking & contact form',
      'Lead capture → flows into your IEBC hub',
      'Domain + hosting setup included',
      'Delivered in 2–3 weeks',
    ],
    monthly: '$149/mo hosting & support',
    highlight: false,
  },
  {
    id: 'growth',
    label: '6–10 Page Website',
    price: 1000,
    displayPrice: '$1,000',
    desc: 'For growing businesses that need more content, deeper service pages, client portals, and payment collection built in.',
    features: [
      'Up to 10 custom pages',
      'Client payment portal integration',
      'Blog or resource section',
      'Appointment & event booking system',
      'Lead capture & CRM sync',
      'Custom branding & brand kit',
      'Domain + hosting setup included',
      'Delivered in 3–4 weeks',
    ],
    monthly: '$149/mo hosting & support',
    highlight: true,
  },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

function getMilestones(price: number) {
  const down = Math.round(price * 0.25)
  const deploy = Math.round(price * 0.50)
  const final = price - down - deploy
  return { down, deploy, final }
}

export default function WebsiteCheckoutPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', state: '', website: '', notes: '',
  })

  const pkg = PACKAGES.find(p => p.id === selectedPkg)
  const milestones = pkg ? getMilestones(pkg.price) : null

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pkg || !milestones) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/agency-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: `website_${pkg.id}`,
          industryLabel: `Intelligent Website — ${pkg.label}`,
          setupAmount: pkg.price,
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
            <span className="font-bold text-sm" style={{ color: '#0B2140' }}>Intelligent Websites</span>
          </a>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={`font-semibold ${step === 1 ? 'text-[#0B2140]' : ''}`}>1. Choose Package</span>
            <span className="mx-1">→</span>
            <span className={`font-semibold ${step === 2 ? 'text-[#0B2140]' : ''}`}>2. Your Info</span>
            <span className="mx-1">→</span>
            <span className="text-gray-300 font-semibold">3. Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── STEP 1: Package Selection ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>Step 1 of 3</p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>Choose your website package</h1>
              <p className="text-gray-500 text-sm">AI-powered, mobile-first website built for your industry. Delivered in weeks, not months.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
              {PACKAGES.map(p => {
                const isSelected = selectedPkg === p.id
                const m = getMilestones(p.price)
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPkg(p.id)}
                    className="rounded-2xl border-2 flex flex-col text-left transition-all bg-white w-full relative"
                    style={{
                      borderColor: isSelected ? '#0B2140' : p.highlight ? '#C8902A' : '#e5e7eb',
                      boxShadow: isSelected ? '0 4px 24px rgba(11,33,64,0.15)' : p.highlight ? '0 2px 12px rgba(200,144,42,0.15)' : undefined,
                    }}
                  >
                    {p.highlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap" style={{ background: '#C8902A' }}>
                          Most Popular
                        </span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#0B2140' }}>
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>Website Package</p>
                      <h3 className="font-extrabold text-xl mb-1" style={{ color: '#0B2140' }}>{p.label}</h3>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-4xl font-extrabold" style={{ color: '#0B2140' }}>{p.displayPrice}</span>
                        <span className="text-gray-400 text-sm">one-time build</span>
                      </div>
                      <p className="text-xs font-medium mb-4" style={{ color: '#C8902A' }}>+ {p.monthly}</p>
                      <p className="text-sm text-gray-500 mb-5 leading-relaxed">{p.desc}</p>
                      <ul className="space-y-2 flex-1 mb-4">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="font-bold shrink-0 mt-0.5" style={{ color: '#C8902A' }}>→</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-lg p-3 text-xs border" style={{ background: '#F8F6F1', borderColor: '#e5e7eb' }}>
                        <p className="font-bold mb-1" style={{ color: '#0B2140' }}>Payment schedule</p>
                        <div className="space-y-0.5 text-gray-500">
                          <p>Down today (25%): <span className="font-semibold text-gray-700">${m.down}</span></p>
                          <p>At deployment (50%): <span className="font-semibold text-gray-700">${m.deploy}</span></p>
                          <p>On delivery (25%): <span className="font-semibold text-gray-700">${m.final}</span></p>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => { if (selectedPkg) setStep(2) }}
                disabled={!selectedPkg}
                className="px-10 py-3.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#0B2140' }}
              >
                Continue — {pkg?.displayPrice ?? 'Select a package'} →
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              25% due today · 50% at deployment · 25% on final delivery
            </p>
          </>
        )}

        {/* ── STEP 2: Your Info ── */}
        {step === 2 && pkg && milestones && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>Step 2 of 3</p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>Your information</h1>
              <p className="text-gray-500 text-sm">Tell us about your business so we can build the right site for you.</p>
            </div>

            {/* Package summary */}
            <div className="rounded-xl border p-4 mb-6 flex items-center justify-between bg-white" style={{ borderColor: '#e5e7eb' }}>
              <div>
                <p className="font-bold text-sm" style={{ color: '#0B2140' }}>{pkg.label}</p>
                <p className="text-xs text-gray-400">{pkg.monthly} after launch</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xl font-extrabold" style={{ color: '#0B2140' }}>{pkg.displayPrice}</p>
                  <p className="text-xs text-gray-400">${milestones.down} due today</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs hover:underline" style={{ color: '#C8902A' }}>Change</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith', required: true },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@company.com', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 000-0000', required: false },
                { name: 'company', label: 'Business Name', type: 'text', placeholder: 'Your Business LLC', required: false },
                { name: 'website', label: 'Current Website (if any)', type: 'text', placeholder: 'www.yourbusiness.com', required: false },
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#0B2140' } as React.CSSProperties}
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
                  placeholder="Tell us about your business, goals, or anything specific you want on your site..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              {/* Payment reminder */}
              <div className="rounded-xl p-4 border" style={{ background: '#F8F6F1', borderColor: '#e5e7eb' }}>
                <p className="font-bold text-sm mb-2" style={{ color: '#0B2140' }}>Payment due today: ${milestones.down}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>✓ Down payment (25%) — <span className="font-semibold text-gray-700">${milestones.down}</span> — charged now</p>
                  <p>○ Deployment phase (50%) — <span className="font-semibold text-gray-700">${milestones.deploy}</span> — invoiced at launch</p>
                  <p>○ Final delivery (25%) — <span className="font-semibold text-gray-700">${milestones.final}</span> — invoiced on completion</p>
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
                  Secure checkout via Stripe · 25% due today · balance invoiced at milestones
                </p>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">← Back to packages</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
