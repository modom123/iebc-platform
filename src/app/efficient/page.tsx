import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const PLANS = [
  {
    id: 'silver',
    label: 'Silver',
    price: '$9',
    compete: 'Quicken Alternative',
    tagline: 'See your complete financial life.',
    desc: 'Connect bank accounts, credit cards, and investments. Track spending, set budgets, and know your net worth — updated daily.',
    href: '/efficient/silver',
    checkoutHref: '/accounting/checkout?plan=silver',
    badge: null,
    primary: '#64748B',
    light: '#F1F5F9',
    border: '#CBD5E1',
    features: [
      'Connect bank accounts',
      'Connect credit cards',
      'Connect investment accounts',
      'Net worth dashboard',
      'Transaction tracking & categorization',
      'Budget by category',
      'Spending breakdown charts',
      'Alerts & notifications',
      '1 user',
    ],
    modules: '8 modules',
    users: '1 user',
    cta: 'Start with Silver',
  },
  {
    id: 'gold',
    label: 'Gold',
    price: '$22',
    compete: 'Xero Alternative',
    tagline: 'Real accounting for your business.',
    desc: 'Invoice clients, manage bills, reconcile your bank, and run real P&L reports. Everything Xero does at a fraction of the price.',
    href: '/efficient/gold',
    checkoutHref: '/accounting/checkout?plan=gold',
    badge: 'Most Popular',
    primary: '#C9A02E',
    light: '#FFFBEB',
    border: '#FDE68A',
    features: [
      'Everything in Silver',
      'Invoicing & estimates',
      'Customer management & payment portal',
      'Bills & payables',
      'Vendors & 1099 tracking',
      'Bank reconciliation',
      'P&L, balance sheet & cash flow reports',
      'Cash flow forecast',
      'AI receipt scanner',
      'Recurring transactions & automation rules',
      'Mileage & time tracker',
      'Up to 3 users · Priority support',
    ],
    modules: '12 modules',
    users: 'Up to 3 users',
    cta: 'Start with Gold',
  },
  {
    id: 'platinum',
    label: 'Platinum',
    price: '$42',
    compete: 'NetSuite Alternative',
    tagline: 'The complete ERP. At a price that makes sense.',
    desc: 'Payroll, tax, inventory, purchase orders, projects, and full double-entry accounting — the NetSuite feature set at $42/mo.',
    href: '/efficient/platinum',
    checkoutHref: '/accounting/checkout?plan=platinum',
    badge: null,
    primary: '#0F4C81',
    light: '#EEF4FB',
    border: '#C0C8D4',
    features: [
      'Everything in Gold',
      'Payroll management',
      'Tax center & 1099 generation',
      'Inventory management',
      'Purchase orders',
      'Projects & job costing',
      'Chart of accounts',
      'Full double-entry journal',
      'Audit trail',
      'Up to 10 users · Dedicated manager',
    ],
    modules: '16 modules',
    users: 'Up to 10 users',
    cta: 'Get Platinum',
  },
]

