'use client'

import { useState } from 'react'

const INDUSTRIES = [
  {
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
    setup: '$3,500',
    setupAmount: 3500,
    monthly: 'from $300/mo',
    highlight: 'Best for carriers with 2+ trucks or owner-operators.',
  },
  {
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
    setup: '$1,500',
    setupAmount: 1500,
    monthly: 'from $150/mo',
    highlight: 'Best for solo contractors and small crews (1–10 employees).',
  },
  {
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
    setup: '$1,500',
    setupAmount: 1500,
    monthly: 'from $150/mo',
    highlight: 'Best for freelancers and studios doing $50K+ annually.',
  },
  {
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
    setup: '$1,500',
    setupAmount: 1500,
    monthly: 'from $150/mo',
    highlight: 'Best for retail stores and online sellers with $200K+ in annual volume.',
  },
  {
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
    setup: '$1,500',
    setupAmount: 1500,
    monthly: 'from $150/mo',
    highlight: 'Best for independent restaurants, food trucks, and catering businesses.',
  },
  {
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
    setup: '$1,500',
    setupAmount: 1500,
    monthly: 'from $150/mo',
    highlight: '3 dedicated IEBC nonprofit specialist consultants included.',
  },
  {
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
    setup: '$1,500',
    setupAmount: 1500,
    monthly: 'from $150/mo',
    highlight: 'Best for agencies, collectives, and advisors managing 5+ athletes.',
  },
  {
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
    setup: '$3,500',
    setupAmount: 3500,
    monthly: 'from $300/mo',
    highlight: 'Separate IR platform pricing available for 50+ LP relationships.',
  },
  {
    id: 'privateequity',
    icon: '🏦',
    label: 'Private Equity',
    desc: 'PE firms, real estate syndicators, and venture capital funds raising capital from accredited investors — we build the full investor relations platform managing your LP lifecycle from first contact through distributions and K-1s.',
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
    plan: 'Growth',
    setup: 'from $5,000',
    setupAmount: null, // enterprise — custom quote
    monthly: 'from $2,500/mo',
    highlight: 'Boutique ($5K setup, $2,500/mo) · Growth ($8.5K, $4,500/mo) · Institutional ($15K, $7,500/mo)',
    premium: true,
  },
  {
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
    setup: '$3,500',
    setupAmount: 3500,
    monthly: 'from $300/mo',
    highlight: 'Best for advisors managing 25+ clients or $5M+ AUM.',
  },
]

function fmt(n: number) {
  return '$' + n.toLocaleString()
}

type BuyForm = { name: string; email: string; phone: string; company: string }

