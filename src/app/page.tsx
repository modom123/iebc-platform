import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Business Infrastructure', href: '/efficient' },
  { label: 'Business Automation', href: '/hub' },
  { label: 'Client Portal', href: '/portal' },
  { label: 'Pricing', href: '#pricing' },
]

const PRODUCTS = [
  {
    eyebrow: 'Business Infrastructure',
    headline: 'The financial backbone your business runs on.',
    body: 'Full-stack accounting, invoicing, payroll, reconciliation, tax center, and real-time cash flow — all automated. The infrastructure layer that keeps your business compliant, funded, and financially clear.',
    cta: { label: 'Explore Business Infrastructure', href: '/efficient' },
    accent: '#0F4C81',
    features: ['Invoicing & estimates', 'Bank reconciliation', 'Payroll & 1099s', 'Tax center', 'Cash flow forecasting', 'Client payment portal'],
  },
  {
    eyebrow: 'Business Automation',
    headline: 'Automate the work that runs your business.',
    body: 'AI consultants, lead pipeline, task management, team coordination, business formation, and document vault — all connected. Replace manual operations with automated workflows that scale without hiring.',
    cta: { label: 'Explore Business Automation', href: '/hub' },
    accent: '#C9A02E',
    features: ['60-consultant AI workforce', 'Lead pipeline & CRM', 'Task & project tracking', 'Team management', 'Business formation', 'Document vault'],
  },
]

const STATS = [
  { value: '22 hrs', label: 'saved per week, on average' },
  { value: '60', label: 'AI consultants on demand' },
  { value: '25+', label: 'infrastructure modules' },
  { value: '$9/mo', label: 'to get started' },
]

const WHY = [
  {
    icon: '🏗️',
    title: 'Infrastructure first',
    body: 'Every business needs a foundation — accounting, compliance, cash flow. IEBC builds that foundation for you and keeps it running automatically.',
  },
  {
    icon: '⚡',
    title: 'Automation at the core',
    body: 'From auto-categorizing transactions to routing AI consultant requests, IEBC automates the work that eats your time so you stay focused on growth.',
  },
  {
    icon: '🔒',
    title: 'Secure by default',
    body: 'Row-level security, encrypted client portals, and Stripe-powered billing. Your business data is protected at every layer.',
  },
  {
    icon: '📈',
    title: 'Scales with you',
    body: 'Start solo at $9/mo. Add users, unlock automation, and access the full platform as your business grows — no migration, no new tools.',
  },
]

const PLANS = [
  {
    id: 'silver',
    label: 'Silver',
    price: '$9',
    period: '/mo',
    desc: 'Business infrastructure for solo founders.',
    consultants: 0,
    users: 1,
    highlight: false,
    features: [
      'Core accounting dashboard',
      'Income & expense tracking',
      'Invoicing & estimates',
      'Transaction history',
      'Client payment portal',
      'Email support',
    ],
    link: '/accounting/checkout',
    cta: 'Start with Silver',
  },
  {
    id: 'gold',
    label: 'Gold',
    price: '$22',
    period: '/mo',
    desc: 'Infrastructure + automation for growing teams.',
    consultants: 3,
    users: 5,
    highlight: true,
    features: [
      'Everything in Silver',
      '3 IEBC AI consultants',
      'Up to 5 users',
      'Business automation hub',
      'Lead pipeline & CRM',
      'Bank reconciliation',
      'Priority support',
    ],
    link: '/accounting/checkout',
    cta: 'Start with Gold',
  },
  {
    id: 'platinum',
    label: 'Platinum',
    price: '$42',
    period: '/mo',
    desc: 'Full infrastructure & automation platform.',
    consultants: 5,
    users: 10,
    highlight: false,
    features: [
      'Everything in Gold',
      '5 IEBC AI consultants',
      'Up to 10 users',
      'Full infrastructure suite',
      'Business formation',
      'Full AI workforce dispatch',
      'Dedicated account manager',
    ],
    link: 'https://buy.stripe.com/bJe14h1aVeRj58CfrVgEg01',
    cta: 'Start with Platinum',
  },
]

