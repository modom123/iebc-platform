import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const FEATURES = [
  {
    icon: '🏦',
    name: 'Connected Accounts',
    desc: 'Bank accounts, credit cards, and investments — all linked via Plaid. Transactions sync automatically.',
  },
  {
    icon: '🧾',
    name: 'Invoicing & Estimates',
    desc: 'Create professional invoices and estimates in 60 seconds. Send directly from Efficient and collect payment online.',
  },
  {
    icon: '◯',
    name: 'Customer Management',
    desc: 'Full client records with invoice history, outstanding balances, aging schedules, and a branded payment portal.',
  },
  {
    icon: '▥',
    name: 'Bills & Payables',
    desc: 'Track every vendor bill, set due dates, and never miss a payment. Full payables dashboard included.',
  },
  {
    icon: '⬡',
    name: 'Vendors & 1099 Tracking',
    desc: 'Manage all your vendors and flag 1099-eligible contractors automatically. Year-end prep is one click.',
  },
  {
    icon: '⇌',
    name: 'Bank Reconciliation',
    desc: 'Match your books to your bank statements with one-click reconciliation. Discrepancies surface automatically.',
  },
  {
    icon: '▦',
    name: 'P&L, Balance Sheet & Cash Flow',
    desc: 'Real business reports — profit & loss, balance sheet, and cash flow statement — live, any date range.',
  },
  {
    icon: '🔮',
    name: 'Cash Flow Forecast',
    desc: '30/60/90-day cash projections based on your actuals. Know when cash gets tight before it happens.',
  },
  {
    icon: '✦',
    name: 'AI Receipt Scanner',
    desc: 'Photograph any receipt. Efficient extracts the vendor, amount, date, and category — no manual entry.',
  },
  {
    icon: '↺',
    name: 'Recurring Transactions & Rules',
    desc: 'Automate subscriptions, rent, retainers, and auto-categorization rules so your books stay current.',
  },
  {
    icon: '▷',
    name: 'Mileage & Time Tracker',
    desc: 'Log business miles and billable hours. IRS deductions calculated automatically at tax time.',
  },
  {
    icon: '◎',
    name: 'Budgets',
    desc: 'Set budget targets by category and track variance against actuals in real time.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Connect your bank',
    body: 'Link accounts via Plaid. Transactions flow in and are categorized automatically from day one.',
  },
  {
    n: '02',
    title: 'Invoice clients, track bills',
    body: 'Create an invoice in 60 seconds. Stay on top of receivables and payables from one dashboard.',
  },
  {
    n: '03',
    title: 'Close your books',
    body: 'Reconcile, run your P&L and balance sheet, and hand clean books to your accountant.',
  },
]

