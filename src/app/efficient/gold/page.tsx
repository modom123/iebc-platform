import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const GOLD = '#B8860B'
const GOLD_BRIGHT = '#C9A02E'
const GOLD_LIGHT = '#FFFBEB'
const GOLD_BORDER = '#FDE68A'
const GOLD_DARK = '#92650A'

const FEATURES = [
  {
    icon: '📊',
    name: 'Accounting Dashboard',
    desc: 'Real-time KPIs — revenue, expenses, net income, and outstanding invoices — all visible the moment you log in.',
  },
  {
    icon: '🧾',
    name: 'Invoicing & Estimates',
    desc: 'Create, send, and track invoices and estimates. Automated reminders keep clients paying on time.',
  },
  {
    icon: '💳',
    name: 'Income & Expense Tracking',
    desc: 'Log every transaction with one click. AI-powered categorization keeps your chart of accounts clean automatically.',
  },
  {
    icon: '👥',
    name: 'Customer & Vendor Management',
    desc: 'Full contact records with transaction history, outstanding balances, aging schedules, and 1099 vendor flags.',
  },
  {
    icon: '🌐',
    name: 'Client Payment Portal',
    desc: 'Shareable invoice links let clients pay by card or ACH instantly — no login required on their side.',
  },
  {
    icon: '🏦',
    name: 'Bank Reconciliation',
    desc: 'Connect your bank via Plaid and reconcile accounts in minutes. Spot discrepancies before they become problems.',
  },
  {
    icon: '📈',
    name: 'Reports & Dashboards',
    desc: 'P&L, Balance Sheet, Cash Flow Statement, and Aged Receivables — live, all in one place.',
  },
  {
    icon: '🔮',
    name: 'Cash Flow Forecast',
    desc: 'See 30/60/90-day projections based on your actual data. Know when cash is tight before it becomes a crisis.',
  },
  {
    icon: '🤖',
    name: 'AI Receipt Scanner',
    desc: 'Snap a receipt. Efficient extracts the vendor, amount, date, and category automatically. No manual entry.',
  },
  {
    icon: '📄',
    name: 'Bills & Payables',
    desc: 'Track every bill, schedule payments, and never miss a vendor due date again.',
  },
  {
    icon: '🔄',
    name: 'Recurring Transactions',
    desc: 'Set up subscriptions, retainers, rent, and any repeating transaction once — Efficient logs them automatically.',
  },
  {
    icon: '📐',
    name: 'Budgets & Automation Rules',
    desc: 'Set category budgets, track variance against actuals, and define rules that auto-categorize transactions.',
  },
  {
    icon: '🚗',
    name: 'Mileage & Time Tracker',
    desc: 'Log mileage and billable hours with GPS-aware tracking. Deductions calculated automatically at tax time.',
  },
  {
    icon: '🔍',
    name: 'Audit Trail',
    desc: 'Every change is timestamped and logged. Full history is always available — useful for accountants and audits.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Connect your bank',
    body: 'Link accounts via Plaid. Transactions flow in automatically and are categorized from day one.',
  },
  {
    n: '02',
    title: 'Send invoices, track bills',
    body: 'Create an invoice in 60 seconds. Stay on top of what you owe and what's owed to you.',
  },
  {
    n: '03',
    title: 'Close your books',
    body: 'Reconcile accounts, run your reports, and hand off clean books to your accountant.',
  },
]

