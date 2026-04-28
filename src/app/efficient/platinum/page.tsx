import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const FEATURES = [
  {
    icon: '🏦',
    name: 'Connected Accounts',
    desc: 'Bank, credit card, and investment accounts — all synced via Plaid. Your full financial picture, daily.',
  },
  {
    icon: '🧾',
    name: 'Invoicing & Estimates',
    desc: 'Professional invoices and estimates with automated reminders and a branded client payment portal.',
  },
  {
    icon: '◯',
    name: 'Customer Management',
    desc: 'Full CRM records with invoice history, balances, aging, and a self-serve client payment portal.',
  },
  {
    icon: '▥',
    name: 'Bills & Payables',
    desc: 'Full payables management — entry, due-date tracking, and payment scheduling in one place.',
  },
  {
    icon: '⬡',
    name: 'Vendors & 1099 Management',
    desc: 'Track vendors, flag 1099-eligible contractors, and generate 1099-NECs at year end.',
  },
  {
    icon: '⇌',
    name: 'Bank Reconciliation',
    desc: 'One-click reconciliation against your Plaid-connected accounts. Discrepancies surface automatically.',
  },
  {
    icon: '▦',
    name: 'Full Financial Reports',
    desc: 'P&L, balance sheet, cash flow statement, and aged receivables — live, any date range.',
  },
  {
    icon: '✦',
    name: 'AI Receipt Scanner',
    desc: 'Auto-extract vendor, amount, date, and category from any receipt photo. No manual entry.',
  },
  {
    icon: '◫',
    name: 'Payroll Management',
    desc: 'Run payroll for your team — hourly, salary, or contractor — with tax calculations handled automatically.',
  },
  {
    icon: '🧮',
    name: 'Tax Center & 1099s',
    desc: 'Quarterly estimated tax calculations, 1099-NEC generation, and year-end tax prep exports — all built in.',
  },
  {
    icon: '▣',
    name: 'Inventory Management',
    desc: 'Track SKUs, stock levels, COGS, and reorder points. Know exactly what you have and what it\'s worth.',
  },
  {
    icon: '⊕',
    name: 'Purchase Orders',
    desc: 'Create and manage POs tied to vendor records and bills. Full approval tracking and receiving workflow.',
  },
  {
    icon: '◧',
    name: 'Projects & Job Costing',
    desc: 'Assign income and expenses to projects or jobs. See exactly which engagements are profitable.',
  },
  {
    icon: '≡',
    name: 'Chart of Accounts',
    desc: 'Fully customizable chart of accounts structured for GAAP compliance. Edit, merge, or add accounts freely.',
  },
  {
    icon: '⊟',
    name: 'Double-Entry Journal',
    desc: 'Full general ledger with debit/credit posting, adjusting entries, and period-close support.',
  },
  {
    icon: '🔍',
    name: 'Audit Trail',
    desc: 'Every change is timestamped and logged by user. Complete, immutable history for compliance and review.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Connect everything',
    body: 'Link your bank, payroll provider, and accounts. Efficient pulls it all into one source of truth.',
  },
  {
    n: '02',
    title: 'Run your full operation',
    body: 'Invoice clients, run payroll, manage inventory, track projects — all from one dashboard.',
  },
  {
    n: '03',
    title: 'Close fast, stay compliant',
    body: 'Reconcile, generate 1099s, file quarterly taxes, and produce audit-ready reports on demand.',
  },
]

