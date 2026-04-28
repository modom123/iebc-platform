import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const PLAT_NAVY = '#0B2140'
const PLAT_BLUE = '#0F4C81'
const PLAT_SILVER = '#8B9EB7'
const PLAT_LIGHT = '#EEF4FB'
const PLAT_ACCENT = '#C0C8D4'

const FEATURES = [
  {
    icon: '📊',
    name: 'Accounting Dashboard',
    desc: 'Executive-grade KPI overview — revenue, margins, payroll liability, tax position, and cash runway — all in one view.',
  },
  {
    icon: '🧾',
    name: 'Invoicing & Estimates',
    desc: 'Create, send, and track invoices and estimates. Automated reminders and a branded client payment portal included.',
  },
  {
    icon: '💳',
    name: 'Income & Expense Tracking',
    desc: 'Log every transaction with AI-powered categorization. Linked directly to your chart of accounts.',
  },
  {
    icon: '👥',
    name: 'Customer & Vendor Management',
    desc: 'Full CRM-lite records — history, balances, aging, 1099 vendor status — for every client and supplier.',
  },
  {
    icon: '🌐',
    name: 'Client Payment Portal',
    desc: 'Shareable invoice links. Clients pay by card or ACH instantly — no account required.',
  },
  {
    icon: '🏦',
    name: 'Bank Reconciliation',
    desc: 'Plaid-powered bank sync and one-click reconciliation. Discrepancies surface automatically.',
  },
  {
    icon: '📈',
    name: 'Reports & Dashboards',
    desc: 'P&L, Balance Sheet, Cash Flow Statement, Aged Receivables — real-time, any date range.',
  },
  {
    icon: '🔮',
    name: 'Cash Flow Forecast',
    desc: '30/60/90-day projections based on your actuals. Never be surprised by a cash crunch again.',
  },
  {
    icon: '🤖',
    name: 'AI Receipt Scanner',
    desc: 'Photograph any receipt. Efficient extracts vendor, amount, date, and category automatically.',
  },
  {
    icon: '📄',
    name: 'Bills & Payables',
    desc: 'Full payables management — bill entry, due-date tracking, and payment scheduling in one place.',
  },
  {
    icon: '🔄',
    name: 'Recurring Transactions',
    desc: 'Automate any repeating income or expense. Set once, Efficient handles the rest.',
  },
  {
    icon: '📐',
    name: 'Budgets & Automation Rules',
    desc: 'Budget by category, track variance, and define auto-categorization rules for any transaction pattern.',
  },
  {
    icon: '🚗',
    name: 'Mileage & Time Tracker',
    desc: 'GPS-aware mileage logging and billable hour tracking with automatic IRS deduction calculations.',
  },
  {
    icon: '📋',
    name: 'Chart of Accounts',
    desc: 'Fully customizable chart of accounts with double-entry journal entry support and GAAP-ready structure.',
  },
  {
    icon: '💰',
    name: 'Payroll Management',
    desc: 'Run payroll for your team with tax calculations, deductions, and pay stubs handled automatically.',
  },
  {
    icon: '🧮',
    name: 'Tax Center & 1099s',
    desc: 'Quarterly estimated tax calculations, 1099-NEC generation for contractors, and year-end tax prep exports.',
  },
  {
    icon: '📦',
    name: 'Inventory Management',
    desc: 'Track SKUs, stock levels, COGS, and reorder points. Know what you have and what it\'s worth at all times.',
  },
  {
    icon: '🛒',
    name: 'Purchase Orders',
    desc: 'Create and manage POs linked to vendor records and bills. Full approval tracking and receiving workflow.',
  },
  {
    icon: '🏗️',
    name: 'Projects & Job Costing',
    desc: 'Assign income and expenses to specific projects. See exactly which jobs are profitable — and which aren\'t.',
  },
  {
    icon: '📒',
    name: 'Journal Entries',
    desc: 'Full double-entry general journal with debit/credit posting, adjusting entries, and period close support.',
  },
  {
    icon: '🔍',
    name: 'Audit Trail',
    desc: 'Every change timestamped and logged by user. Complete, immutable history for compliance and review.',
  },
  {
    icon: '📤',
    name: 'CSV & Accountant Export',
    desc: 'Export any report or dataset to CSV in one click. Full accountant handoff package available any time.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Connect everything',
    body: 'Link your bank, payroll, and existing systems. Efficient pulls it all together into a single source of truth.',
  },
  {
    n: '02',
    title: 'Run your full operation',
    body: 'Invoice clients, pay vendors, run payroll, track inventory, and manage projects — all from one dashboard.',
  },
  {
    n: '03',
    title: 'Close fast, stay compliant',
    body: 'Reconcile, generate 1099s, calculate quarterly taxes, and produce audit-ready reports on demand.',
  },
]