const COMPARE_ROWS: { label: string; silver: boolean | string; gold: boolean | string; platinum: boolean | string }[] = [
  { label: 'Monthly price',                          silver: '$9/mo',         gold: '$22/mo',         platinum: '$42/mo' },
  { label: 'Users',                                  silver: '1',             gold: 'Up to 3',        platinum: 'Up to 10' },
  { label: 'Competes with',                          silver: 'Quicken',       gold: 'Xero',           platinum: 'NetSuite' },
  { label: 'Connect bank accounts',                  silver: true,            gold: true,             platinum: true },
  { label: 'Connect credit cards',                   silver: true,            gold: true,             platinum: true },
  { label: 'Connect investment accounts',            silver: true,            gold: true,             platinum: true },
  { label: 'Net worth dashboard',                    silver: true,            gold: true,             platinum: true },
  { label: 'Transaction tracking & categorization',  silver: true,            gold: true,             platinum: true },
  { label: 'Budgets',                                silver: true,            gold: true,             platinum: true },
  { label: 'Invoicing & estimates',                  silver: false,           gold: true,             platinum: true },
  { label: 'Customer management & payment portal',   silver: false,           gold: true,             platinum: true },
  { label: 'Bills & payables',                       silver: false,           gold: true,             platinum: true },
  { label: 'Vendors & 1099 tracking',                silver: false,           gold: true,             platinum: true },
  { label: 'Bank reconciliation',                    silver: false,           gold: true,             platinum: true },
  { label: 'P&L, balance sheet & cash flow reports', silver: false,           gold: true,             platinum: true },
  { label: 'Cash flow forecast',                     silver: false,           gold: true,             platinum: true },
  { label: 'AI receipt scanner',                     silver: false,           gold: true,             platinum: true },
  { label: 'Recurring transactions & rules',         silver: false,           gold: true,             platinum: true },
  { label: 'Mileage & time tracker',                 silver: false,           gold: true,             platinum: true },
  { label: 'Payroll management',                     silver: false,           gold: false,            platinum: true },
  { label: 'Tax center & 1099 generation',           silver: false,           gold: false,            platinum: true },
  { label: 'Inventory management',                   silver: false,           gold: false,            platinum: true },
  { label: 'Purchase orders',                        silver: false,           gold: false,            platinum: true },
  { label: 'Projects & job costing',                 silver: false,           gold: false,            platinum: true },
  { label: 'Chart of accounts',                      silver: false,           gold: false,            platinum: true },
  { label: 'Full double-entry journal',              silver: false,           gold: false,            platinum: true },
  { label: 'Audit trail',                            silver: false,           gold: false,            platinum: true },
  { label: 'Support',                                silver: 'Email',         gold: 'Priority',       platinum: 'Dedicated manager' },
]

function Cell({ val }: { val: boolean | string }) {
  if (typeof val === 'boolean') {
    return val
      ? <span className="text-green-500 font-bold text-lg">✓</span>
      : <span className="text-slate-200 font-bold text-lg">—</span>
  }
  return <span className="text-sm font-semibold text-slate-700">{val}</span>
}