const FOOTER_LINKS = {
  Platform: [
    { label: 'Business Infrastructure', href: '/efficient' },
    { label: 'Business Automation', href: '/hub' },
    { label: 'Client Portal', href: '/portal' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'About IEBC', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
  Account: [
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Create Account', href: '/auth/signup' },
    { label: 'Forgot Password', href: '/auth/forgot-password' },
  ],
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F4C81] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-base font-extrabold">I</span>
            </div>
            <div className="leading-tight">
              <span className="text-[#0F4C81] font-extrabold text-lg tracking-tight">IEBC</span>
              <span className="hidden md:block text-[10px] text-gray-400 font-medium tracking-wide -mt-0.5">Integrated Efficiency</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] transition">
              Sign In
            </Link>
            <Link href="/accounting/checkout" className="bg-[#C02020] hover:bg-[#A01818] text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative bg-gradient-to-br from-[#F0F5FF] via-white to-[#FFF8E8] overflow-hidden border-b border-gray-100">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0F4C81] opacity-5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-[#C9A02E] opacity-5 rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-[#0F4C81]/10 border border-[#0F4C81]/20 text-[#0F4C81] text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Integrated Efficiency
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-gray-900">
            Business{' '}
            <span className="text-[#0F4C81]">Infrastructure.</span>
            <br />
            Business{' '}
            <span className="text-[#C9A02E]">Automation.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The platform that builds and runs your business backbone —
            accounting, compliance, AI consultants, and operations.
            <br />
            <span className="text-gray-800 font-semibold">Stop managing your business. Start running it.</span>
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Link href="/accounting/checkout" className="bg-[#C02020] hover:bg-[#A01818] text-white px-8 py-3.5 rounded-xl font-bold text-base transition shadow-lg shadow-red-200">
              Get Started Free
            </Link>
            <Link href="/efficient" className="bg-white hover:bg-blue-50 border-2 border-[#0F4C81] text-[#0F4C81] px-8 py-3.5 rounded-xl font-bold text-base transition shadow-sm">
              Explore the Platform
            </Link>
          </div>

          <p className="text-sm text-gray-400">No contracts · Cancel anytime · Starts at $9/mo</p>
        </div>

        <div className="bg-[#0F4C81] border-t border-[#0F4C81]">
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-blue-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Products ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-[#C9A02E] uppercase tracking-widest mb-3">The Platform</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Two layers. One complete business.</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">Business Infrastructure handles your finances. Business Automation handles your operations. Together, they run your entire company.</p>
          </div>

          <div className="space-y-8">
            {PRODUCTS.map((product, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition grid md:grid-cols-2 bg-white"
              >
                <div className={`p-10 flex flex-col justify-center ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: product.accent }}>{product.eyebrow}</p>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">{product.headline}</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">{product.body}</p>
                  <ul className="grid grid-cols-2 gap-2 mb-8">
                    {product.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={product.cta.href}
                    className="self-start px-6 py-3 rounded-lg font-bold text-sm transition text-white shadow-md"
                    style={{ background: product.accent }}
                  >
                    {product.cta.label}
                  </Link>
                </div>

                <div
                  className={`min-h-[280px] flex items-center justify-center p-10 ${idx % 2 === 1 ? 'md:order-1' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${product.accent}12 0%, ${product.accent}04 100%)` }}
                >
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: product.accent }}>
                        <span className="text-white text-xs font-bold">IE</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{product.eyebrow}</p>
                        <p className="text-[10px] text-gray-400">Integrated Efficiency</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {product.features.slice(0, 4).map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-xs font-bold" style={{ color: product.accent }}>✓</span>
                          <span className="text-xs text-gray-600">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why IEBC ── */}
      <section className="py-20 px-6 bg-[#F5F7FA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#C9A02E] uppercase tracking-widest mb-3">Why Integrated Efficiency</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Built to run your business. Not just manage it.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY.map((w, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-[#0F4C81] transition">
                <div className="text-3xl mb-4">{w.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#C9A02E] uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Simple, transparent pricing.</h2>
            <p className="text-gray-500 mt-4">Infrastructure and automation, bundled in one plan. No hidden fees, no long-term contracts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map(p => (
              <div
                key={p.id}
                className={`rounded-2xl border flex flex-col transition relative bg-white ${
                  p.highlight
                    ? 'border-[#0F4C81] shadow-2xl shadow-blue-100 ring-2 ring-[#0F4C81]/20'
                    : 'border-gray-200 hover:border-[#0F4C81] hover:shadow-lg'
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#C9A02E] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mb-3 ${
                      p.id === 'silver' ? 'bg-slate-100 text-slate-600' :
                      p.id === 'gold' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-[#0F4C81] border border-blue-200'
                    }`}>{p.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
                      <span className="text-gray-400 text-sm">{p.period}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.consultants > 0 ? `${p.consultants} AI consultants · ` : ''}Up to {p.users} user{p.users > 1 ? 's' : ''}
                    </p>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-7">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={p.link}
                    className={`text-center py-3 rounded-xl font-bold text-sm transition block shadow-sm ${
                      p.highlight
                        ? 'bg-[#C02020] hover:bg-[#A01818] text-white shadow-red-200'
                        : 'bg-[#0F4C81] hover:bg-[#082D4F] text-white'
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            All plans billed monthly. Cancel anytime. Secure payments via Stripe.
          </p>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6 bg-[#0F4C81] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute -top-16 right-1/4 w-64 h-64 bg-[#C9A02E] opacity-10 rounded-full pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to build a better business?</h2>
          <p className="text-blue-200 mb-8 text-lg">Get the infrastructure and automation your business needs — in one platform, from day one.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/accounting/checkout" className="bg-[#C02020] hover:bg-[#A01818] text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg shadow-black/20">
              Start Today — From $9/mo
            </Link>
            <Link href="/auth/login" className="bg-white hover:bg-blue-50 text-[#0F4C81] px-8 py-3.5 rounded-xl font-bold transition shadow-md">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-200 px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#0F4C81] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-extrabold">I</span>
                </div>
                <span className="text-[#0F4C81] font-extrabold text-lg">IEBC</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                Integrated Efficiency — Business Infrastructure and Business Automation in one platform.
              </p>
            </div>

            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">{group}</p>
                <ul className="space-y-2.5">
                  {links.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-500 hover:text-[#0F4C81] transition">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Integrated Efficiency (IEBC). All rights reserved.</p>
            <p className="text-xs text-gray-400">Secured by Supabase · Payments by Stripe</p>
          </div>
        </div>
      </footer>

    </main>
  )
}
