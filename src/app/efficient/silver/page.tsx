import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const SILVER = '#64748B'
const SILVER_LIGHT = '#F1F5F9'
const SILVER_BORDER = '#CBD5E1'
const SILVER_DARK = '#475569'

const FEATURES = [
  {
    icon: '📊',
    name: 'Accounting Dashboard',
    desc: 'Real-time snapshot of your income, expenses, and net balance. Know your numbers at a glance every morning.',
  },
  {
    icon: '🧾',
    name: 'Invoicing & Estimates',
    desc: 'Create professional invoices and estimates in under 60 seconds. Send directly from Efficient and get paid online.',
  },
  {
    icon: '💳',
    name: 'Income & Expense Tracking',
    desc: 'Log every dollar in and out. Categorize transactions with one click and keep your books clean year-round.',
  },
  {
    icon: '👥',
    name: 'Customer Management',
    desc: 'Full contact records for every client — with invoice history, outstanding balances, and aging at a glance.',
  },
  {
    icon: '🌐',
    name: 'Client Payment Portal',
    desc: 'Give clients a secure link to view invoices and pay online — card or ACH — no account required on their end.',
  },
  {
    icon: '📄',
    name: 'Basic P&L Report',
    desc: 'One-click profit & loss report. See exactly what you made, what you spent, and what\'s left — any date range.',
  },
  {
    icon: '📤',
    name: 'CSV Export',
    desc: 'Export your transactions, invoices, or reports as CSV anytime. Hand off to your accountant with zero friction.',
  },
  {
    icon: '🔔',
    name: 'Invoice Reminders',
    desc: 'Automated payment reminders sent to clients on your schedule — so you stop chasing invoices manually.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Create your account',
    body: 'Sign up in 2 minutes. No credit card required for your 7-day trial.',
  },
  {
    n: '02',
    title: 'Send your first invoice',
    body: 'Enter your client, add line items, hit send. You\'ll be paid faster than you\'ve ever been.',
  },
  {
    n: '03',
    title: 'Track every dollar',
    body: 'Log income and expenses as they happen. Your P&L is always live, always accurate.',
  },
]

