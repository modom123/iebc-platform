import Link from 'next/link'

const services = [
  {
    icon: '🏛️',
    title: 'Business Formation',
    desc: 'LLC, S-Corp, C-Corp setup, EIN registration, operating agreements, and registered agent services — done for you.',
  },
  {
    icon: '📊',
    title: 'Efficient Accounting',
    desc: 'Real-time income & expense tracking, invoicing, financial summaries, and cash flow visibility in one dashboard.',
  },
  {
    icon: '🤖',
    title: '60-Consultant AI Workforce',
    desc: 'A team of 60 specialized consultants across departments — routed to your business automatically based on your needs.',
  },
  {
    icon: '🔥',
    title: 'Lead Pipeline & CRM',
    desc: 'Track hot leads, manage your pipeline, and convert prospects into clients with built-in pipeline management.',
  },
  {
    icon: '📋',
    title: 'Task & Project Hub',
    desc: 'Centralized Master Hub for tracking active builds, tasks due, and team assignments across your entire operation.',
  },
  {
    icon: '💳',
    title: 'Subscription Billing',
    desc: 'Transparent monthly plans with Stripe-powered secure billing. Upgrade or cancel anytime with no hidden fees.',
  },
]

const plans = [
  {
    id: 'silver',
    label: 'Silver',
    price: '$9',
    period: '/mo',
    consultants: 0,
    users: 1,
    highlight: false,
    features: ['Core accounting dashboard', 'Income & expense tracking', 'Transaction history', 'Email support'],
    link: '/accounting/checkout',
  },
  {
    id: 'gold',
    label: 'Gold',
    price: '$22',
    period: '/mo',
    consultants: 3,
    users: 5,
    highlight: true,
    features: ['Everything in Silver', '3 IEBC consultants', 'Up to 5 users', 'Invoice generation', 'Lead pipeline', 'Priority support'],
    link: '/accounting/checkout',
  },
  {
    id: 'platinum',
    label: 'Platinum',
    price: '$42',
    period: '/mo',
    consultants: 5,
    users: 10,
    highlight: false,
    features: ['Everything in Gold', '5 IEBC consultants', 'Up to 10 users', 'Full accounting suite', 'Business formation', 'AI workforce dispatch', 'Dedicated account manager'],
    link: 'https://buy.stripe.com/bJe14h1aVeRj58CfrVgEg01',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-[#0F4C81]">IEBC</span>
        <div className="flex gap-4 text-sm items-center">
          <Link href="/hub" className="hover:text-[#0F4C81] hidden md:block">Master Hub</Link>
          <Link href="/accounting" className="hover:text-[#0F4C81] hidden md:block">Accounting</Link>
          <Link href="#pricing" className="hover:text-[#0F4C81] hidden md:block">Pricing</Link>
          <Link href="/accounting/checkout" className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#082D4F]">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-24 px-6 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="inline-block bg-blue-50 text-[#0F4C81] text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          Integrated Efficiency Business Consultants
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Stop Working <span className="text-[#0F4C81]">In</span> Your Business.<br />
          Start Working <span className="text-[#0F4C81]">On</span> It.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Formation · Accounting · 60 Consultants · AI Workforce.<br />
          <span className="font-semibold text-slate-800">Avg. 22 hrs saved per week.</span>
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/accounting/checkout" className="btn-primary text-base">
            🚀 Get Started
          </Link>
          <Link href="/accounting" className="btn-secondary text-base">
            View Dashboard
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-400">No contracts · Cancel anytime · Starts at $9/mo</p>
      </header>

      {/* Services */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F4C81]">Everything Your Business Needs</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">One platform. Formation to growth — built for operators who move fast.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={i} className="p-6 border border-gray-200 rounded-xl hover:border-[#0F4C81] hover:shadow-md transition">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-[#0F4C81] text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['22 hrs', 'Saved per week'], ['60', 'Consultants on demand'], ['$10M', 'MRR target'], ['3 tiers', 'Starting at $9/mo']].map(([val, label], i) => (
            <div key={i}>
              <p className="text-3xl font-extrabold">{val}</p>
              <p className="text-sm text-blue-200 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F4C81]">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 mt-3">Choose the plan that fits your business. Upgrade as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {plans.map(p => (
              <div
                key={p.id}
                className={`bg-white rounded-xl border flex flex-col transition ${
                  p.highlight ? 'border-[#0F4C81] shadow-xl scale-105' : 'border-gray-200 hover:border-[#0F4C81] hover:shadow-md'
                }`}
              >
                {p.highlight && (
                  <div className="bg-[#0F4C81] text-white text-xs font-bold text-center py-1.5 rounded-t-xl tracking-widest uppercase">
                    Most Popular
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold">{p.label}</h3>
                  <div className="mt-3 mb-1">
                    <span className="text-4xl font-extrabold text-[#0F4C81]">{p.price}</span>
                    <span className="text-gray-500 text-sm">{p.period}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    {p.consultants > 0 ? `${p.consultants} consultants · ` : ''}Up to {p.users} user{p.users > 1 ? 's' : ''}
                  </p>
                  <ul className="space-y-2 flex-1 mb-6">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={p.link}
                    className={`text-center py-3 rounded-lg font-semibold transition text-sm block ${
                      p.highlight
                        ? 'bg-[#0F4C81] text-white hover:bg-[#082D4F]'
                        : 'border-2 border-[#0F4C81] text-[#0F4C81] hover:bg-blue-50'
                    }`}
                  >
                    Get {p.label}
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

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-2xl font-bold text-[#0F4C81] mb-3">Ready to build a better business?</h2>
        <p className="text-gray-500 mb-6">Join IEBC and get your formation, accounting, and consultant team in one place.</p>
        <Link href="/accounting/checkout" className="btn-primary">
          Start Today — From $9/mo
        </Link>
      </section>

    </main>
  )
}
