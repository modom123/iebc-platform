'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Contractor = {
  id: string
  name: string
  title: string
  rate: number
  exp: string
  badge?: string
  bio: string
  skills: string[]
  avatarBg?: string
}

type Department = {
  id: string
  name: string
  icon: string
  color: string
  desc: string
  contractors: Contractor[]
}

const DEPARTMENTS: Department[] = [
  {
    id: 'finance',
    name: 'Finance & Accounting',
    icon: '💼',
    color: '#0F4C81',
    desc: 'CFOs, tax strategists, bookkeepers & financial analysts',
    contractors: [
      { id: 'f1', name: 'Marcus Webb', title: 'CFO Advisor', rate: 2800, exp: '18 yrs', badge: 'Top Rated', bio: 'Former Big 4 CFO who has helped 40+ companies scale from $1M to $20M ARR. Expert in financial modeling, fundraising, and exit strategy.', skills: ['Financial Modeling', 'Fundraising', 'Exit Strategy'] },
      { id: 'f2', name: 'Priya Sharma', title: 'Tax Strategist', rate: 1900, exp: '12 yrs', bio: 'CPA & tax attorney specializing in business structuring, R&D credits, and multi-state compliance. Has saved clients $2M+ in taxes.', skills: ['Tax Planning', 'R&D Credits', 'Multi-state Compliance'] },
      { id: 'f3', name: 'David Chen', title: 'Bookkeeping Expert', rate: 800, exp: '8 yrs', bio: 'QuickBooks ProAdvisor handling full-cycle bookkeeping, month-end close, and financial reporting for growing SMBs.', skills: ['QuickBooks', 'Month-end Close', 'Financial Reporting'] },
      { id: 'f4', name: 'Rachel Torres', title: 'Cash Flow Analyst', rate: 1200, exp: '10 yrs', bio: '13-week cash flow modeling, working capital optimization, and burn rate analysis. Kept 15+ startups solvent through funding gaps.', skills: ['Cash Flow Modeling', 'Working Capital', 'Burn Rate Analysis'] },
      { id: 'f5', name: 'James Okafor', title: 'Payroll Specialist', rate: 950, exp: '9 yrs', bio: 'Multi-state payroll compliance expert. Handles benefits administration, 401(k) setup, and PEO transitions.', skills: ['Payroll Compliance', 'Benefits Admin', '401(k) Setup'] },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    icon: '📣',
    color: '#7C3AED',
    desc: 'Brand strategists, SEO experts, sales coaches & ad specialists',
    contractors: [
      { id: 'm1', name: 'Sofia Reyes', title: 'Brand Strategist', rate: 2200, exp: '14 yrs', badge: 'Top Rated', bio: 'Built brand identities for 80+ companies. Former creative director at Ogilvy. Expert in brand positioning and visual identity systems.', skills: ['Brand Identity', 'Positioning', 'Visual Design'] },
      { id: 'm2', name: 'Tyler Nash', title: 'SEO Specialist', rate: 1400, exp: '10 yrs', bio: 'Grown organic traffic 10x+ for e-commerce, SaaS, and local businesses. Expert in technical SEO, content strategy, and link building.', skills: ['Technical SEO', 'Content Strategy', 'Link Building'] },
      { id: 'm3', name: 'Amara Johnson', title: 'Social Media Manager', rate: 1100, exp: '7 yrs', bio: 'Managed social presence for brands with 500K+ followers. Expert in paid + organic strategies across all major platforms.', skills: ['Content Creation', 'Community Management', 'Paid Social'] },
      { id: 'm4', name: 'Kevin Park', title: 'Paid Advertising', rate: 1800, exp: '11 yrs', bio: 'Managed $10M+ in ad spend across Google, Meta, and LinkedIn. Average client ROAS of 4.2x. Specializes in e-commerce and lead gen.', skills: ['Google Ads', 'Meta Ads', 'LinkedIn Ads'] },
      { id: 'm5', name: 'Lisa Hernandez', title: 'Sales Coach', rate: 2500, exp: '16 yrs', bio: 'Built and trained 200-person sales teams. Former VP of Sales at two unicorns. Expert in outbound, pipeline building, and sales process design.', skills: ['Sales Process', 'Pipeline Building', 'Team Training'] },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: '⚙️',
    color: '#059669',
    desc: 'Operations managers, supply chain experts & project managers',
    contractors: [
      { id: 'o1', name: 'Robert Kim', title: 'Operations Manager', rate: 2400, exp: '15 yrs', badge: 'Top Rated', bio: 'Scaled operations for 3 companies from 10 to 200 employees. Expert in process automation, SOPs, and operational efficiency programs.', skills: ['Process Automation', 'SOPs', 'Scaling Ops'] },
      { id: 'o2', name: 'Dana White', title: 'Supply Chain Expert', rate: 1700, exp: '12 yrs', bio: 'Managed global supply chains for retail and manufacturing. Expert in vendor negotiation, logistics optimization, and inventory management.', skills: ['Vendor Negotiation', 'Logistics', 'Inventory Management'] },
      { id: 'o3', name: 'Marcus Fields', title: 'Project Manager', rate: 1500, exp: '10 yrs', bio: 'PMP certified. Delivered 100+ projects on time and budget. Expert in Agile, Waterfall, and hybrid methodologies across industries.', skills: ['Agile', 'Risk Management', 'Stakeholder Communication'] },
      { id: 'o4', name: 'Nina Patel', title: 'Process Improvement', rate: 1300, exp: '9 yrs', bio: 'Six Sigma Black Belt. Reduced operational costs by 30%+ at every engagement. Expert in lean manufacturing and workflow optimization.', skills: ['Six Sigma', 'Lean', 'Workflow Optimization'] },
    ],
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    icon: '⚖️',
    color: '#DC2626',
    desc: 'Business attorneys, contract specialists & compliance officers',
    contractors: [
      { id: 'l1', name: 'Jennifer Moss', title: 'Business Attorney', rate: 3200, exp: '20 yrs', badge: 'Senior', bio: 'Former partner at a top-10 law firm. Expert in corporate law, M&A, and investor agreements. Has closed $500M+ in transactions.', skills: ['Corporate Law', 'M&A', 'Investor Agreements'] },
      { id: 'l2', name: 'Carlos Rivera', title: 'Contract Specialist', rate: 1800, exp: '13 yrs', bio: 'Drafted and reviewed 5,000+ commercial contracts. Expert in SaaS agreements, vendor contracts, and NDAs for tech companies.', skills: ['SaaS Agreements', 'Vendor Contracts', 'NDAs'] },
      { id: 'l3', name: 'Sandra Liu', title: 'Compliance Officer', rate: 1600, exp: '11 yrs', bio: 'Expert in SOC 2, HIPAA, GDPR, and financial compliance. Has led compliance programs at 3 publicly traded companies.', skills: ['SOC 2', 'HIPAA', 'GDPR'] },
      { id: 'l4', name: 'Aaron Banks', title: 'IP Advisor', rate: 2100, exp: '14 yrs', bio: 'Trademark, patent, and copyright specialist. Has protected IP portfolios worth $200M+ for tech and consumer brands globally.', skills: ['Trademark', 'Patent Strategy', 'Copyright'] },
    ],
  },
  {
    id: 'hr',
    name: 'HR & People',
    icon: '👥',
    color: '#D97706',
    desc: 'HR directors, recruiters, culture advisors & performance coaches',
    contractors: [
      { id: 'h1', name: 'Michelle Grant', title: 'HR Director', rate: 2300, exp: '16 yrs', badge: 'Top Rated', bio: 'Built HR functions from 0 to 300 employees at 4 startups. Expert in culture design, compensation strategy, and HR systems implementation.', skills: ['Culture Design', 'Compensation', 'HR Systems'] },
      { id: 'h2', name: 'Derek Thompson', title: 'Recruiting Specialist', rate: 1400, exp: '9 yrs', bio: 'Placed 500+ candidates across tech, finance, and operations. Expert in executive search, employer branding, and sourcing.', skills: ['Executive Search', 'Employer Branding', 'Sourcing'] },
      { id: 'h3', name: 'Yuki Tanaka', title: 'Culture Advisor', rate: 1200, exp: '8 yrs', bio: 'Transformed workplace cultures at 20+ companies. Expert in remote-first culture, DEI initiatives, and employee engagement programs.', skills: ['Remote Culture', 'DEI', 'Employee Engagement'] },
      { id: 'h4', name: 'Christine Lee', title: 'Training & Development', rate: 1100, exp: '10 yrs', bio: 'Designed learning programs for 5,000+ employees. Expert in leadership development, onboarding design, and LMS implementation.', skills: ['Leadership Dev', 'Onboarding', 'LMS'] },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    color: '#0891B2',
    desc: 'CTO advisors, cybersecurity experts, architects & data analysts',
    contractors: [
      { id: 't1', name: 'Alex Morgan', title: 'CTO Advisor', rate: 3500, exp: '22 yrs', badge: 'Senior', bio: 'Former CTO at two $100M+ companies. Expert in technology strategy, engineering org design, and scaling infrastructure from startup to enterprise.', skills: ['Tech Strategy', 'Engineering Orgs', 'Architecture'] },
      { id: 't2', name: 'Raj Gupta', title: 'Cybersecurity Expert', rate: 2800, exp: '15 yrs', bio: 'CISSP certified. Led security programs at Fortune 500 companies. Expert in penetration testing, incident response, and security architecture.', skills: ['Penetration Testing', 'Incident Response', 'Security Architecture'] },
      { id: 't3', name: 'Emma Walsh', title: 'Software Architect', rate: 3200, exp: '18 yrs', bio: 'Designed systems handling 1B+ transactions. Expert in microservices, cloud architecture (AWS/GCP/Azure), and API design patterns.', skills: ['Microservices', 'Cloud Architecture', 'API Design'] },
      { id: 't4', name: 'Chris Brown', title: 'Data Analyst', rate: 1900, exp: '11 yrs', bio: 'Built data pipelines and BI dashboards for 50+ companies. Expert in SQL, Python, Tableau, and modern data warehouse design.', skills: ['SQL/Python', 'Tableau', 'Data Warehousing'] },
      { id: 't5', name: 'Maya Robinson', title: 'AI Integration', rate: 2600, exp: '9 yrs', badge: 'In Demand', bio: 'Integrated AI/ML solutions generating $50M+ in cost savings for clients. Expert in LLM applications, automation pipelines, and predictive modeling.', skills: ['LLM Apps', 'ML Models', 'Process Automation'] },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy & Growth',
    icon: '♟️',
    color: '#6D28D9',
    desc: 'Business strategists, growth experts & M&A advisors',
    contractors: [
      { id: 's1', name: 'Brian Foster', title: 'Business Strategist', rate: 2900, exp: '19 yrs', badge: 'Top Rated', bio: 'Former McKinsey partner. Expert in competitive strategy, market entry, and operational transformation for mid-market companies.', skills: ['Competitive Strategy', 'Market Entry', 'Transformation'] },
      { id: 's2', name: 'Natasha Green', title: 'Growth Expert', rate: 2100, exp: '10 yrs', bio: 'Scaled 10 startups from $0 to $10M ARR. Expert in product-led growth, viral loops, and rapid experimentation frameworks.', skills: ['Product-led Growth', 'Viral Loops', 'A/B Testing'] },
      { id: 's3', name: 'William Hayes', title: 'M&A Advisor', rate: 3800, exp: '24 yrs', badge: 'Senior', bio: 'Closed 50+ deals totaling $2B+. Expert in buy-side and sell-side M&A, due diligence, and deal structuring.', skills: ['M&A Strategy', 'Due Diligence', 'Deal Structuring'] },
      { id: 's4', name: 'Alicia Monroe', title: 'Franchise Consultant', rate: 1700, exp: '12 yrs', bio: 'Helped 100+ entrepreneurs launch and scale franchise businesses. Expert in FDD compliance, site selection, and franchisee training.', skills: ['FDD Compliance', 'Site Selection', 'Franchise Training'] },
    ],
  },
  {
    id: 'industry',
    name: 'Industry Specialists',
    icon: '🏆',
    color: '#0F766E',
    desc: 'Real estate, healthcare, e-commerce & industry-specific experts',
    contractors: [
      { id: 'i1', name: 'Gregory Stone', title: 'Real Estate Advisor', rate: 2200, exp: '17 yrs', bio: 'Commercial and residential real estate expert. Structured $500M+ in transactions. Expert in acquisitions, deal financing, and portfolio management.', skills: ['Acquisitions', 'Deal Financing', 'Portfolio Management'] },
      { id: 'i2', name: 'Dr. Sarah Mitchell', title: 'Healthcare Consultant', rate: 2600, exp: '20 yrs', badge: 'Senior', bio: 'Former CMO at a 500-bed hospital system. Expert in healthcare operations, regulatory compliance, and revenue cycle management.', skills: ['Healthcare Ops', 'Regulatory', 'Revenue Cycle'] },
      { id: 'i3', name: 'Jason Wu', title: 'E-commerce Expert', rate: 1800, exp: '12 yrs', bio: 'Scaled multiple 8-figure e-commerce brands. Expert in Shopify, marketplace strategy, supply chain optimization, and CRO.', skills: ['Shopify', 'Marketplace Strategy', 'CRO'] },
      { id: 'i4', name: 'Maria Santos', title: 'Restaurant & Food', rate: 1400, exp: '14 yrs', bio: 'Opened 30+ restaurants and ghost kitchens. Expert in menu engineering, food cost control, and franchise development for food brands.', skills: ['Menu Engineering', 'Food Cost', 'Franchise Dev'] },
    ],
  },
]

const DURATION_OPTIONS = [
  { months: 1, label: '1 Month', discount: 0 },
  { months: 3, label: '3 Months', discount: 10 },
  { months: 6, label: '6 Months', discount: 20 },
  { months: 12, label: '12 Months', discount: 30 },
]

export default function InfrastructurePage() {
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0].id)
  const [cart, setCart] = useState<(Contractor & { deptName: string; negotiatedRate?: number })[]>([])
  const [duration, setDuration] = useState(1)
  const [offerMode, setOfferMode] = useState<string | null>(null)
  const [offerValues, setOfferValues] = useState<Record<string, string>>({})
  const router = useRouter()

  const currentDept = DEPARTMENTS.find(d => d.id === selectedDept)!
  const durationOpt = DURATION_OPTIONS.find(d => d.months === duration)!
  const monthlyTotal = cart.reduce((s, c) => s + (c.negotiatedRate ?? c.rate), 0)
  const subtotal = monthlyTotal * duration
  const discountAmt = Math.round(subtotal * durationOpt.discount / 100)
  const total = subtotal - discountAmt

  function toggleCart(contractor: Contractor, negotiatedRate?: number) {
    const deptName = DEPARTMENTS.find(d => d.contractors.some(c => c.id === contractor.id))?.name ?? ''
    setCart(prev =>
      prev.some(c => c.id === contractor.id)
        ? prev.filter(c => c.id !== contractor.id)
        : [...prev, { ...contractor, deptName, negotiatedRate }]
    )
    setOfferMode(null)
  }

  function openOffer(contractor: Contractor) {
    setOfferValues(v => ({ ...v, [contractor.id]: String(contractor.rate) }))
    setOfferMode(contractor.id)
  }

  function addWithOffer(contractor: Contractor) {
    const offered = parseInt(offerValues[contractor.id] ?? String(contractor.rate), 10)
    const rate = isNaN(offered) || offered <= 0 ? contractor.rate : offered
    toggleCart(contractor, rate !== contractor.rate ? rate : undefined)
  }

  function checkout() {
    sessionStorage.setItem('infra_cart', JSON.stringify({ contractors: cart, duration, total, monthlyTotal }))
    router.push('/checkout/infrastructure')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* Hero header */}
      <div className="bg-[#0B2140]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="text-blue-300 text-sm hover:text-white mb-4 inline-block transition">← Back to IEBC</Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Build Your IEBC AI Advisor Team</h1>
          <p className="text-blue-200 text-base max-w-2xl leading-relaxed">
            Contract <strong className="text-white">dedicated</strong> IEBC AI Advisors — exclusively focused on your business, full engagement.
            Browse departments, choose your advisors, negotiate your rate, and get to work.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-sm text-blue-300">
            <span>✓ Dedicated to your business only</span>
            <span>✓ Negotiate salary directly</span>
            <span>✓ Senior-level expertise</span>
            <span>✓ Cancel with 30-day notice</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-xs text-blue-200">
            <span>💡</span>
            <span>Need fractional advisors at a lower cost? See our <a href="/#pricing" className="text-white font-semibold underline">Bundle plans</a> — fractional advisory hours included.</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start">

          {/* Department sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Departments</p>
            <div className="space-y-0.5">
              {DEPARTMENTS.map(dept => {
                const hasInCart = cart.some(c => dept.contractors.some(x => x.id === c.id))
                const isActive = selectedDept === dept.id
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2.5 transition ${
                      isActive ? 'bg-[#0B2140] text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <span className="text-base leading-none">{dept.icon}</span>
                    <span className="truncate leading-tight">{dept.name}</span>
                    {hasInCart && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Mobile department tabs */}
          <div className="lg:hidden w-full mb-4">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedDept === dept.id ? 'bg-[#0B2140] text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {dept.icon} {dept.name}
                </button>
              ))}
            </div>
          </div>

          {/* IEBC AI Advisor grid */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{currentDept.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentDept.name}</h2>
                <p className="text-sm text-gray-500">{currentDept.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {currentDept.contractors.map(contractor => {
                const inCart = cart.some(c => c.id === contractor.id)
                return (
                  <div
                    key={contractor.id}
                    className={`bg-white rounded-2xl border-2 p-5 transition ${
                      inCart ? 'border-[#0B2140] shadow-lg' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(contractor.name)}&backgroundColor=0B2140`}
                        alt={contractor.name}
                        className="w-14 h-14 rounded-full shrink-0 border-2 border-gray-100 bg-gray-50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{contractor.name}</p>
                            <p className="text-xs text-gray-500">{contractor.title} · {contractor.exp} experience</p>
                          </div>
                          {contractor.badge && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: `${currentDept.color}18`, color: currentDept.color }}
                            >
                              {contractor.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{contractor.bio}</p>
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {contractor.skills.map(s => (
                            <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {offerMode === contractor.id ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Your offer ($/mo)</label>
                          <input
                            type="number"
                            value={offerValues[contractor.id] ?? contractor.rate}
                            onChange={e => setOfferValues(v => ({ ...v, [contractor.id]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#C9A02E] focus:border-transparent"
                            min={1}
                          />
                          <p className="text-[10px] text-gray-400">Listed rate: ${contractor.rate.toLocaleString()}/mo · IEBC will respond to your offer within 2 hrs</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addWithOffer(contractor)}
                              className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition" style={{ background: '#C9A02E' }}
                            >
                              Add at ${parseInt(offerValues[contractor.id] ?? String(contractor.rate)).toLocaleString() || '—'}/mo
                            </button>
                            <button onClick={() => setOfferMode(null)} className="px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-800 border border-gray-200">✕</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-extrabold text-gray-900">${(cart.find(c => c.id === contractor.id)?.negotiatedRate ?? contractor.rate).toLocaleString()}</span>
                              <span className="text-xs text-gray-400">/mo</span>
                            </div>
                            {cart.find(c => c.id === contractor.id)?.negotiatedRate && (
                              <p className="text-[10px] text-amber-600 font-semibold">Offered · listed ${contractor.rate.toLocaleString()}/mo</p>
                            )}
                            <p className="text-[10px] text-gray-400">Dedicated engagement</p>
                          </div>
                          <div className="flex flex-col gap-1.5 items-end shrink-0">
                            <button
                              onClick={() => toggleCart(contractor)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                inCart ? 'bg-[#0B2140] text-white' : 'bg-gray-100 text-gray-700 hover:bg-[#0B2140] hover:text-white'
                              }`}
                            >
                              {inCart ? '✓ Added' : '+ Add Advisor'}
                            </button>
                            {!inCart && (
                              <button onClick={() => openOffer(contractor)} className="text-xs font-semibold underline" style={{ color: '#C9A02E' }}>
                                Make an Offer
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </main>

          {/* Cart sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#0B2140] px-5 py-4 flex items-center justify-between">
                <p className="text-white font-bold text-sm">Your AI Advisors</p>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.length} selected
                </span>
              </div>

              <div className="p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      No advisors selected yet.<br />Browse departments and add IEBC AI Advisors.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {cart.map(c => (
                      <div key={c.id} className="flex items-center gap-2.5">
                        <img
                          src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=0B2140`}
                          alt={c.name}
                          className="w-8 h-8 rounded-full shrink-0 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{c.title}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-gray-800">${(c.negotiatedRate ?? c.rate).toLocaleString()}/mo</p>
                          {c.negotiatedRate && <p className="text-[9px] text-amber-600">Offered</p>}
                          <button onClick={() => toggleCart(c)} className="text-[10px] text-red-400 hover:text-red-600 transition">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Duration selector */}
                <div>
                  <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Contract Duration</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DURATION_OPTIONS.map(opt => (
                      <button
                        key={opt.months}
                        onClick={() => setDuration(opt.months)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                          duration === opt.months
                            ? 'bg-[#0B2140] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                        {opt.discount > 0 && (
                          <span className={`block text-[9px] mt-0.5 ${duration === opt.months ? 'text-blue-300' : 'text-green-600'}`}>
                            Save {opt.discount}%
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                {cart.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${monthlyTotal.toLocaleString()}/mo × {duration} mo</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {durationOpt.discount > 0 && (
                      <div className="flex justify-between text-xs text-green-600 font-medium">
                        <span>Multi-month discount ({durationOpt.discount}%)</span>
                        <span>−${discountAmt.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      ${Math.round(total / duration).toLocaleString()}/mo for {duration} month{duration > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <button
                  onClick={checkout}
                  disabled={cart.length === 0}
                  className="w-full py-3 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed bg-[#C9A02E] hover:bg-yellow-600 text-white"
                >
                  Checkout →
                </button>

                <p className="text-[10px] text-gray-400 text-center">
                  Team assembled within 24 hrs · Cancel anytime
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile floating cart */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
            <div className="bg-[#0B2140] rounded-2xl p-4 shadow-2xl flex items-center gap-4">
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{cart.length} AI Advisor{cart.length > 1 ? 's' : ''} selected</p>
                <p className="text-blue-300 text-xs">${monthlyTotal.toLocaleString()}/mo · {duration} mo contract</p>
              </div>
              <button
                onClick={checkout}
                className="bg-[#C9A02E] hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shrink-0"
              >
                Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