export default function EfficientPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F4C81] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-base font-extrabold">I</span>
            </div>
            <div className="leading-tight">
              <span className="text-[#0F4C81] font-extrabold text-lg tracking-tight">IEBC</span>
              <span className="hidden md:block text-[10px] text-gray-400 font-medium tracking-wide -mt-0.5">Efficient · Accounting</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="#plans" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Plans</Link>
            <Link href="#compare" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Compare</Link>
            <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">← IEBC Home</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] transition">Sign In</Link>
            <Link href="/accounting/checkout?plan=gold" className="bg-[#C9A02E] hover:bg-[#92650A] text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm">
              Get Started
            </Link>
            <MobileNav
              links={[
                { label: 'Plans', href: '#plans' },
                { label: 'Compare', href: '#compare' },
                { label: '← IEBC Home', href: '/' },
              ]}
              cta={{ label: 'Get Started — From $9/mo', href: '/accounting/checkout?plan=gold' }}
              loginHref="/auth/login"
              loginLabel="Sign In"
              brandSub="Efficient · Accounting"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative bg-gradient-to-br from-[#EEF4FF] via-white to-[#FFF8E8] border-b border-gray-100 overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-[#0F4C81]/10 border border-[#0F4C81]/20 text-[#0F4C81] text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Efficient by IEBC · Accounting Software
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-gray-900">
            Three products.
            <br className="hidden sm:block" />
            <span className="text-[#0F4C81]">One for every stage.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-4 leading-relaxed">
            Silver competes with Quicken. Gold competes with Xero. Platinum competes with NetSuite.
            <br />
            <span className="text-gray-700 font-semibold">All three cost a fraction of the alternative.</span>
          </p>

          <p className="text-sm text-gray-400">7-day free trial on every plan · No credit card required · Cancel anytime</p>
        </div>
      </header>

      {/* Plans */}
      <section id="plans" className="py-24 px-6 bg-[#F5F7FA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#C9A02E] uppercase tracking-widest mb-3">Three Distinct Products</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">Pick the plan that fits where you are.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PLANS.map(p => (
              <div
                key={p.id}
                className="rounded-2xl border-2 flex flex-col bg-white relative transition hover:shadow-xl"
                style={{ borderColor: p.id === 'gold' ? p.primary : p.border }}
              >
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap" style={{ background: p.primary }}>
                      {p.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 pb-5 border-b" style={{ borderColor: p.border, background: p.light }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: p.primary }}>{p.label}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{p.compete}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
                    <span className="text-gray-400 text-sm">/mo</span>
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: p.primary }}>{p.tagline}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                  <div className="flex gap-3 mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: p.border, color: p.id === 'platinum' ? '#0B2140' : p.id === 'gold' ? '#92650A' : '#475569' }}>{p.modules}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: p.border, color: p.id === 'platinum' ? '#0B2140' : p.id === 'gold' ? '#92650A' : '#475569' }}>{p.users}</span>
                  </div>
                </div>

                <div className="p-7 flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="font-bold mt-0.5 shrink-0" style={{ color: p.primary }}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    <Link href={p.checkoutHref} className="block text-center py-3 rounded-xl font-bold text-sm text-white transition shadow-md" style={{ background: p.id === 'platinum' ? 'linear-gradient(135deg, #0F4C81 0%, #0B2140 100%)' : p.primary }}>
                      {p.cta}
                    </Link>
                    <Link href={p.href} className="block text-center py-2.5 rounded-xl font-semibold text-sm transition border" style={{ borderColor: p.border, color: p.primary, background: p.light }}>
                      Learn more about {p.label} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section id="compare" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#C9A02E] uppercase tracking-widest mb-3">Feature Comparison</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">Side-by-side.</h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-gray-500 font-semibold w-1/2">Feature</th>
                  <th className="text-center px-4 py-4 font-bold text-slate-500">Silver</th>
                  <th className="text-center px-4 py-4 font-bold text-amber-800 bg-amber-50">Gold</th>
                  <th className="text-center px-4 py-4 font-bold text-[#0F4C81]">Platinum</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-3.5 text-gray-700 font-medium">{row.label}</td>
                    <td className="text-center px-4 py-3.5"><Cell val={row.silver} /></td>
                    <td className="text-center px-4 py-3.5" style={{ background: i % 2 === 0 ? '#FFFDF5' : '#FFFBEB' }}><Cell val={row.gold} /></td>
                    <td className="text-center px-4 py-3.5"><Cell val={row.platinum} /></td>
                  </tr>
                ))}
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="px-6 py-4" />
                  <td className="text-center px-4 py-4">
                    <Link href="/accounting/checkout?plan=silver" className="inline-block px-4 py-2 rounded-lg text-xs font-bold text-white transition bg-slate-500 hover:bg-slate-600">Get Silver</Link>
                  </td>
                  <td className="text-center px-4 py-4 bg-amber-50">
                    <Link href="/accounting/checkout?plan=gold" className="inline-block px-4 py-2 rounded-lg text-xs font-bold text-white transition" style={{ background: '#C9A02E' }}>Get Gold</Link>
                  </td>
                  <td className="text-center px-4 py-4">
                    <Link href="/accounting/checkout?plan=platinum" className="inline-block px-4 py-2 rounded-lg text-xs font-bold text-white transition bg-[#0F4C81] hover:bg-[#0B2140]">Get Platinum</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">All plans billed monthly. 7-day free trial on every plan. Secure payments via Stripe.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0F4C81] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Start your free trial today.</h2>
          <p className="text-blue-200 mb-8 text-base sm:text-lg">Pick the plan that fits. Upgrade anytime.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            {PLANS.map(p => (
              <Link key={p.id} href={p.checkoutHref} className="px-6 py-3 rounded-xl font-bold text-sm transition text-center border border-white/20" style={{ background: p.id === 'gold' ? p.primary : 'rgba(255,255,255,0.1)' }}>
                {p.label} — {p.price}/mo
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 px-6 py-10 text-center">
        <Link href="/" className="flex items-center gap-2 justify-center mb-3">
          <div className="w-7 h-7 bg-[#0F4C81] rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-extrabold">I</span>
          </div>
          <span className="text-[#0F4C81] font-extrabold">IEBC</span>
          <span className="text-gray-400 text-sm">/ Efficient</span>
        </Link>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Efficient by IEBC. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs text-gray-400">
          <Link href="/efficient/silver" className="hover:text-slate-600 transition">Silver</Link>
          <Link href="/efficient/gold" className="hover:text-amber-700 transition">Gold</Link>
          <Link href="/efficient/platinum" className="hover:text-[#0F4C81] transition">Platinum</Link>
          <Link href="/auth/login" className="hover:text-[#0F4C81] transition">Sign In</Link>
          <Link href="/" className="hover:text-[#0F4C81] transition">IEBC Home</Link>
        </div>
      </footer>

    </main>
  )
}
