import Link from 'next/link'
import AgencyLeadForm from '@/components/AgencyLeadForm'
import IndustriesSection from '@/components/IndustriesSection'
import HomeMobileNav from '@/components/HomeMobileNav'

// Font loaded via Google Fonts in layout.tsx — class defined in globals.css
const playfair = { className: 'font-playfair', variable: '' }

const SERVICES = [
  {
    num: '01',
    icon: '🏛️',
    title: 'Business Formation',
    subtitle: 'Start legal. Start right.',
    body: 'LLC, S-Corp, C-Corp, or Nonprofit filed in any U.S. state. EIN registration, operating agreements, registered agent, and compliance checklists — your legal foundation built right, the first time.',
    features: ['LLC · S-Corp · C-Corp · Nonprofit', 'EIN & operating agreement', 'All 50 states · docs delivered', 'Compliance checklist included'],
    detail: 'from $150 · one-time · all 50 states',
    cta: 'View Formation Services',
    href: '/formation',
    accent: '#0B2140',
    bg: 'rgba(11,33,64,0.04)',
  },
  {
    num: '02',
    icon: '🌐',
    title: 'Intelligent Websites',
    subtitle: 'Your 24/7 conversion engine.',
    body: 'AI-powered, mobile-first website built for your industry. Online booking, payments, and lead capture — all connected to your hub automatically. Smarter than a static site. It works while you sleep.',
    features: ['Custom pages for your industry', 'Online booking & payment collection', 'Lead capture → flows into hub', 'Domain + hosting included'],
    detail: '$800 build · then $149/mo hosting & support',
    cta: 'Book a Strategy Call',
    href: 'https://calendly.com/new56money/30min',
    accent: '#1D4ED8',
    bg: 'rgba(29,78,216,0.04)',
  },
  {
    num: '03',
    icon: '⚙️',
    title: 'Automated Business Hubs',
    subtitle: 'Your internal command center.',
    body: 'CRM, invoicing, automated outreach, social media, project tracking, and reporting — built around how your business actually operates. Replace five disconnected tools with one hub that runs itself.',
    features: ['CRM & lead pipeline', 'Invoice automation & client portal', 'Social media & content scheduling', 'Reporting & analytics dashboard'],
    detail: '$1,000 build · then $199/mo · or bundle for best value',
    cta: 'Open the Hub',
    href: '/hub',
    accent: '#C8902A',
    bg: 'rgba(200,144,42,0.05)',
  },
  {
    num: '04',
    icon: '🔄',
    title: 'IEBC Automated Workflow',
    subtitle: 'Your operations on autopilot.',
    body: 'We design and deploy automated workflows across every function of your business — invoices sent, follow-ups triggered, reports generated, receipts scanned and logged, tasks assigned. All without you lifting a finger.',
    features: ['AI receipt scanning & recordkeeping', 'Automated invoicing & follow-up sequences', 'Workflow triggers & task automation', 'QuickBooks & tax export ready'],
    detail: 'Included in every bundle · standalone from $19/mo',
    cta: 'Book a Strategy Call',
    href: 'https://calendly.com/new56money/30min',
    accent: '#059669',
    bg: 'rgba(5,150,105,0.04)',
  },
  {
    num: '05',
    icon: '🏗️',
    title: 'Intelligent Infrastructure',
    subtitle: 'The foundation your business runs on.',
    body: 'The technical and operational backbone of your IEBC system — 60 AI consultants embedded in your hub, custom integrations, API connections, and the data architecture that makes everything work together intelligently.',
    features: ['60 IEBC AI expert consultants', 'Custom API & system integrations', 'Business intelligence & reporting', 'Ongoing infrastructure & support'],
    detail: 'from $499/mo · consultants assembled within 24hrs',
    cta: 'Meet Your Team',
    href: '/hub/consultants',
    accent: '#7C3AED',
    bg: 'rgba(124,58,237,0.04)',
  },
]