export default function IndustriesSection() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showBuy, setShowBuy] = useState(false)
  const [buyForm, setBuyForm] = useState<BuyForm>({ name: '', email: '', phone: '', company: '' })
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyError, setBuyError] = useState('')

  const active = INDUSTRIES.find(i => i.id === selected)

  function selectIndustry(id: string) {
    if (selected === id) {
      setSelected(null)
    } else {
      setSelected(id)
    }
    setShowBuy(false)
    setBuyError('')
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    if (!active || !active.setupAmount) return
    setBuyLoading(true)
    setBuyError('')

    try {
      const depositAmount = Math.round(active.setupAmount * 0.25)
      const res = await fetch('/api/stripe/project-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: active.id,
          industryLabel: active.label,
          plan: active.plan,
          setupAmount: active.setupAmount,
          depositAmount,
          name: buyForm.name,
          email: buyForm.email,
          phone: buyForm.phone,
          company: buyForm.company,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.url
    } catch (err: unknown) {
      setBuyError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setBuyLoading(false)
    }
  }

  return (
    <section id="industries" className="py-20 px-6" style={{ background: '#F8F6F1' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C8902A' }}>
            Industries
          </p>
          <h2
            className="font-playfair text-3xl md:text-4xl font-bold"
            style={{ color: '#0B2140' }}
          >
            Built for your type of business.
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Select your industry to see exactly what IEBC builds for you.
          </p>
        </div>

        {/* Tab grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {INDUSTRIES.map((ind) => {
            const isActive = selected === ind.id
            return (
              <button
                key={ind.id}
                onClick={() => selectIndustry(ind.id)}
                className="rounded-xl border p-4 text-center transition-all cursor-pointer group"
                style={{
                  background: isActive ? '#0B2140' : '#fff',
                  borderColor: isActive ? '#0B2140' : '#e5e7eb',
                  boxShadow: isActive ? '0 4px 20px rgba(11,33,64,0.2)' : undefined,
                  transform: isActive ? 'translateY(-2px)' : undefined,
                }}
              >
                <div className="text-2xl mb-1.5">{ind.icon}</div>
                <p
                  className="text-xs font-semibold leading-snug"
                  style={{ color: isActive ? '#C8902A' : '#0B2140' }}
                >
                  {ind.label}
                </p>
                <div
                  className="mt-1.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'transparent' }}
                >
                  {isActive ? 'selected ↓' : '⠀'}
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail card */}
        {active && (
          <div
            className="rounded-2xl overflow-hidden border-2 shadow-xl"
            style={{ borderColor: '#0B2140' }}
          >
            {/* Card header */}
            <div
              className="px-8 py-6 flex items-start justify-between gap-4"
              style={{ background: '#0B2140' }}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{active.icon}</span>
                  <h3 className="font-playfair text-2xl font-bold text-white">
                    {active.label}
                  </h3>
                  {active.premium && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: '#C8902A', color: '#0B2140' }}
                    >
                      Enterprise
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {active.desc}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-white/40 hover:text-white text-xl shrink-0 transition-colors mt-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Card body */}
            <div className="bg-white px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Features */}
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ color: '#C8902A' }}
                  >
                    What We Build For You
                  </p>
                  <ul className="space-y-2.5">
                    {active.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className="shrink-0 mt-0.5 font-bold" style={{ color: '#C8902A' }}>→</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing + CTA */}
                <div className="flex flex-col gap-4">
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: '#C8902A' }}
                    >
                      Pricing
                    </p>
                    <div
                      className="rounded-xl p-5 border"
                      style={{ background: '#F8F6F1', borderColor: '#e5e7eb' }}
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-playfair text-3xl font-bold" style={{ color: '#0B2140' }}>
                          {active.setup}
                        </span>
                        <span className="text-sm text-gray-400">one-time setup</span>
                      </div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#C8902A' }}>
                        {active.monthly} retainer
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">{active.highlight}</p>
                    </div>
                  </div>

                  {/* Payment milestones — shown if setup amount is known */}
                  {active.setupAmount && (
                    <div className="rounded-xl border border-[#0B2140]/20 overflow-hidden">
                      <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest" style={{ background: '#0B2140', color: '#C8902A' }}>
                        Payment Schedule
                      </div>
                      <div className="divide-y divide-gray-100">
                        {[
                          { label: 'Deposit — due today', pct: '25%', amount: Math.round(active.setupAmount * 0.25), note: 'Kickoff & discovery begin' },
                          { label: 'Deployment — due at launch', pct: '50%', amount: Math.round(active.setupAmount * 0.50), note: 'Build complete, testing begins' },
                          { label: 'Final delivery', pct: '25%', amount: Math.round(active.setupAmount * 0.25), note: 'Go-live & handoff' },
                        ].map((m) => (
                          <div key={m.label} className="flex items-center justify-between px-4 py-3 bg-white">
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{m.label}</p>
                              <p className="text-[11px] text-gray-400">{m.note}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-extrabold" style={{ color: '#0B2140' }}>{fmt(m.amount)}</p>
                              <p className="text-[10px] text-gray-400">{m.pct}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTAs */}
                  {!showBuy ? (
                    <div className="flex flex-col gap-2.5">
                      {active.setupAmount ? (
                        <button
                          onClick={() => setShowBuy(true)}
                          className="w-full text-center py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 shadow-lg"
                          style={{ background: '#C8902A', color: '#fff' }}
                        >
                          Start Project — Pay {fmt(Math.round(active.setupAmount * 0.25))} Deposit
                        </button>
                      ) : (
                        <a
                          href="https://calendly.com/new56money/30min"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 shadow-lg"
                          style={{ background: '#C8902A', color: '#fff' }}
                        >
                          Get Custom Quote →
                        </a>
                      )}
                      <a
                        href="https://calendly.com/new56money/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-3 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-[#0B2140] hover:text-white hover:border-[#0B2140]"
                        style={{ borderColor: '#0B2140', color: '#0B2140' }}
                      >
                        Book a Strategy Call
                      </a>
                    </div>
                  ) : (
                    /* Buy form — inline */
                    <div className="rounded-xl border border-[#C8902A]/40 overflow-hidden">
                      <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#C8902A' }}>
                        <p className="text-sm font-bold text-white">
                          Pay {fmt(Math.round(active.setupAmount! * 0.25))} Deposit to Begin
                        </p>
                        <button
                          onClick={() => { setShowBuy(false); setBuyError('') }}
                          className="text-white/60 hover:text-white text-lg leading-none"
                        >
                          ✕
                        </button>
                      </div>
                      <form onSubmit={handleDeposit} className="bg-white p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={buyForm.name}
                              onChange={e => setBuyForm(p => ({ ...p, name: e.target.value }))}
                              placeholder="Jane Smith"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8902A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                            <input
                              type="email"
                              required
                              value={buyForm.email}
                              onChange={e => setBuyForm(p => ({ ...p, email: e.target.value }))}
                              placeholder="jane@company.com"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8902A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={buyForm.phone}
                              onChange={e => setBuyForm(p => ({ ...p, phone: e.target.value }))}
                              placeholder="(555) 000-0000"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8902A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Business Name</label>
                            <input
                              type="text"
                              value={buyForm.company}
                              onChange={e => setBuyForm(p => ({ ...p, company: e.target.value }))}
                              placeholder="Acme Inc."
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8902A]"
                            />
                          </div>
                        </div>

                        {buyError && (
                          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{buyError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={buyLoading}
                          className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ background: '#0B2140', color: '#fff' }}
                        >
                          {buyLoading
                            ? 'Redirecting to payment...'
                            : `Pay ${fmt(Math.round(active.setupAmount! * 0.25))} Deposit → Stripe`
                          }
                        </button>
                        <p className="text-[10px] text-center text-gray-400">
                          Secure payment via Stripe · Remaining balance invoiced per milestone
                        </p>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompt if nothing selected */}
        {!active && (
          <div
            className="text-center py-8 rounded-2xl border-2 border-dashed"
            style={{ borderColor: 'rgba(200,144,42,0.3)' }}
          >
            <p className="text-sm font-medium" style={{ color: '#C8902A' }}>
              ↑ Select your industry above to see exactly what we build for you.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