export default function EfficientSilverPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/efficient" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md" style={{ background: SILVER }}>
              <span className="text-white text-sm font-extrabold">E</span>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg tracking-tight" style={{ color: SILVER_DARK }}>Efficient</span>
              <span className="hidden md:block text-[10px] text-slate-400 font-medium tracking-wide -mt-0.5">Silver · Accounting</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition">Features</Link>
            <Link href="#pricing" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition">Pricing</Link>
            <Link href="/efficient" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition">← All Plans</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">Sign In</Link>
            <Link
              href="/accounting/checkout?plan=silver"
              className="text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm"
              style={{ background: SILVER, hover: SILVER_DARK }}
            >
              Start Free Trial
            </Link>
            <MobileNav
              links={[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: '← All Plans', href: '/efficient' },
              ]}
              cta={{ label: 'Start Free — $9/mo', href: '/accounting/checkout?plan=silver' }}
              loginHref="/auth/login"
              loginLabel="Sign In"
              brandSub="Silver · Accounting"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)' }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: SILVER }} />
        <div className="absolute bottom-0 -left-12 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: SILVER_DARK }} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase border"
            style={{ background: '#F1F5F9', borderColor: SILVER_BORDER, color: SILVER_DARK }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: SILVER }} />
            Efficient Silver
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
            Simple accounting
            <br className="hidden sm:block" />
            <span style={{ color: SILVER }}>for the way you work.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Invoicing, expense tracking, and a live P&amp;L — all in one clean dashboard.
            <br />
            <span className="text-slate-700 font-semibold">The essentials. Nothing you don't need.</span>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-8">
            <Link
              href="/accounting/checkout?plan=silver"
              className="text-white px-8 py-3.5 rounded-xl font-bold text-base transition shadow-lg text-center"
              style={{ background: SILVER }}
            >
              Start 7-Day Free Trial — $9/mo
            </Link>
            <Link
              href="/efficient"
              className="bg-white border-2 px-8 py-3.5 rounded-xl font-bold text-base transition shadow-sm text-center"
              style={{ borderColor: SILVER_BORDER, color: SILVER_DARK }}
            >
              Compare All Plans
            </Link>
          </div>

          <p className="text-sm text-slate-400">No credit card required · Cancel anytime · Secure via Stripe</p>
        </div>

        {/* Stat bar */}
        <div style={{ background: SILVER }}>
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              ['$9', 'per month'],
              ['1 user', 'included'],
              ['8 modules', 'core accounting'],
              ['60 sec', 'to first invoice'],
            ].map(([val, label], i) => (
              <div key={i}>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs mt-0.5" style={{ color: '#CBD5E1' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: SILVER }}>What's Included</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Everything you need to run your books.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Silver gives you the core accounting tools that every business needs — without overwhelming complexity.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 p-5 rounded-xl border bg-white transition hover:shadow-md"
                style={{ borderColor: SILVER_BORDER }}
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6" style={{ background: SILVER_LIGHT }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: SILVER }}>How It Works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Up and running in minutes.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border p-7 hover:shadow-md transition" style={{ borderColor: SILVER_BORDER }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold mb-5 shadow-sm text-white"
                  style={{ background: SILVER }}
                >
                  {s.n}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: SILVER }}>Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Simple, flat pricing.</h2>

          <div className="rounded-2xl border-2 p-8 shadow-lg" style={{ borderColor: SILVER }}>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 text-white"
              style={{ background: SILVER }}
            >
              Silver Plan
            </span>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-extrabold text-slate-900">$9</span>
              <span className="text-slate-400 text-lg">/mo</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Billed monthly. Cancel anytime.</p>

            <ul className="space-y-3 text-left mb-8">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="font-bold mt-0.5 shrink-0" style={{ color: SILVER }}>✓</span>
                  <span>{f.name}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0" style={{ color: SILVER }}>✓</span>
                <span>1 user account</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0" style={{ color: SILVER }}>✓</span>
                <span>Email support</span>
              </li>
            </ul>

            <Link
              href="/accounting/checkout?plan=silver"
              className="block w-full text-center py-4 rounded-xl font-bold text-base text-white transition shadow-md"
              style={{ background: SILVER }}
            >
              Start 7-Day Free Trial
            </Link>
            <p className="text-xs text-slate-400 mt-3">No charge until day 8 · Secure checkout via Stripe</p>
          </div>

          {/* Upgrade nudge */}
          <div className="mt-8 p-5 rounded-xl border bg-amber-50 border-amber-200 text-left">
            <p className="text-sm font-bold text-amber-800 mb-1">Need more power?</p>
            <p className="text-xs text-amber-700 mb-3">
              Efficient Gold adds bank reconciliation, full reports, cash flow forecasting, AI receipt scanning, and more — for only $22/mo.
            </p>
            <Link href="/efficient/gold" className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2">
              See Efficient Gold →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-white text-center relative overflow-hidden" style={{ background: SILVER_DARK }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Start tracking your money today.</h2>
          <p className="mb-8 text-base sm:text-lg" style={{ color: '#CBD5E1' }}>
            7-day free trial. No credit card. Set up in minutes.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link
              href="/accounting/checkout?plan=silver"
              className="text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg text-center"
              style={{ background: SILVER }}
            >
              Get Efficient Silver — $9/mo
            </Link>
            <Link
              href="/efficient"
              className="bg-white px-8 py-3.5 rounded-xl font-bold transition shadow-md text-center"
              style={{ color: SILVER_DARK }}
            >
              Compare All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 px-6 py-10 text-center">
        <Link href="/efficient" className="flex items-center gap-2 justify-center mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: SILVER }}>
            <span className="text-white text-xs font-extrabold">E</span>
          </div>
          <span className="font-extrabold" style={{ color: SILVER_DARK }}>Efficient Silver</span>
        </Link>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Efficient by IEBC. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs text-slate-400">
          <Link href="/efficient" className="hover:text-slate-600 transition">All Plans</Link>
          <Link href="/efficient/gold" className="hover:text-slate-600 transition">Gold</Link>
          <Link href="/efficient/platinum" className="hover:text-slate-600 transition">Platinum</Link>
          <Link href="/auth/login" className="hover:text-slate-600 transition">Sign In</Link>
          <Link href="/terms" className="hover:text-slate-600 transition">Terms</Link>
        </div>
      </footer>

    </main>
  )
}
