'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

/* ─── Industry Catalogue ─────────────────────────────────────────────── */
const INDUSTRIES: Record<string, {
  id: string
  icon: string
  label: string
  desc: string
  features: string[]
  plan: string
  setupRaw: number          // numeric setup fee
  setupDisplay: string      // display string e.g. "$3,500"
  monthly: string
  highlight: string
  premium?: boolean
}> = {
  logistics: {
    id: 'logistics',
    icon: '🚛',
    label: 'Logistics & Trucking',
    desc: 'Full-service operations infrastructure for carriers, owner-operators, and brokers. Load board to ledger — all connected in one system built for the pace of freight.',
    features: [
      'Live load board & dispatch management',
      'Driver management & HOS compliance tracking',
      'Revenue per load / per mile analytics',
      'IFTA & fuel log by state (auto-calculated)',
      'Document vault — BOL, POD, rate confirmations',
      'DAT & Truckstop API integration',
      'Invoice & factoring reconciliation',
      'Fleet maintenance scheduler & cost log',
    ],
    plan: 'Growth',
    setupRaw: 3500,
    setupDisplay: '$3,500',
    monthly: '$300/mo',
    highlight: 'Best for carriers with 2+ trucks or owner-operators.',
  },
  contractors: {
    id: 'contractors',
    icon: '🔨',
    label: 'Contractors & 1099',
    desc: 'Plumbers, electricians, HVAC pros, and all trades — we build the system that handles estimates, jobs, invoices, and tax prep so you can focus on the work.',
    features: [
      'Job estimating tool with professional PDF output',
      'Project tracker with photo documentation',
      'Invoice generation & payment tracking',
      'Materials & supply cost log per job',
      '1099 expense tracker for year-end tax prep',
      'Subcontractor management & payments',
      'Client scheduling & appointment calendar',
      'Certificate of insurance & license vault',
    ],
    plan: 'Starter',
    setupRaw: 1500,
    setupDisplay: '$1,500',
    monthly: '$150/mo',
    highlight: 'Best for solo contractors and small crews (1–10 employees).',
  },
  creative: {
    id: 'creative',
    icon: '🎨',
    label: 'Creative Professionals',
    desc: 'Artists, photographers, designers, videographers — we build the hub that manages your commissions, client bookings, inventory, and income without the admin overwhelm.',
    features: [
      'Artwork & asset inventory with photo library',
      'Commission tracker from inquiry to final delivery',
      'Rental & booking management with deposit collection',
      'Client sales pipeline & follow-up automation',
      'Income reporting by project type & client',
      'Contract & licensing agreement vault',
      'Online booking page with payment integration',
      'Social content calendar & deliverables tracker',
    ],
    plan: 'Starter',
    setupRaw: 1500,
    setupDisplay: '$1,500',
    monthly: '$150/mo',
    highlight: 'Best for freelancers and studios doing $50K+ annually.',
  },
  retail: {
    id: 'retail',
    icon: '🛍️',
    label: 'Retail & E-Commerce',
    desc: 'Inventory, orders, suppliers, customer history, and sales reporting — unified for brick-and-mortar stores and online sellers who are tired of managing everything manually.',
    features: [
      'Live inventory with low-stock alerts & reorder triggers',
      'Order tracking from placed to fulfilled',
      'Supplier & vendor management with PO tracking',
      'Customer purchase history & loyalty tracking',
      'Top products & slow movers sales report',
      'Returns & refund management workflow',
      'Multi-channel sync (Shopify, Square, manual)',
      'Daily & weekly revenue summary reports',
    ],
    plan: 'Starter',
    setupRaw: 1500,
    setupDisplay: '$1,500',
    monthly: '$150/mo',
    highlight: 'Best for retail stores and online sellers with $200K+ in annual volume.',
  },
  restaurant: {
    id: 'restaurant',
    icon: '🍽️',
    label: 'Restaurants & Food Service',
    desc: 'From restaurants to food trucks and caterers — operations infrastructure built for the pace of food service, with staffing, inventory, and sales reporting all in one place.',
    features: [
      'Food & supply inventory management with waste tracking',
      'Staff scheduling & shift management',
      'Supplier order & delivery tracker',
      'Daily sales & revenue reporting by category',
      'Catering & private event booking system',
      'Menu costing & food cost percentage calculator',
      'Vendor invoice matching & accounts payable',
      'Health inspection compliance documentation vault',
    ],
    plan: 'Starter',
    setupRaw: 1500,
    setupDisplay: '$1,500',
    monthly: '$150/mo',
    highlight: 'Best for independent restaurants, food trucks, and catering businesses.',
  },
  nonprofit: {
    id: 'nonprofit',
    icon: '❤️',
    label: 'Nonprofit & Social Impact',
    desc: 'Charities, faith organizations, foundations, and community groups — we handle 501(c)(3) formation and build the complete ops hub for donors, grants, volunteers, and IRS compliance.',
    features: [
      '501(c)(3) formation — Articles, Bylaws, IRS Form 1023 prep',
      'Donor CRM with giving history, recurring gifts & tax receipts',
      'Project tracker with live funding progress visible to donors',
      '50/50 raffle & fundraising engine with Stripe & compliance tracking',
      'Grant pipeline — applications, deadlines, funder relationships, reporting',
      'Donor transparency portal — supporters log in to track their impact',
      'Form 990 prep, expense categorization, audit trail',
      'Board governance, volunteer management & program impact tracking',
    ],
    plan: 'Starter',
    setupRaw: 1500,
    setupDisplay: '$1,500',
    monthly: '$150/mo',
    highlight: '3 dedicated IEBC nonprofit specialist consultants included.',
  },
  sports: {
    id: 'sports',
    icon: '🏆',
    label: 'Sports & NIL',
    desc: 'Agencies, advisors, and collectives managing athletes, coaches, and NIL deals — we build the system that tracks clients, contracts, deals, and brand partnerships all in one place.',
    features: [
      'Athlete & client roster management (CRM)',
      'NIL deal tracking from sourcing to signed',
      'Contract vault with e-signature & expiry alerts',
      'Automated client outreach & follow-up sequences',
      'Social media content calendar & brand scheduling',
      'Revenue reporting by client, deal type & sport',
      'Coach placement & transfer portal pipeline tracker',
      'Brand partnership performance dashboard',
    ],
    plan: 'Starter',
    setupRaw: 1500,
    setupDisplay: '$1,500',
    monthly: '$150/mo',
    highlight: 'Best for agencies, collectives, and advisors managing 5+ athletes.',
  },
  investors: {
    id: 'investors',
    icon: '📈',
    label: 'Investors',
    desc: 'Accredited investors, angel investors, and family offices managing deal flow, portfolio companies, and LP relationships — we build the system that tracks every investment from sourcing to exit.',
    features: [
      'Deal pipeline & investment opportunity tracking',
      'Portfolio company performance monitoring dashboard',
      'Accreditation verification & 2-year renewal tracking',
      'SDIRA & retirement capital portal (Equity Trust, Millennium)',
      'K-1 tax document self-service download portal',
      'Investment memo & secure data room per opportunity',
      'Co-investor & syndicate participation management',
      'Distribution tracking, reporting & capital account ledger',
    ],
    plan: 'Growth',
    setupRaw: 3500,
    setupDisplay: '$3,500',
    monthly: '$300/mo',
    highlight: 'Separate IR platform pricing available for 50+ LP relationships.',
  },
  privateequity: {
    id: 'privateequity',
    icon: '🏦',
    label: 'Private Equity',
    desc: 'PE firms, real estate syndicators, and venture capital funds raising capital from accredited investors — we build the full investor relations platform managing your LP lifecycle.',
    features: [
      'LP/investor CRM with lead scoring & automated SMS/email outreach',
      'Fund & deal portfolio tracker with live raise progress bars',
      'Waterfall distribution engine — pref return, GP catch-up, profit split',
      'Secure data rooms segmented by deal, fund class & investor tier',
      'Quarterly investor reporting & performance pack generator',
      'EDGAR Form D scraping — auto-populates prospect pipeline with Reg D filers',
      'K-1 tax document matching & investor self-service portal',
      'RIA advisor & Co-GP partner portals with dedicated dashboards',
    ],
    plan: 'Enterprise',
    setupRaw: 5000,
    setupDisplay: 'from $5,000',
    monthly: 'from $2,500/mo',
    highlight: 'Boutique ($5K) · Growth ($8.5K) · Institutional ($15K)',
    premium: true,
  },
  financial: {
    id: 'financial',
    icon: '💼',
    label: 'Financial Services',
    desc: 'RIAs, financial advisors, insurance professionals, and wealth managers — we build the compliance-ready client management system that handles your book of business and automates the routine.',
    features: [
      'Client portfolio & account overview dashboard',
      'AUM tracker & advisory fee billing management',
      'Compliance documentation & audit trail (SEC/FINRA ready)',
      'Client portal with performance reporting & document access',
      'Annual review scheduling, agenda builder & documentation',
      'Prospect pipeline & new client onboarding workflow',
      'Insurance policy tracking, renewal alerts & commission ledger',
      'Referral partner relationship management (CRM)',
    ],
    plan: 'Growth',
    setupRaw: 3500,
    setupDisplay: '$3,500',
    monthly: '$300/mo',
    highlight: 'Best for advisors managing 25+ clients or $5M+ AUM.',
  },
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

/* ─── Payment milestone helpers ─────────────────────────────────────── */
function getMilestones(setupRaw: number) {
  const down = Math.round(setupRaw * 0.25)
  const deploy = Math.round(setupRaw * 0.50)
  const final = setupRaw - down - deploy
  return { down, deploy, final }
}

export default function IndustryCheckoutPage() {
  const params = useParams()
  const industryId = typeof params.id === 'string' ? params.id : ''
  const industry = INDUSTRIES[industryId]

  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', state: '',
  })

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (!industry) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Industry not found.</p>
        <Link href="/#industries" className="text-[#0B2140] hover:underline font-semibold">
          ← Back to Industries
        </Link>
      </main>
    )
  }

  const { down, deploy, final } = getMilestones(industry.setupRaw)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/agency-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: industry.id,
          industryLabel: industry.label,
          setupAmount: industry.setupRaw,
          downPaymentAmount: down,
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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0B2140' }}>
              <span className="text-white font-black text-[10px]">IEBC</span>
            </div>
            <span className="font-extrabold text-lg hidden sm:block" style={{ color: '#0B2140' }}>IEBC</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className={`font-bold ${step === 1 ? 'text-[#0B2140]' : 'text-gray-400'}`}>
              1. Review Package
            </span>
            <span className="text-gray-300 mx-1">→</span>
            <span className={`font-bold ${step === 2 ? 'text-[#0B2140]' : 'text-gray-400'}`}>
              2. Your Info
            </span>
            <span className="text-gray-300 mx-1">→</span>
            <span className="text-gray-300 font-bold">3. Pay Deposit</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── STEP 1: Review Package & Payment Schedule ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8902A' }}>
                Step 1 of 3
              </p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-4xl">{industry.icon}</span>
                <h1 className="text-3xl font-extrabold" style={{ color: '#0B2140' }}>
                  {industry.label}
                </h1>
              </div>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">{industry.desc}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left: What's included */}
              <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: '#C8902A' }}>
                  What We Build For You
                </p>
                <ul className="space-y-3">
                  {industry.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="shrink-0 font-bold mt-0.5" style={{ color: '#C8902A' }}>→</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className="mt-6 rounded-xl p-4 text-sm"
                  style={{ background: 'rgba(11,33,64,0.04)', border: '1px solid rgba(11,33,64,0.1)' }}
                >
                  <span className="font-bold" style={{ color: '#0B2140' }}>📌 Best fit: </span>
                  <span className="text-gray-600">{industry.highlight}</span>
                </div>

                {industry.premium && (
                  <div
                    className="mt-3 rounded-xl px-4 py-2 text-xs font-semibold"
                    style={{ background: 'rgba(200,144,42,0.1)', color: '#C8902A' }}
                  >
                    ★ Enterprise pricing — scope call recommended before purchase
                  </div>
                )}
              </div>

              {/* Right: Payment schedule */}
              <div className="space-y-5">

                {/* Pricing summary */}
                <div
                  className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
                >
                  <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: '#C8902A' }}>
                    Investment & Payment Schedule
                  </p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-4xl font-extrabold" style={{ color: '#0B2140' }}>
                        {industry.setupDisplay}
                      </span>
                      <span className="text-sm text-gray-400">setup fee</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#C8902A' }}>
                      + {industry.monthly} retainer after launch
                    </p>
                  </div>

                  {/* Milestone breakdown */}
                  <div className="space-y-3 mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Milestone Payment Breakdown
                    </p>

                    {[
                      {
                        label: 'Down Payment',
                        sub: 'Due today — kickoff payment',
                        amount: down,
                        pct: '25%',
                        color: '#0B2140',
                        bg: 'rgba(11,33,64,0.06)',
                        badge: 'Pay Now',
                      },
                      {
                        label: 'Initial Deployment',
                        sub: 'Due when build begins — testing phase',
                        amount: deploy,
                        pct: '50%',
                        color: '#C8902A',
                        bg: 'rgba(200,144,42,0.08)',
                        badge: 'Milestone 2',
                      },
                      {
                        label: 'Final Delivery',
                        sub: 'Due on delivery & launch',
                        amount: final,
                        pct: '25%',
                        color: '#059669',
                        bg: 'rgba(5,150,105,0.06)',
                        badge: 'Milestone 3',
                      },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-4 flex items-center justify-between gap-3"
                        style={{ background: m.bg }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-sm" style={{ color: m.color }}>
                              {m.label}
                            </p>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: m.color, color: '#fff' }}
                            >
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{m.sub}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-lg" style={{ color: m.color }}>
                            ${m.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">{m.pct} of setup</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Monthly retainer note */}
                  <div
                    className="rounded-xl p-3 text-xs text-gray-500 leading-relaxed"
                    style={{ background: '#F8F6F1', border: '1px solid #e5e7eb' }}
                  >
                    <span className="font-semibold text-gray-700">Monthly retainer ({industry.monthly})</span> begins
                    after your system launches. Covers hosting, support, updates, and AI consultant access.
                    No long-term contract.
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-xl font-bold text-base text-white transition-opacity hover:opacity-90 shadow-lg"
                  style={{ background: '#0B2140' }}
                >
                  Proceed — Pay ${down.toLocaleString()} Down Payment →
                </button>
                <p className="text-center text-xs text-gray-400">
                  Today you pay the 25% down payment (${down.toLocaleString()}). The remaining
                  ${(deploy + final).toLocaleString()} is invoiced at project milestones.
                </p>

                <div className="flex justify-center">
                  <a
                    href="/#industries"
                    className="text-sm hover:underline"
                    style={{ color: '#0B2140' }}
                  >
                    ← Back to all industries
                  </a>
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
              <p className="text-gray-500">We&apos;ll use this to set up your project and send your invoice schedule.</p>
            </div>

            {/* Package summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{industry.icon}</span>
                <div>
                  <p className="font-bold text-gray-900">{industry.label} Package</p>
                  <p className="text-xs text-gray-500">
                    Setup: {industry.setupDisplay} · Retainer: {industry.monthly}
                  </p>
                </div>
              </div>
              <div
                className="rounded-lg p-3 flex items-center justify-between"
                style={{ background: 'rgba(11,33,64,0.04)' }}
              >
                <div>
                  <p className="text-xs text-gray-500">Down payment due today</p>
                  <p className="font-bold text-sm" style={{ color: '#0B2140' }}>25% of setup fee</p>
                </div>
                <span className="text-2xl font-extrabold" style={{ color: '#0B2140' }}>
                  ${down.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs mt-2 hover:underline"
                style={{ color: '#0B2140' }}
              >
                ← Edit selection
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Project updates and invoice schedule will be sent here.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleField}
                  placeholder="(555) 000-0000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                <input
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleField}
                  placeholder="Acme Logistics LLC"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleField}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent bg-white"
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
                  className="w-full py-4 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: '#0B2140' }}
                >
                  {loading
                    ? 'Redirecting to payment...'
                    : `Pay Down Payment — $${down.toLocaleString()}`}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Secure payment via Stripe · Your card will be charged ${down.toLocaleString()} today
                </p>
              </div>

              {/* Payment schedule reminder */}
              <div
                className="rounded-xl p-4 text-xs space-y-1.5"
                style={{ background: '#F8F6F1', border: '1px solid #e5e7eb' }}
              >
                <p className="font-bold text-gray-700 mb-2">Full Payment Schedule</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Down payment (today)</span>
                  <span className="font-semibold" style={{ color: '#0B2140' }}>${down.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deployment phase invoice</span>
                  <span className="font-semibold text-gray-700">${deploy.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Final delivery invoice</span>
                  <span className="font-semibold text-gray-700">${final.toLocaleString()}</span>
                </div>
                <div
                  className="flex justify-between border-t pt-2 mt-2 font-bold"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <span className="text-gray-700">Total setup</span>
                  <span style={{ color: '#0B2140' }}>{industry.setupDisplay}</span>
                </div>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to package review
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
