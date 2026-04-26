'use client'
import { useState } from 'react'
import Link from 'next/link'

const PLATFORMS = ['YouTube', 'Facebook', 'LinkedIn', 'TikTok', 'Instagram']

const PACKAGES = [
  {
    id: 'starter',
    label: 'Starter',
    platforms: 2,
    platformList: 'Any 2 platforms',
    posts: 12,
    setup: 499,
    monthly: 299,
    badge: '',
    highlight: false,
    features: [
      'Any 2 platforms of your choice',
      '12 posts per month',
      'Content calendar & scheduling',
      'Audience growth strategy',
      'Monthly analytics report',
      'Hashtag & keyword research',
      'Profile optimization',
      'Email support',
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    platforms: 4,
    platformList: 'Any 4 platforms',
    posts: 24,
    setup: 799,
    monthly: 499,
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Any 4 platforms of your choice',
      '24 posts per month',
      'Everything in Starter',
      'Weekly engagement management',
      'Comment & DM response handling',
      'Advanced analytics dashboard',
      'Competitor analysis',
      'A/B content testing',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    platforms: 5,
    platformList: 'All 5 platforms',
    posts: 40,
    setup: 1200,
    monthly: 799,
    badge: '',
    highlight: false,
    features: [
      'All 5 platforms',
      '40 posts per month',
      'Everything in Growth',
      'Daily engagement & community mgmt',
      'Paid ad management (organic + paid)',
      'Full analytics + monthly strategy call',
      'AI-assisted content creation',
      'Dedicated account manager',
      'Influencer outreach support',
    ],
  },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const ACCENT = '#D946EF'
const DARK = '#0B2140'
const GOLD = '#C8902A'

export default function SocialOptimizeCheckout() {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', state: '', notes: '',
  })

  const pkg = PACKAGES.find(p => p.id === selectedPkg)
  const down = pkg ? Math.round(pkg.setup * 0.25) : 0
  const deploy = pkg ? Math.round(pkg.setup * 0.50) : 0
  const final = pkg ? pkg.setup - down - deploy : 0

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function togglePlatform(p: string) {
    if (!pkg) return
    setSelectedPlatforms(prev => {
      if (prev.includes(p)) return prev.filter(x => x !== p)
      if (prev.length >= pkg.platforms) return prev
      return [...prev, p]
    })
  }

  function handleContinue() {
    if (!selectedPkg) return
    if (pkg && selectedPlatforms.length < pkg.platforms) {
      setError(`Please select ${pkg.platforms} platform${pkg.platforms > 1 ? 's' : ''}.`)
      return
    }
    setError('')
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pkg) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/agency-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: `social_optimize_${pkg.id}`,
          industryLabel: `Social Optimize — ${pkg.label} (${selectedPlatforms.join(', ')})`,
          setupAmount: pkg.setup,
          downPaymentAmount: down,
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          state: form.state,
          notes: `Platforms: ${selectedPlatforms.join(', ')}. ${form.notes}`.trim(),
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: DARK }}>
              <span className="text-white font-extrabold text-sm">I</span>
            </div>
            <span className="font-extrabold text-lg" style={{ color: DARK }}>IEBC</span>
            <span className="text-gray-400 text-sm">/ Social Optimize</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={`font-semibold ${step === 1 ? 'text-[#D946EF]' : 'text-gray-400'}`}>1. Choose Package</span>
            <span className="mx-1">→</span>
            <span className={`font-semibold ${step === 2 ? 'text-[#D946EF]' : 'text-gray-400'}`}>2. Your Info</span>
            <span className="mx-1">→</span>
            <span className="text-gray-300 font-semibold">3. Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Step 1 of 3</p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: DARK }}>Choose your Social Optimize package</h1>
              <p className="text-gray-500">We find, grow, and engage your audience — you focus on running your business.</p>
            </div>

            {/* Platform icons */}
            <div className="flex justify-center gap-4 mb-8">
              {[
                { name: 'YouTube', icon: '▶', color: '#FF0000' },
                { name: 'Facebook', icon: 'f', color: '#1877F2' },
                { name: 'LinkedIn', icon: 'in', color: '#0A66C2' },
                { name: 'TikTok', icon: '♪', color: '#010101' },
                { name: 'Instagram', icon: '◈', color: '#E1306C' },
              ].map(p => (
                <div key={p.name} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm" style={{ background: p.color }}>
                    {p.icon}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{p.name}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {PACKAGES.map(p => {
                const isSelected = selectedPkg === p.id
                const pkgDown = Math.round(p.setup * 0.25)
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPkg(p.id); setSelectedPlatforms([]) }}
                    className={`rounded-2xl border-2 flex flex-col text-left transition-all relative bg-white w-full ${
                      isSelected ? 'shadow-xl ring-2' : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                    style={isSelected ? { borderColor: ACCENT, boxShadow: `0 20px 40px -10px ${ACCENT}30` } : {}}
                  >
                    {p.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap" style={{ background: GOLD }}>
                          {p.badge}
                        </span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: ACCENT }}>✓</div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mb-3 ${
                        p.id === 'starter' ? 'bg-slate-100 text-slate-600' :
                        p.id === 'growth' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-pink-50 text-pink-700 border border-pink-200'
                      }`}>{p.label}</span>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-extrabold" style={{ color: DARK }}>${p.monthly}</span>
                        <span className="text-gray-400 text-sm">/mo</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">${p.setup} setup · ${pkgDown} due today</p>
                      <p className="text-sm text-gray-500 mb-4">{p.platformList} · {p.posts} posts/mo</p>
                      <ul className="space-y-1.5 flex-1">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="font-bold mt-0.5 shrink-0" style={{ color: ACCENT }}>✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Platform selector */}
            {pkg && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 max-w-xl mx-auto">
                <p className="text-sm font-bold mb-1" style={{ color: DARK }}>
                  Select your {pkg.platforms} platform{pkg.platforms > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {selectedPlatforms.length}/{pkg.platforms} selected
                </p>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map(platform => {
                    const isChosen = selectedPlatforms.includes(platform)
                    const isFull = !isChosen && selectedPlatforms.length >= pkg.platforms
                    return (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        disabled={isFull}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                          isChosen ? 'text-white border-transparent' :
                          isFull ? 'border-gray-100 text-gray-300 cursor-not-allowed' :
                          'border-gray-200 text-gray-600 hover:border-purple-300'
                        }`}
                        style={isChosen ? { background: ACCENT, borderColor: ACCENT } : {}}
                      >
                        {platform}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {error && (
              <p className="text-center text-sm text-red-600 mb-4">{error}</p>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                disabled={!selectedPkg}
                className="px-10 py-3.5 rounded-xl font-bold text-sm transition text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: selectedPkg ? ACCENT : '#9ca3af' }}
              >
                Continue with {pkg?.label ?? 'a package'} →
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">25% down today · 50% at build start · 25% at launch</p>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && pkg && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Step 2 of 3</p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: DARK }}>Your information</h1>
              <p className="text-gray-500">We&apos;ll use this to set up your Social Optimize campaign.</p>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold text-white mr-2" style={{ background: ACCENT }}>{pkg.label}</span>
                  <span className="text-sm text-gray-500">{selectedPlatforms.join(', ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900">${pkg.monthly}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
                    <p className="text-xs text-gray-400">${down} due today</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs hover:underline" style={{ color: ACCENT }}>Change</button>
                </div>
              </div>
            </div>

            {/* Payment milestones */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500">Payment Schedule</p>
              <div className="space-y-2">
                {[
                  { label: 'Down Payment (25%)', amount: down, timing: 'Due today', color: '#16a34a', badge: 'Pay Now' },
                  { label: 'Campaign Launch (50%)', amount: deploy, timing: 'At launch', color: GOLD, badge: 'Milestone 2' },
                  { label: 'Final Delivery (25%)', amount: final, timing: 'Day 30', color: '#6b7280', badge: 'Milestone 3' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: m.color }}>{m.badge}</span>
                      <span className="text-gray-600">{m.label}</span>
                    </div>
                    <span className="font-bold" style={{ color: m.color }}>${m.amount}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t">${pkg.monthly}/mo retainer begins after campaign launches.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input name="name" type="text" required value={form.name} onChange={handleField} placeholder="Jane Smith"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': ACCENT } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input name="email" type="email" required value={form.email} onChange={handleField} placeholder="jane@company.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleField} placeholder="(555) 000-0000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                  <input name="company" type="text" value={form.company} onChange={handleField} placeholder="ACME Co."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                <select name="state" required value={form.state} onChange={handleField}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white">
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tell us about your business / goals</label>
                <textarea name="notes" value={form.notes} onChange={handleField} rows={3}
                  placeholder="Describe your target audience, current social presence, and goals..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none" />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: loading ? '#9ca3af' : ACCENT }}>
                  {loading ? 'Redirecting to payment...' : `Pay $${down} Now to Get Started →`}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Secure checkout via Stripe · ${down} down today · cancel anytime before campaign launches
                </p>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">← Back to packages</button>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Questions?{' '}
            <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: ACCENT }}>
              Book a strategy call
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
