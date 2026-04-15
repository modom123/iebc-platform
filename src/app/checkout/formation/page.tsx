'use client'
import { useState } from 'react'
import Link from 'next/link'

/* ─── Formation Services Catalogue ──────────────────────────────────── */
const FORMATION_SERVICES = [
  // Entity Formation
  {
    id: 'llc',
    label: 'LLC Formation',
    price: 150,
    desc: 'Articles of Organization filed in any U.S. state',
    category: 'Entity Formation',
    icon: '🏢',
  },
  {
    id: 'scorp',
    label: 'S-Corp Formation',
    price: 250,
    desc: 'Articles of Incorporation + IRS Form 2553 S-election filing',
    category: 'Entity Formation',
    icon: '📈',
  },
  {
    id: 'ccorp',
    label: 'C-Corp Formation',
    price: 250,
    desc: 'Delaware or any U.S. state Articles of Incorporation',
    category: 'Entity Formation',
    icon: '🏦',
  },
  {
    id: 'nonprofit',
    label: 'Nonprofit 501(c)(3) Formation',
    price: 350,
    desc: 'Articles, bylaws, and IRS Form 1023 preparation',
    category: 'Entity Formation',
    icon: '❤️',
  },
  {
    id: 'sole_prop',
    label: 'Sole Proprietorship Setup',
    price: 75,
    desc: 'DBA registration filing and business license guidance',
    category: 'Entity Formation',
    icon: '👤',
  },
  // Add-On Services
  {
    id: 'ein',
    label: 'EIN Registration',
    price: 75,
    desc: 'Federal Employer Identification Number obtained from the IRS',
    category: 'Add-On Services',
    icon: '🔢',
  },
  {
    id: 'agent',
    label: 'Registered Agent (1 Year)',
    price: 99,
    desc: 'Official registered agent service in your state — required by law',
    category: 'Add-On Services',
    icon: '📬',
  },
  {
    id: 'operating',
    label: 'Operating Agreement',
    price: 99,
    desc: 'Custom LLC operating agreement drafted by our team',
    category: 'Add-On Services',
    icon: '📄',
  },
  {
    id: 'bylaws',
    label: 'Corporate Bylaws',
    price: 99,
    desc: 'Internal governance document for corporations',
    category: 'Add-On Services',
    icon: '📋',
  },
  {
    id: 'dba',
    label: 'DBA Registration',
    price: 75,
    desc: '"Doing business as" trade name filed with county/state',
    category: 'Add-On Services',
    icon: '🏷️',
  },
  {
    id: 'state_tax',
    label: 'State Tax Registration',
    price: 75,
    desc: 'State business tax account and sales tax permit registration',
    category: 'Add-On Services',
    icon: '🏛️',
  },
  {
    id: 'form2553',
    label: 'IRS Form 2553 (S-Corp Election)',
    price: 99,
    desc: 'S-Corporation tax election filed with the IRS',
    category: 'Add-On Services',
    icon: '📝',
  },
  {
    id: 'compliance',
    label: 'Annual Compliance Package',
    price: 149,
    desc: 'BOI report filing, annual reports, and compliance calendar with reminders',
    category: 'Add-On Services',
    icon: '✅',
  },
]

const CATEGORIES = ['Entity Formation', 'Add-On Services']

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

type ServiceItem = { id: string; label: string; price: number }