export default function EfficientGoldPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-amber-100 shadow-sm px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/efficient" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #C9A02E 0%, #92650A 100%)' }}>
              <span className="text-white text-sm font-extrabold">E</span>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg tracking-tight text-amber-900">Efficient</span>
              <span className="hidden md:block text-[10px] text-amber-500 font-medium tracking-wide -mt-0.5">Gold · Business Accounting</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">Features</Link>
            <Link href="#pricing" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">Pricing</Link>
            <Link href="/efficient" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">← All Plans</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-slate-500 hover:text-amber-700 transition">Sign In</Link>
            <Link href="/accounting/checkout?plan=gold" className="text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm" style={{ background: 'linear-gradient(135deg, #C9A02E 0%, #92650A 100%)' }}>
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
              brandSub="Gold · Business Accounting"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-amber-100" style={{ background: 'linear-gradient(135deg, #FFFDF0 0%, #FFFBEB 60%, #FEF3C7 100%)' }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 pointer-events-none bg-amber-300" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase border bg-amber-50 border-amber-200 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Efficient Gold · Xero Alternative · Most Popular
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
            Real accounting
            <br className="hidden sm:block" />
            <span className="text-amber-700">for your business.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Invoice clients, track bills, reconcile your bank, and run real P&amp;L reports.
            <br />
            <span className="text-slate-700 font-semibold">Everything Xero does — at a fraction of the cost.</span>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-8">
            <Link href="/accounting/checkout?plan=gold" className="text-white px-8 py-3.5 rounded-xl font-bold text-base transition shadow-lg text-center" style={{ background: 'linear-gradient(135deg, #C9A02E 0%, #92650A 100%)' }}>
              Start 7-Day Free Trial — $22/mo
            </Link>
            <Link href="/efficient" className="bg-white border-2 border-amber-200 text-amber-800 px-8 py-3.5 rounded-xl font-bold text-base transition shadow-sm text-center hover:border-amber-300">
              Compare All Plans
            </Link>
          </div>

          <p className="text-sm text-slate-400">No credit card required · Cancel anytime · Secure via Stripe</p>
        </div>

        <div style={{ background: 'linear-gradient(90deg, #92650A 0%, #B8860B 100%)' }}>
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              ['$22', 'per month'],
              ['Up to 3', 'users'],
              ['12 modules', 'full business accounting'],
              ['Real-time', 'P&L & cash flow'],
            ].map(([val, label], i) => (
              <div key={i}>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs mt-0.5 text-amber-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* vs Xero callout */}
      <div className="bg-amber-50 border-b border-amber-100 px-6 py-5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="text-2xl">⚡</div>
          <div>
            <p className="font-bold text-amber-900 text-sm">A Xero alternative — without the Xero price tag.</p>
            <p className="text-amber-700 text-xs mt-0.5">Xero starts at $15/mo but quickly jumps to $78/mo for the features you actually need. Efficient Gold gives you the full small business suite for $22/mo, flat.</p>
          </div>
          <Link href="/efficient/platinum" className="shrink-0 text-xs font-bold text-[#0F4C81] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-blue-100 transition">
            Need payroll & ERP? See Platinum →
          </Link>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-amber-700">What's Included</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Every tool your small business needs.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">12 accounting modules covering the full small business stack — from invoicing and bank sync to P&L reports and cash flow forecasting.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex flex-col gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:shadow-md transition">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-amber-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-amber-700">How It Works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Up and running in minutes.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-amber-100 p-7 hover:shadow-md hover:border-amber-300 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold mb-5 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #C9A02E 0%, #92650A 100%)' }}>
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
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-amber-700">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Everything. One price.</h2>

          <div className="relative rounded-2xl border-2 p-8 shadow-xl border-amber-400">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap" style={{ background: '#C9A02E' }}>
                Most Popular
              </span>
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 text-white mt-2" style={{ background: 'linear-gradient(135deg, #C9A02E 0%, #92650A 100%)' }}>Gold Plan</span>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-extrabold text-slate-900">$22</span>
              <span className="text-slate-400 text-lg">/mo</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Billed monthly. Cancel anytime.</p>
            <ul className="space-y-3 text-left mb-8">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="font-bold mt-0.5 shrink-0 text-amber-600">✓</span>
                  <span>{f.name}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0 text-amber-600">✓</span>
                <span>Up to 3 users · Priority support</span>
              </li>
            </ul>
            <Link href="/accounting/checkout?plan=gold" className="block w-full text-center py-4 rounded-xl font-bold text-base text-white transition shadow-md" style={{ background: 'linear-gradient(135deg, #C9A02E 0%, #92650A 100%)' }}>
              Start 7-Day Free Trial
            </Link>
            <p className="text-xs text-slate-400 mt-3">No charge until day 8 · Secure via Stripe</p>
          </div>

          <div className="mt-8 p-5 rounded-xl border bg-blue-50 border-blue-200 text-left">
            <p className="text-sm font-bold text-blue-800 mb-1">Growing fast? You need Platinum.</p>
            <p className="text-xs text-blue-700 mb-3">Platinum adds payroll, tax center, 1099 generation, inventory, purchase orders, projects & job costing, and full double-entry accounting — the NetSuite feature set for $42/mo.</p>
            <Link href="/efficient/platinum" className="text-xs font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2">See Efficient Platinum →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-white text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #92650A 0%, #B8860B 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Your books won't keep themselves.</h2>
          <p className="mb-8 text-base sm:text-lg text-amber-200">7-day free trial. No credit card. Close your books faster every month.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link href="/accounting/checkout?plan=gold" className="bg-white text-amber-900 px-8 py-3.5 rounded-xl font-bold transition shadow-lg text-center hover:bg-amber-50">
              Get Efficient Gold — $22/mo
            </Link>
            <Link href="/efficient" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-bold transition text-center hover:bg-white/10">
              Compare All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-50 border-t border-amber-100 px-6 py-10 text-center">
        <Link href="/efficient" className="flex items-center gap-2 justify-center mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #C9A02E 0%, #92650A 100%)' }}>
            <span className="text-white text-xs font-extrabold">E</span>
          </div>
          <span className="font-extrabold text-amber-900">Efficient Gold</span>
        </Link>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Efficient by IEBC. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs text-slate-400">
          <Link href="/efficient" className="hover:text-amber-700 transition">All Plans</Link>
          <Link href="/efficient/silver" className="hover:text-slate-600 transition">Silver</Link>
          <Link href="/efficient/platinum" className="hover:text-[#0F4C81] transition">Platinum</Link>
          <Link href="/auth/login" className="hover:text-amber-700 transition">Sign In</Link>
          <Link href="/terms" className="hover:text-amber-700 transition">Terms</Link>
        </div>
      </footer>

    </main>
  )
}