const PLANS = [
  {
    name: 'Starter',
    setup: '$1,500',
    monthly: '$299/mo',
    consultants: 8,
    desc: 'Your business built and automated in 6 weeks.',
    features: [
      '8 IEBC AI consultants',
      'Business Formation assistance',
      'Intelligent Website (5-page)',
      'Automated Business Hub',
      'IEBC Automated Workflow setup',
      'Hosting + domain included',
      'Delivered in 6 weeks',
    ],
    highlight: false,
    cta: 'Get Started',
    ctaHref: 'https://calendly.com/new56money/30min',
  },
  {
    name: 'Growth',
    setup: '$3,500',
    monthly: '$499/mo',
    consultants: 25,
    desc: 'Full stack for serious, scaling businesses.',
    features: [
      '25 IEBC AI consultants',
      '10-page website + booking + payments',
      'Full Hub — CRM, invoicing, outreach',
      'Complete IEBC Automated Workflows',
      'Intelligent Infrastructure layer',
      '52-week roadmap & strategy sessions',
      'Priority build & dedicated manager',
    ],
    highlight: true,
    cta: 'Schedule a Call',
    ctaHref: 'https://calendly.com/new56money/30min',
  },
  {
    name: 'Pro',
    setup: '$6,500',
    monthly: '$799/mo',
    consultants: 60,
    desc: 'Full enterprise deployment. No limits.',
    features: [
      'All 60 IEBC AI consultants',
      'Unlimited pages + client login portal',
      'Every hub module — no limits',
      'Custom automations + API integrations',
      'Full Intelligent Infrastructure build',
      'Quarterly executive review',
      'SLA guarantee + priority support',
    ],
    highlight: false,
    cta: 'Book a Call',
    ctaHref: 'https://calendly.com/new56money/30min',
  },
]

