import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const FEATURES = [
  {
    icon: '🏦',
    name: 'Connect Bank Accounts',
    desc: 'Securely link your checking, savings, and money market accounts. Transactions sync automatically every day.',
  },
  {
    icon: '💳',
    name: 'Connect Credit Cards',
    desc: 'See all your credit card balances and spending in one place. Track what you owe without logging into each card.',
  },
  {
    icon: '📈',
    name: 'Connect Investment Accounts',
    desc: 'Link brokerage, retirement, and crypto accounts. Watch your portfolio value alongside your cash — in one dashboard.',
  },
  {
    icon: '◈',
    name: 'Net Worth Dashboard',
    desc: 'Your total assets minus liabilities, updated daily. Know exactly where you stand financially at any moment.',
  },
  {
    icon: '⇄',
    name: 'Transaction Tracking',
    desc: 'Every transaction from every account, auto-categorized. Search, filter, and tag anything in seconds.',
  },
  {
    icon: '◎',
    name: 'Budget by Category',
    desc: 'Set monthly spending limits for groceries, dining, entertainment, and any other category. Get alerted when you\'re close.',
  },
  {
    icon: '📊',
    name: 'Spending Breakdown',
    desc: 'See exactly where your money goes — by category, by merchant, by month. Visual charts make patterns obvious.',
  },
  {
    icon: '🔔',
    name: 'Alerts & Notifications',
    desc: 'Get notified of large transactions, low balances, upcoming bills, and unusual spending — before it becomes a problem.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Connect your accounts',
    body: 'Link bank accounts, credit cards, and investments via Plaid in under 2 minutes. Everything syncs automatically.',
  },
  {
    n: '02',
    title: 'See your complete picture',
    body: 'Your net worth, spending by category, and account balances — all in one dashboard, updated daily.',
  },
  {
    n: '03',
    title: 'Set budgets, stay on track',
    body: 'Define monthly budgets per category. Efficient tracks your progress and alerts you before you overspend.',
  },
]

export default function EfficientSilverPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/efficient" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md bg-slate-500">
              <span className="text-white text-sm font-extrabold">E</span>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg tracking-tight text-slate-600">Efficient</span>
              <span className="hidden md:block text-[10px] text-slate-400 font-medium tracking-wide -mt-0.5">Silver · Personal Finance</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition">Features</Link>
            <Link href="#pricing" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition">Pricing</Link>
            <Link href="/efficient" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition">← All Plans</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">Sign In</Link>
            <Link href="/accounting/checkout?plan=silver" className="text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm bg-slate-500 hover:bg-slate-600">
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
              brandSub="Silver · Personal Finance"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none bg-slate-400" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase border bg-slate-50 border-slate-200 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Efficient Silver · Quicken Alternative
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
            All your accounts.
            <br className="hidden sm:block" />
            <span className="text-slate-500">One clear picture.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect your bank accounts, credit cards, and investment accounts.
            <br />
            <span className="text-slate-700 font-semibold">Track spending. Set budgets. Know your net worth — updated daily.</span>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-8">
            <Link href="/accounting/checkout?plan=silver" className="text-white px-8 py-3.5 rounded-xl font-bold text-base transition shadow-lg text-center bg-slate-600 hover:bg-slate-700">
              Start 7-Day Free Trial — $9/mo
            </Link>
            <Link href="/efficient" className="bg-white border-2 border-slate-200 text-slate-600 px-8 py-3.5 rounded-xl font-bold text-base transition shadow-sm text-center hover:border-slate-300">
              Compare All Plans
            </Link>
          </div>

          <p className="text-sm text-slate-400">No credit card required · Cancel anytime · Bank-grade security via Plaid</p>
        </div>

        <div className="bg-slate-600">
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              ['$9', 'per month'],
              ['1 user', 'included'],
              ['All accounts', 'bank, credit, investments'],
              ['Daily sync', 'automatic'],
            ].map(([val, label], i) => (
              <div key={i}>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs mt-0.5 text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* vs Quicken callout */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="text-2xl">⚡</div>
          <div>
            <p className="font-bold text-slate-800 text-sm">A modern Quicken — without the desktop software.</p>
            <p className="text-slate-500 text-xs mt-0.5">Same connected-accounts experience, cloud-based, works on any device, and $9/mo instead of $35-75/yr for something outdated.</p>
          </div>
          <Link href="/efficient/gold" className="shrink-0 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-amber-100 transition">
            Need business features? See Gold →
          </Link>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-500">What's Included</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">See your complete financial life.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Connect every account, track every dollar, and know your net worth — without switching between apps or logging into multiple banks.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex flex-col gap-3 p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-500">How It Works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Set up in minutes.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-7 hover:shadow-md hover:border-slate-400 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold mb-5 shadow-sm text-white bg-slate-500">
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
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-500">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Simple, flat pricing.</h2>

          <div className="rounded-2xl border-2 border-slate-400 p-8 shadow-lg">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 text-white bg-slate-500">Silver Plan</span>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-extrabold text-slate-900">$9</span>
              <span className="text-slate-400 text-lg">/mo</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Billed monthly. Cancel anytime.</p>
            <ul className="space-y-3 text-left mb-8">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="font-bold mt-0.5 shrink-0 text-slate-500">✓</span>
                  <span>{f.name}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0 text-slate-500">✓</span>
                <span>1 user · Email support</span>
              </li>
            </ul>
            <Link href="/accounting/checkout?plan=silver" className="block w-full text-center py-4 rounded-xl font-bold text-base text-white transition shadow-md bg-slate-600 hover:bg-slate-700">
              Start 7-Day Free Trial
            </Link>
            <p className="text-xs text-slate-400 mt-3">No charge until day 8 · Secure via Stripe</p>
          </div>

          <div className="mt-8 p-5 rounded-xl border bg-amber-50 border-amber-200 text-left">
            <p className="text-sm font-bold text-amber-800 mb-1">Running a business? You need Gold.</p>
            <p className="text-xs text-amber-700 mb-3">Silver is personal finance. Gold adds invoicing, customer management, bills, vendors, reconciliation, and full business reports — everything Xero offers, for $22/mo.</p>
            <Link href="/efficient/gold" className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2">See Efficient Gold →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-white text-center relative overflow-hidden bg-slate-700">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Know your finances. Really know them.</h2>
          <p className="mb-8 text-base sm:text-lg text-slate-300">7-day free trial. Connect your first account in 2 minutes.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link href="/accounting/checkout?plan=silver" className="bg-white text-slate-700 px-8 py-3.5 rounded-xl font-bold transition shadow-lg text-center hover:bg-slate-100">
              Get Efficient Silver — $9/mo
            </Link>
            <Link href="/efficient" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-bold transition text-center hover:bg-white/10">
              Compare All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 px-6 py-10 text-center">
        <Link href="/efficient" className="flex items-center gap-2 justify-center mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm bg-slate-500">
            <span className="text-white text-xs font-extrabold">E</span>
          </div>
          <span className="font-extrabold text-slate-600">Efficient Silver</span>
        </Link>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Efficient by IEBC. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs text-slate-400">
          <Link href="/efficient" className="hover:text-slate-600 transition">All Plans</Link>
          <Link href="/efficient/gold" className="hover:text-amber-700 transition">Gold</Link>
          <Link href="/efficient/platinum" className="hover:text-[#0F4C81] transition">Platinum</Link>
          <Link href="/auth/login" className="hover:text-slate-600 transition">Sign In</Link>
          <Link href="/terms" className="hover:text-slate-600 transition">Terms</Link>
        </div>
      </footer>

    </main>
  )
}