export default function EfficientGoldPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-amber-100 shadow-sm px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/efficient" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD_DARK} 100%)` }}
            >
              <span className="text-white text-sm font-extrabold">E</span>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg tracking-tight" style={{ color: GOLD_DARK }}>Efficient</span>
              <span className="hidden md:block text-[10px] text-amber-500 font-medium tracking-wide -mt-0.5">Gold · Accounting</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">Features</Link>
            <Link href="#pricing" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">Pricing</Link>
            <Link href="/efficient" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">← All Plans</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-slate-500 hover:text-amber-700 transition">Sign In</Link>
            <Link
              href="/accounting/checkout?plan=gold"
              className="text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD_DARK} 100%)` }}
            >
              Start Free Trial
            </Link>
            <MobileNav
              links={[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: '← All Plans', href: '/efficient' },
              ]}
              cta={{ label: 'Start Free — $22/mo', href: '/accounting/checkout?plan=gold' }}
              loginHref="/auth/login"
              loginLabel="Sign In"
              brandSub="Gold · Accounting"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-amber-100" style={{ background: 'linear-gradient(135deg, #FFFDF0 0%, #FFFBEB 50%, #FEF3C7 100%)' }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: GOLD_BRIGHT }} />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: GOLD }} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase border"
            style={{ background: GOLD_LIGHT, borderColor: GOLD_BORDER, color: GOLD_DARK }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD_BRIGHT }} />
            Efficient Gold · Most Popular
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
            Professional accounting
            <br className="hidden sm:block" />
            <span style={{ color: GOLD_BRIGHT }}>for growing businesses.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Bank reconciliation, full reports, cash flow forecasting, and AI receipt scanning —
            <br />
            <span className="text-slate-700 font-semibold">everything you need to run a clean, growing business.</span>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-8">
            <Link
              href="/accounting/checkout?plan=gold"
              className="text-white px-8 py-3.5 rounded-xl font-bold text-base transition shadow-lg text-center"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD_DARK} 100%)` }}
            >
              Start 7-Day Free Trial — $22/mo
            </Link>
            <Link
              href="/efficient"
              className="bg-white border-2 px-8 py-3.5 rounded-xl font-bold text-base transition shadow-sm text-center"
              style={{ borderColor: GOLD_BORDER, color: GOLD_DARK }}
            >
              Compare All Plans
            </Link>
          </div>

          <p className="text-sm text-slate-400">No credit card required · Cancel anytime · Secure via Stripe</p>
        </div>

        {/* Stat bar */}
        <div style={{ background: `linear-gradient(90deg, ${GOLD_DARK} 0%, ${GOLD} 100%)` }}>
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              ['$22', 'per month'],
              ['Up to 3', 'users'],
              ['14 modules', 'full accounting'],
              ['Real-time', 'cash flow'],
            ].map(([val, label], i) => (
              <div key={i}>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs mt-0.5 text-amber-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD_BRIGHT }}>What's Included</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">A complete accounting suite for real businesses.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">14 accounting modules designed to cover every aspect of your financial operations — without the enterprise complexity.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 p-5 rounded-xl border bg-white transition hover:shadow-md hover:border-amber-300"
                style={{ borderColor: '#E5E7EB' }}
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
      <section className="py-20 px-6" style={{ background: GOLD_LIGHT }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD_BRIGHT }}>How It Works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Up and running in minutes.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-amber-100 p-7 hover:shadow-md hover:border-amber-300 transition">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold mb-5 shadow-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD_DARK} 100%)` }}
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
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD_BRIGHT }}>Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Everything. One price.</h2>

          <div className="relative rounded-2xl border-2 p-8 shadow-xl" style={{ borderColor: GOLD_BRIGHT }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span
                className="text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap"
                style={{ background: GOLD_BRIGHT }}
              >
                Most Popular
              </span>
            </div>

            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 text-white mt-2"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD_DARK} 100%)` }}
            >
              Gold Plan
            </span>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-extrabold text-slate-900">$22</span>
              <span className="text-slate-400 text-lg">/mo</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Billed monthly. Cancel anytime.</p>

            <ul className="space-y-3 text-left mb-8">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="font-bold mt-0.5 shrink-0" style={{ color: GOLD_BRIGHT }}>✓</span>
                  <span>{f.name}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0" style={{ color: GOLD_BRIGHT }}>✓</span>
                <span>Up to 3 user accounts</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0" style={{ color: GOLD_BRIGHT }}>✓</span>
                <span>Priority support</span>
              </li>
            </ul>

            <Link
              href="/accounting/checkout?plan=gold"
              className="block w-full text-center py-4 rounded-xl font-bold text-base text-white transition shadow-md"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD_DARK} 100%)` }}
            >
              Start 7-Day Free Trial
            </Link>
            <p className="text-xs text-slate-400 mt-3">No charge until day 8 · Secure checkout via Stripe</p>
          </div>

          {/* Upgrade nudge */}
          <div className="mt-8 p-5 rounded-xl border bg-blue-50 border-blue-200 text-left">
            <p className="text-sm font-bold text-blue-800 mb-1">Need the complete suite?</p>
            <p className="text-xs text-blue-700 mb-3">
              Efficient Platinum adds payroll, tax center, 1099s, inventory, purchase orders, and projects & job costing — for $42/mo.
            </p>
            <Link href="/efficient/platinum" className="text-xs font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2">
              See Efficient Platinum →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6 text-white text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${GOLD_DARK} 0%, ${GOLD} 100%)` }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute -top-12 right-1/3 w-56 h-56 rounded-full opacity-10 pointer-events-none" style={{ background: '#fff' }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Your books won't keep themselves.</h2>
          <p className="mb-8 text-base sm:text-lg text-amber-200">
            Start with a 7-day free trial. No credit card. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link
              href="/accounting/checkout?plan=gold"
              className="text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg text-center border-2 border-white/30"
              style={{ background: GOLD_DARK }}
            >
              Get Efficient Gold — $22/mo
            </Link>
            <Link
              href="/efficient"
              className="bg-white px-8 py-3.5 rounded-xl font-bold transition shadow-md text-center"
              style={{ color: GOLD_DARK }}
            >
              Compare All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-50 border-t border-amber-100 px-6 py-10 text-center">
        <Link href="/efficient" className="flex items-center gap-2 justify-center mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD_DARK} 100%)` }}
          >
            <span className="text-white text-xs font-extrabold">E</span>
          </div>
          <span className="font-extrabold" style={{ color: GOLD_DARK }}>Efficient Gold</span>
        </Link>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Efficient by IEBC. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs text-slate-400">
          <Link href="/efficient" className="hover:text-amber-700 transition">All Plans</Link>
          <Link href="/efficient/silver" className="hover:text-amber-700 transition">Silver</Link>
          <Link href="/efficient/platinum" className="hover:text-amber-700 transition">Platinum</Link>
          <Link href="/auth/login" className="hover:text-amber-700 transition">Sign In</Link>
          <Link href="/terms" className="hover:text-amber-700 transition">Terms</Link>
        </div>
      </footer>

    </main>
  )
}