export default function EfficientPlatinumPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/efficient" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #0B2140 100%)' }}>
              <span className="text-white text-sm font-extrabold">E</span>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg tracking-tight text-[#0B2140]">Efficient</span>
              <span className="hidden md:block text-[10px] text-[#8B9EB7] font-medium tracking-wide -mt-0.5">Platinum · Complete ERP</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Features</Link>
            <Link href="#pricing" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Pricing</Link>
            <Link href="/efficient" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">← All Plans</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0F4C81] transition">Sign In</Link>
            <Link href="/accounting/checkout?plan=platinum" className="text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm" style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #0B2140 100%)' }}>
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
              brandSub="Platinum · Complete ERP"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-blue-100" style={{ background: 'linear-gradient(135deg, #EEF4FB 0%, #F0F6FF 50%, #E8F0FA 100%)' }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none bg-[#0F4C81]" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase border bg-[#EEF4FB] border-[#C0C8D4] text-[#0B2140]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B9EB7]" />
            Efficient Platinum · NetSuite Alternative · Complete Suite
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
            The complete ERP.
            <br className="hidden sm:block" />
            <span className="text-[#0F4C81]">At a price that makes sense.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Payroll, tax, inventory, purchase orders, projects, and full double-entry accounting —
            <br />
            <span className="text-slate-700 font-semibold">everything NetSuite does, without the $36,000/yr price tag.</span>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-8">
            <Link href="/accounting/checkout?plan=platinum" className="text-white px-8 py-3.5 rounded-xl font-bold text-base transition shadow-lg text-center" style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #0B2140 100%)' }}>
              Start 7-Day Free Trial — $42/mo
            </Link>
            <Link href="/efficient" className="bg-white border-2 border-[#C0C8D4] text-[#0B2140] px-8 py-3.5 rounded-xl font-bold text-base transition shadow-sm text-center hover:border-[#8B9EB7]">
              Compare All Plans
            </Link>
          </div>

          <p className="text-sm text-slate-400">No credit card required · Cancel anytime · Secure via Stripe</p>
        </div>

        <div style={{ background: 'linear-gradient(90deg, #0B2140 0%, #0F4C81 100%)' }}>
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              ['$42', 'per month'],
              ['Up to 10', 'users'],
              ['16 modules', 'complete ERP'],
              ['Payroll + Tax', 'fully included'],
            ].map(([val, label], i) => (
              <div key={i}>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs mt-0.5 text-blue-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* vs NetSuite callout */}
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="text-2xl">⚡</div>
          <div>
            <p className="font-bold text-[#0B2140] text-sm">NetSuite starts at $36,000/yr. Efficient Platinum is $42/mo.</p>
            <p className="text-blue-700 text-xs mt-0.5">Payroll, tax, inventory, purchase orders, projects, and full double-entry — all the modules that make NetSuite worth it, without the enterprise contract, the implementation fees, or the consultant dependency.</p>
          </div>
          <Link href="/efficient/gold" className="shrink-0 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-amber-100 transition">
            Not ready for ERP? See Gold →
          </Link>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#0F4C81]">Full 16-Module Suite</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Every module. Nothing held back.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Platinum includes the complete Efficient platform — from connected accounts and invoicing all the way through payroll, tax filing, and a full double-entry general ledger.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex flex-col gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:border-[#0F4C81] hover:shadow-md transition">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[#EEF4FB]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#0F4C81]">How It Works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Set up once. Run forever.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#C0C8D4] p-7 hover:shadow-md hover:border-[#0F4C81] transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold mb-5 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #0B2140 100%)' }}>
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
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#0F4C81]">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">The complete ERP. One flat price.</h2>

          <div className="rounded-2xl border-2 p-8 shadow-xl border-[#0F4C81]" style={{ boxShadow: '0 8px 48px rgba(15,76,129,0.12)' }}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 text-white" style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #0B2140 100%)' }}>Platinum Plan</span>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-extrabold text-slate-900">$42</span>
              <span className="text-slate-400 text-lg">/mo</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Billed monthly. Cancel anytime.</p>
            <ul className="space-y-3 text-left mb-8">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="font-bold mt-0.5 shrink-0 text-[#0F4C81]">✓</span>
                  <span>{f.name}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0 text-[#0F4C81]">✓</span>
                <span>Up to 10 users</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0 text-[#0F4C81]">✓</span>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="font-bold mt-0.5 shrink-0 text-[#0F4C81]">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            <Link href="/accounting/checkout?plan=platinum" className="block w-full text-center py-4 rounded-xl font-bold text-base text-white transition shadow-md" style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #0B2140 100%)' }}>
              Start 7-Day Free Trial
            </Link>
            <p className="text-xs text-slate-400 mt-3">No charge until day 8 · Secure via Stripe</p>
          </div>

          <div className="mt-8 p-5 rounded-xl border bg-amber-50 border-amber-200 text-left">
            <p className="text-sm font-bold text-amber-800 mb-1">Not ready for the full ERP?</p>
            <p className="text-xs text-amber-700 mb-3">Efficient Gold covers invoicing, customer management, bank reconciliation, full reports, and AI receipt scanning for $22/mo — everything a growing small business needs.</p>
            <Link href="/efficient/gold" className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2">See Efficient Gold →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-white text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B2140 0%, #0F4C81 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Run your complete financial operation.</h2>
          <p className="mb-8 text-base sm:text-lg text-blue-200">16 modules. One dashboard. 7-day free trial.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link href="/accounting/checkout?plan=platinum" className="bg-white text-[#0B2140] px-8 py-3.5 rounded-xl font-bold transition shadow-lg text-center hover:bg-blue-50">
              Get Efficient Platinum — $42/mo
            </Link>
            <Link href="/efficient" className="border-2 border-white/20 text-white px-8 py-3.5 rounded-xl font-bold transition text-center hover:bg-white/10">
              Compare All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#EEF4FB] border-t border-[#C0C8D4] px-6 py-10 text-center">
        <Link href="/efficient" className="flex items-center gap-2 justify-center mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #0B2140 100%)' }}>
            <span className="text-white text-xs font-extrabold">E</span>
          </div>
          <span className="font-extrabold text-[#0B2140]">Efficient Platinum</span>
        </Link>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Efficient by IEBC. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs text-slate-400">
          <Link href="/efficient" className="hover:text-[#0F4C81] transition">All Plans</Link>
          <Link href="/efficient/silver" className="hover:text-slate-600 transition">Silver</Link>
          <Link href="/efficient/gold" className="hover:text-amber-700 transition">Gold</Link>
          <Link href="/auth/login" className="hover:text-[#0F4C81] transition">Sign In</Link>
          <Link href="/terms" className="hover:text-[#0F4C81] transition">Terms</Link>
        </div>
      </footer>

    </main>
  )
}