export default function AgencyHomepage() {
  const year = new Date().getFullYear()

  return (
    <div className={`${playfair.variable} min-h-screen`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Navigation ── */}
      <nav
        className="sticky top-0 z-50"
        style={{ background: '#0B2140', borderBottom: '1px solid rgba(200,144,42,0.2)' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-md"
              style={{ background: '#C8902A' }}
            >
              <span className="text-white font-black text-[10px] tracking-tight">IEBC</span>
            </div>
            <div className="leading-tight">
              <p className="text-white font-bold text-sm leading-none">Integrated Efficiency</p>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: '#C8902A' }}>
                Business Consultants
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {[
              ['Services', '#services'],
              ['Industries', '#industries'],
              ['How It Works', '#how'],
              ['Pricing', '#pricing'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium transition-colors hover:text-[#C8902A]"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden md:block text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(200,144,42,0.5)', color: '#C8902A' }}
            >
              Client Portal
            </Link>
            <Link
              href="/auth/login?next=/hub/consultants"
              className="hidden md:block text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}
            >
              IEBC Consultants
            </Link>
            <Link
              href="/efficient"
              className="hidden md:inline-block px-5 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 shadow-md"
              style={{ background: '#C8902A', color: '#fff' }}
            >
              Get Efficient Accounting
            </Link>
            <HomeMobileNav />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative overflow-hidden" style={{ background: '#0B2140' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 60%, rgba(200,144,42,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(228,168,48,0.08) 0%, transparent 45%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(200,144,42,0.5), transparent)' }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 mb-8 text-xs font-bold uppercase tracking-[0.15em]"
            style={{
              border: '1px solid rgba(200,144,42,0.35)',
              color: '#C8902A',
              background: 'rgba(200,144,42,0.08)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C8902A' }} />
            Done For You · Delivered in 6 Weeks
          </div>

          <h1
            className={`${playfair.className} text-5xl md:text-7xl font-black leading-[1.05] mb-8`}
            style={{ color: '#fff' }}
          >
            Control.{' '}
            <span style={{ color: '#C8902A' }}>Grow.</span>
            <br />
            Be Efficient.
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-3 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            We build custom automated business systems — websites, operations hubs, and financial
            infrastructure — that put you back in control and help you grow.
          </p>
          <p className="text-base font-semibold mb-10" style={{ color: '#E4A830' }}>
            Delivered in 6 weeks. Built for your industry.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <a
              href="https://calendly.com/new56money/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="px-9 py-4 rounded-xl font-bold text-base transition-opacity hover:opacity-90 shadow-xl"
              style={{ background: '#C8902A', color: '#fff' }}
            >
              Book a Free Strategy Call
            </a>
            <a
              href="#services"
              className="px-9 py-4 rounded-xl font-bold text-base border transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
            >
              See Our Services
            </a>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/accounting/checkout?plan=silver"
              className="text-sm transition-colors hover:text-white/80"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Self-service SaaS from{' '}
              <span style={{ color: '#C8902A', textDecoration: 'underline' }}>$9/mo →</span>
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <Link
              href="/auth/login"
              className="text-sm transition-colors hover:text-white/80"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Already a client?{' '}
              <span style={{ color: '#C8902A', textDecoration: 'underline' }}>Log into portal →</span>
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(200,144,42,0.12)' }}>
          <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ['6 Weeks', 'average delivery'],
              ['60', 'AI consultants included'],
              ['5', 'integrated services'],
              ['7+', 'industries served'],
            ].map(([value, label], i) => (
              <div key={i}>
                <p className={`${playfair.className} text-3xl font-bold`} style={{ color: '#C8902A' }}>
                  {value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C8902A' }}>
              What We Build
            </p>
            <h2
              className={`${playfair.className} text-3xl md:text-4xl font-bold`}
              style={{ color: '#0B2140' }}
            >
              Five services. One integrated system.
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Every engagement includes all five services — custom-built for your business, delivered as
              one integrated system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div
                key={s.num}
                className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-transparent transition-all flex flex-col"
                style={{ borderTop: `3px solid ${s.accent}` }}
              >
                {/* Card top bar */}
                <div className="px-6 pt-6 pb-4" style={{ background: s.bg }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span
                      className="text-xs font-black tracking-widest uppercase"
                      style={{ color: s.accent }}
                    >
                      {s.num}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 flex flex-col flex-1 bg-white">
                  <h3
                    className={`${playfair.className} text-xl font-bold mb-0.5`}
                    style={{ color: '#0B2140' }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-xs font-semibold mb-3" style={{ color: s.accent }}>
                    {s.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{s.body}</p>

                  <ul className="grid grid-cols-2 gap-1.5 mb-5 flex-1">
                    {s.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="font-bold shrink-0 mt-0.5" style={{ color: s.accent }}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-gray-400 leading-tight">{s.detail}</p>
                    <a
                      href={s.href}
                      target={s.href.startsWith('http') ? '_blank' : undefined}
                      rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-lg transition-opacity hover:opacity-80 whitespace-nowrap"
                      style={{ background: s.accent, color: '#fff' }}
                    >
                      {s.cta}
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA card */}
            <div
              className="rounded-2xl p-7 flex flex-col items-center justify-center text-center"
              style={{ background: '#0B2140', borderTop: '3px solid #C8902A' }}
            >
              <p className={`${playfair.className} text-xl font-bold text-white mb-3`}>
                All 5 Services.
                <br />
                One Engagement.
              </p>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Every client gets the full stack — built, automated, and delivered in 6 weeks.
              </p>
              <div className="flex flex-col gap-2.5 w-full">
                <a
                  href="/accounting/checkout?plan=silver"
                  className="px-6 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 shadow-md text-center"
                  style={{ background: '#C8902A', color: '#fff' }}
                >
                  Get Efficient SaaS — from $9/mo
                </a>
                <a
                  href="https://calendly.com/new56money/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 text-center"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  Book Agency Call →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <IndustriesSection />

      {/* ── How It Works ── */}
      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C8902A' }}>
              Process
            </p>
            <h2
              className={`${playfair.className} text-3xl md:text-4xl font-bold`}
              style={{ color: '#0B2140' }}
            >
              From strategy call to live system in 6 weeks.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Strategy Call',
                body: 'We learn your business, goals, and current operations. You leave with a clear custom build plan and timeline.',
              },
              {
                step: '02',
                title: 'Custom Build',
                body: 'Our team builds your website, automation hub, and financial infrastructure — fully integrated with your brand.',
              },
              {
                step: '03',
                title: 'Launch & Automate',
                body: 'We launch your system, onboard your team, and hand off a business that runs on autopilot.',
              },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md"
                  style={{ background: '#0B2140' }}
                >
                  <span
                    className={`${playfair.className} text-2xl font-black`}
                    style={{ color: '#C8902A' }}
                  >
                    {s.step}
                  </span>
                </div>
                <h3
                  className={`${playfair.className} text-xl font-bold mb-2`}
                  style={{ color: '#0B2140' }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://calendly.com/new56money/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-opacity hover:opacity-90"
              style={{ background: '#C8902A', color: '#fff' }}
            >
              Book Your Strategy Call →
            </a>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 relative overflow-hidden" style={{ background: '#0B2140' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 80% 80%, rgba(200,144,42,0.1) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C8902A' }}>
              Investment
            </p>
            <h2
              className={`${playfair.className} text-3xl md:text-4xl font-bold text-white`}
            >
              Simple, transparent pricing.
            </h2>
            <p className="mt-4 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              One-time setup fee plus a monthly retainer. No surprises, no hidden costs,
              no long-term contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl p-7 flex flex-col"
                style={{
                  background: p.highlight ? '#fff' : 'rgba(255,255,255,0.05)',
                  border: p.highlight ? '2px solid #C8902A' : '1px solid rgba(255,255,255,0.1)',
                  color: p.highlight ? '#0B2140' : '#fff',
                }}
              >
                {p.highlight && (
                  <div className="text-center mb-4">
                    <span
                      className="text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full"
                      style={{ background: '#C8902A', color: '#fff' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className={`${playfair.className} text-2xl font-bold mb-1`}>{p.name}</h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: p.highlight ? '#666' : 'rgba(255,255,255,0.55)' }}
                >
                  {p.desc}
                </p>

                <div className="mb-1">
                  <span className={`${playfair.className} text-4xl font-black`}>{p.setup}</span>
                  <span
                    className="text-sm ml-1.5"
                    style={{ color: p.highlight ? '#999' : 'rgba(255,255,255,0.4)' }}
                  >
                    setup
                  </span>
                </div>
                <p className="text-sm font-semibold mb-2" style={{ color: '#C8902A' }}>
                  {p.monthly} retainer
                </p>
                <p
                  className="text-xs mb-6"
                  style={{ color: p.highlight ? '#888' : 'rgba(255,255,255,0.45)' }}
                >
                  {p.consultants} IEBC AI consultants included
                </p>

                <ul className="space-y-2.5 flex-1 mb-8">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <span className="font-bold shrink-0 mt-0.5" style={{ color: '#C8902A' }}>
                        ✓
                      </span>
                      <span
                        style={{ color: p.highlight ? '#333' : 'rgba(255,255,255,0.8)' }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={p.ctaHref}
                  target={p.ctaHref.startsWith('http') ? '_blank' : undefined}
                  rel={p.ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-center py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 block shadow-md"
                  style={{ background: '#C8902A', color: '#fff' }}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm mt-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Monthly retainers cover ongoing support, updates, hosting, and your AI consultant access.
            No long-term contracts.
          </p>
        </div>
      </section>

      {/* ── Contact / Lead Form ── */}
      <section id="contact" className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C8902A' }}>
              Get Started
            </p>
            <h2
              className={`${playfair.className} text-3xl md:text-4xl font-bold mb-3`}
              style={{ color: '#0B2140' }}
            >
              Tell us about your business.
            </h2>
            <p className="text-gray-500">
              We&apos;ll reach out within 24 hours to schedule your free strategy call.
            </p>
          </div>
          <AgencyLeadForm />
        </div>
      </section>

      {/* ── Platform Callout ── */}
      <section className="py-16 px-6" style={{ background: '#F8F6F1' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">
            Self-Service Option
          </p>
          <h3
            className={`${playfair.className} text-2xl font-bold mb-3`}
            style={{ color: '#0B2140' }}
          >
            Prefer to do it yourself?
          </h3>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Our self-service SaaS platform gives you access to Business Infrastructure, Automated Hub,
            and IEBC Consultants — starting at $9/mo. No setup fee, no contract.
          </p>
          <Link
            href="/accounting/checkout"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm border-2 transition-colors hover:bg-[#0B2140] hover:text-white"
            style={{ borderColor: '#0B2140', color: '#0B2140' }}
          >
            View SaaS Plans &amp; Pricing →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-14"
        style={{ background: '#0B2140', borderTop: '1px solid rgba(200,144,42,0.15)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-md"
                  style={{ background: '#C8902A' }}
                >
                  <span className="text-white font-black text-[10px]">IEBC</span>
                </div>
                <div className="leading-tight">
                  <p className="text-white font-bold text-sm leading-none">Integrated Efficiency</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#C8902A' }}>
                    Business Consultants
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Control. Grow. Be Efficient. — Custom automated business systems delivered in 6 weeks.
              </p>
            </div>

            {(
              [
                [
                  'Services',
                  [
                    ['Business Formation', '#services'],
                    ['Intelligent Websites', '#services'],
                    ['Automated Business Hubs', '#services'],
                    ['IEBC Automated Workflow', '#services'],
                    ['Intelligent Infrastructure', '#services'],
                  ],
                ],
                [
                  'Industries',
                  [
                    ['Logistics & Trucking', '#industries'],
                    ['Contractors & 1099', '#industries'],
                    ['Retail & Restaurant', '#industries'],
                    ['Nonprofit', '#industries'],
                    ['Sports & NIL', '#industries'],
                  ],
                ],
                [
                  'Company',
                  [
                    ['Book a Call', 'https://calendly.com/new56money/30min'],
                    ['Contact Us', '#contact'],
                    ['SaaS Platform', '/platform'],
                    ['Client Portal', '/auth/login'],
                    ['IEBC Consultants', '/auth/login?next=/hub/consultants'],
                    ['Create Account', '/auth/signup'],
                  ],
                ],
              ] as [string, [string, string][]][]
            ).map(([group, links]) => (
              <div key={group}>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: '#C8902A' }}
                >
                  {group}
                </p>
                <ul className="space-y-2.5">
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              © {year} Integrated Efficiency Business Consultants (IEBC). All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Secured by Supabase · Powered by IEBC Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