export default function EfficientPlatinumPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-0" style={{ borderColor: PLAT_ACCENT }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/efficient" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: `linear-gradient(135deg, ${PLAT_BLUE} 0%, ${PLAT_NAVY} 100%)` }}
            >
              <span className="text-white text-sm font-extrabold">E</span>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg tracking-tight" style={{ color: PLAT_NAVY }}>Efficient</span>
              <span className="hidden md:block text-[10px] font-medium tracking-wide -mt-0.5" style={{ color: PLAT_SILVER }}>Platinum · Accounting</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Features</Link>
            <Link href="#pricing" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Pricing</Link>
            <Link href="/efficient" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">← All Plans</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0F4C81] transition">Sign In</Link>
            <Link
              href="/accounting/checkout?plan=platinum"
              className="text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm"
              style={{ background: `linear-gradient(135deg, ${PLAT_BLUE} 0%, ${PLAT_NAVY} 100%)` }}
            >
              Start Free Trial
            </Link>
            <MobileNav
              links={[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: '← All Plans', href: '/efficient' },
              ]}
              cta={{ label: 'Start Free — $42/mo', href: '/accounting/checkout?plan=platinum' }}
              loginHref="/auth/login"
              loginLabel="Sign In"
              brandSub="Platinum · Accounting"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden border-b" style={{ borderColor: PLAT_ACCENT, background: `linear-gradient(135deg, ${PLAT_LIGHT} 0%, #F0F6FF 50%, #E8F0FA 100%)` }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: PLAT_BLUE }} />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: PLAT_SILVER }} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase border"
            style={{ background: PLAT_LIGHT, borderColor: PLAT_ACCENT, color: PLAT_NAVY }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: PLAT_SILVER }} />
            Efficient Platinum · Complete Suite
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
            The complete accounting suite.
            <br className="hidden sm:block" />
            <span style={{ color: PLAT_BLUE }}>Nothing held back.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            All 22 accounting modules — payroll, tax, inventory, projects, and journal entries —
            <br />
            <span className="text-slate-700 font-semibold">built for businesses that need the full picture.</span>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-8">
            <Link
              href="/accounting/checkout?plan=platinum"
              className="text-white px-8 py-3.5 rounded-xl font-bold text-base transition shadow-lg text-center"
              style={{ background: `linear-gradient(135deg, ${PLAT_BLUE} 0%, ${PLAT_NAVY} 100%)` }}
            >
              Start 7-Day Free Trial — $42/mo
            </Link>
            <Link
              href="/efficient"
              className="bg-white border-2 px-8 py-3.5 rounded-xl font-bold text-base transition shadow-sm text-center"
              style={{ borderColor: PLAT_ACCENT, color: PLAT_NAVY }}
            >
              Compare All Plans
            </Link>
          </div>

          <p className="text-sm text-slate-400">No credit card required · Cancel anytime · Secure via Stripe</p>
        </div>

        {/* Stat bar */}
        <div style={{ background: `linear-gradient(90deg, ${PLAT_NAVY} 0%, ${PLAT_BLUE} 100%)` }}>
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              ['$42', 'per month'],
              ['Up to 10', 'users'],
              ['22 modules', 'complete suite'],
              ['Payroll + Tax', 'fully included'],
            ].map(([val, label], i) => (
              <div key={i}>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs mt-0.5" style={{ color: PLAT_ACCENT }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: PLAT_BLUE }}>Full 22-Module Suite</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Every accounting module. Every feature. One plan.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Platinum includes the entire Efficient platform — from basic invoicing all the way through payroll, tax filing, and full double-entry accounting.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 p-5 rounded-xl border bg-white transition hover:shadow-md"
                style={{ borderColor: '#E2E8F0' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = PLAT_BLUE)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
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
      <section className="py-20 px-6" style={{ background: PLAT_LIGHT }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: PLAT_BLUE }}>How It Works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Set up once. Run forever.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border p-7 hover:shadow-md transition"
                style={{ borderColor: PLAT_ACCENT }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold mb-5 shadow-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${PLAT_BLUE} 0%, ${PLAT_NAVY} 100%)` }}
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
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: PLAT_BLUE }}>Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">The complete suite. One flat price.</h2>

          <div
            className="rounded-2xl border-2 p-8 shadow-xl"
            style={{ borderColor: PLAT_BLUE, boxShadow: `0 8px 48px rgba(15,76,129,0.12)` }}
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 text-white"
              style={{ background: `linear-gradient(135deg, ${PLAT_BLUE} 0%, ${PLAT_NAVY} 100%)` }}
            >
              Platinum Plan
            </span>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-extrabold text-slate-900">$42</span>
              <span className="text-slate-400 text-lg">/mo</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Billed monthly. Cancel anytime.</p>

            <ul className="space-y-3 text-left mb-8">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="font-bold mt-0.5 shrink-0" style={{ color: PLAT_BLUE }}>✓</span>
                  <span>{f.name}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0" style={{ color: PLAT_BLUE }}>✓</span>
                <span>Up to 10 user accounts</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0" style={{ color: PLAT_BLUE }}>✓</span>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0" style={{ color: PLAT_BLUE }}>✓</span>
                <span>Priority support</span>
              </li>
            </ul>

            <Link
              href="/accounting/checkout?plan=platinum"
              className="block w-full text-center py-4 rounded-xl font-bold text-base text-white transition shadow-md"
              style={{ background: `linear-gradient(135deg, ${PLAT_BLUE} 0%, ${PLAT_NAVY} 100%)` }}
            >
              Start 7-Day Free Trial
            </Link>
            <p className="text-xs text-slate-400 mt-3">No charge until day 8 · Secure checkout via Stripe</p>
          </div>

          {/* Downgrade nudge */}
          <div className="mt-8 p-5 rounded-xl border bg-amber-50 border-amber-200 text-left">
            <p className="text-sm font-bold text-amber-800 mb-1">Not quite ready for the full suite?</p>
            <p className="text-xs text-amber-700 mb-3">
              Efficient Gold covers bank reconciliation, full reports, AI receipt scanning, and cash flow forecasting for just $22/mo.
            </p>
            <Link href="/efficient/gold" className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2">
              See Efficient Gold →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6 text-white text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${PLAT_NAVY} 0%, ${PLAT_BLUE} 100%)` }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute -top-12 right-1/3 w-56 h-56 rounded-full opacity-10 pointer-events-none" style={{ background: PLAT_SILVER }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Run your complete financial operation.</h2>
          <p className="mb-8 text-base sm:text-lg" style={{ color: PLAT_ACCENT }}>
            22 modules. One dashboard. 7-day free trial.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link
              href="/accounting/checkout?plan=platinum"
              className="text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg text-center border-2 border-white/20"
              style={{ background: PLAT_NAVY }}
            >
              Get Efficient Platinum — $42/mo
            </Link>
            <Link
              href="/efficient"
              className="bg-white px-8 py-3.5 rounded-xl font-bold transition shadow-md text-center"
              style={{ color: PLAT_NAVY }}
            >
              Compare All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-10 text-center" style={{ background: PLAT_LIGHT, borderColor: PLAT_ACCENT }}>
        <Link href="/efficient" className="flex items-center gap-2 justify-center mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: `linear-gradient(135deg, ${PLAT_BLUE} 0%, ${PLAT_NAVY} 100%)` }}
          >
            <span className="text-white text-xs font-extrabold">E</span>
          </div>
          <span className="font-extrabold" style={{ color: PLAT_NAVY }}>Efficient Platinum</span>
        </Link>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Efficient by IEBC. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs text-slate-400">
          <Link href="/efficient" className="hover:text-[#0F4C81] transition">All Plans</Link>
          <Link href="/efficient/silver" className="hover:text-[#0F4C81] transition">Silver</Link>
          <Link href="/efficient/gold" className="hover:text-[#0F4C81] transition">Gold</Link>
          <Link href="/auth/login" className="hover:text-[#0F4C81] transition">Sign In</Link>
          <Link href="/terms" className="hover:text-[#0F4C81] transition">Terms</Link>
        </div>
      </footer>

    </main>
  )
}