export default function FormationCheckoutPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', state: '',
  })

  function toggleService(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedServices: ServiceItem[] = FORMATION_SERVICES
    .filter(s => selected.has(s.id))
    .map(s => ({ id: s.id, label: s.label, price: s.price }))

  const total = selectedServices.reduce((sum, s) => sum + s.price, 0)

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedServices.length === 0) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/formation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: selectedServices,
          total,
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

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#0B2140' }}
            >
              <span className="text-white font-black text-[10px]">IEBC</span>
            </div>
            <span className="font-extrabold text-lg" style={{ color: '#0B2140' }}>IEBC</span>
            <span className="text-gray-400 text-sm hidden sm:block">/ Business Formation</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-bold ${step === 1 ? 'text-[#0B2140]' : 'text-gray-400'}`}>
              1. Select Services
            </span>
            <span className="text-gray-300 mx-1">→</span>
            <span className={`font-bold ${step === 2 ? 'text-[#0B2140]' : 'text-gray-400'}`}>
              2. Your Info
            </span>
            <span className="text-gray-300 mx-1">→</span>
            <span className="text-gray-300 font-bold">3. Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── STEP 1: Select Services ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>
                Step 1 of 3
              </p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>
                Build Your Formation Package
              </h1>
              <p className="text-gray-500 max-w-xl mx-auto">
                Select exactly what you need — à la carte. Our team files everything and delivers your
                documents.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* Services list — 2 cols */}
              <div className="lg:col-span-2 space-y-8">
                {CATEGORIES.map(category => (
                  <div key={category}>
                    <p
                      className="text-xs font-black uppercase tracking-widest mb-3 pb-2 border-b border-gray-200"
                      style={{ color: '#C8902A' }}
                    >
                      {category}
                    </p>
                    <div className="space-y-2">
                      {FORMATION_SERVICES.filter(s => s.category === category).map(service => {
                        const isSelected = selected.has(service.id)
                        return (
                          <button
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className="w-full text-left rounded-xl border-2 p-4 transition-all flex items-center gap-4 cursor-pointer"
                            style={{
                              background: isSelected ? 'rgba(11,33,64,0.04)' : '#fff',
                              borderColor: isSelected ? '#0B2140' : '#e5e7eb',
                              boxShadow: isSelected ? '0 2px 12px rgba(11,33,64,0.12)' : undefined,
                            }}
                          >
                            {/* Checkbox */}
                            <div
                              className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                              style={{
                                borderColor: isSelected ? '#0B2140' : '#d1d5db',
                                background: isSelected ? '#0B2140' : 'transparent',
                              }}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            <span className="text-xl shrink-0">{service.icon}</span>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm" style={{ color: '#0B2140' }}>
                                {service.label}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                {service.desc}
                              </p>
                            </div>

                            <span
                              className="font-black text-base shrink-0 ml-2"
                              style={{ color: isSelected ? '#0B2140' : '#374151' }}
                            >
                              ${service.price}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart summary — 1 col, sticky */}
              <div className="lg:col-span-1">
                <div
                  className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <p className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🧾</span> Your Package
                  </p>

                  {selectedServices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">Select services to start building your package</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                      {selectedServices.map(s => (
                        <div key={s.id} className="flex items-center justify-between text-sm gap-2">
                          <span className="text-gray-700 flex-1 leading-snug">{s.label}</span>
                          <span className="font-semibold text-gray-900 shrink-0">${s.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className="border-t pt-4 mt-2"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">
                        {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-5">
                      <span className="font-bold text-gray-700">Total</span>
                      <span className="text-3xl font-extrabold" style={{ color: '#0B2140' }}>
                        ${total}
                      </span>
                      <span className="text-sm text-gray-400">one-time</span>
                    </div>

                    <button
                      onClick={() => { if (selectedServices.length > 0) setStep(2) }}
                      disabled={selectedServices.length === 0}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: '#0B2140' }}
                    >
                      Continue to Checkout →
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-3">
                      One-time payment · Secure checkout via Stripe
                    </p>
                  </div>

                  {/* Trust badges */}
                  <div className="border-t mt-4 pt-4 space-y-2" style={{ borderColor: '#f3f4f6' }}>
                    {[
                      '✓ All 50 states supported',
                      '✓ Documents delivered within 5–10 business days',
                      '✓ IEBC team handles all filings',
                    ].map((badge, i) => (
                      <p key={i} className="text-xs text-gray-500">{badge}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: Your Information ── */}
        {step === 2 && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>
                Step 2 of 3
              </p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>
                Your Information
              </h1>
              <p className="text-gray-500">
                We&apos;ll use this to file your documents and keep you updated.
              </p>
            </div>

            {/* Order Summary */}
            <div
              className="rounded-xl border border-gray-200 bg-white p-5 mb-6 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Order Summary
              </p>
              <div className="space-y-1.5">
                {selectedServices.map(s => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{s.label}</span>
                    <span className="font-semibold text-gray-900">${s.price}</span>
                  </div>
                ))}
              </div>
              <div
                className="border-t mt-3 pt-3 flex justify-between items-center"
                style={{ borderColor: '#e5e7eb' }}
              >
                <span className="font-bold text-gray-900">Total Due Today</span>
                <span className="text-xl font-extrabold" style={{ color: '#0B2140' }}>
                  ${total}
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs mt-2 hover:underline"
                style={{ color: '#0B2140' }}
              >
                ← Edit services
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleField}
                  placeholder="Jane Smith"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#0B2140' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleField}
                  placeholder="jane@company.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Documents will be delivered to this email.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleField}
                  placeholder="(555) 000-0000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Business / Company Name
                </label>
                <input
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleField}
                  placeholder="Acme Ventures LLC"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Formation State
                </label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleField}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                >
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: '#0B2140' }}
                >
                  {loading
                    ? 'Redirecting to payment...'
                    : `Proceed to Payment — $${total}`}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Secure payment via Stripe · One-time charge · No subscriptions
                </p>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to service selection
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
