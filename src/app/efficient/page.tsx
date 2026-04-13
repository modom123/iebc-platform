import Link from 'next/link'

const MODULES = [
  { icon: '🧾', name: 'Invoicing & Estimates', desc: 'Create professional invoices and estimates in seconds. Track status, send reminders, and collect payment online.' },
  { icon: '💳', name: 'Transactions', desc: 'Log income and expenses with one click. Auto-categorize with AI rules and keep your books clean year-round.' },
  { icon: '🏦', name: 'Bank Reconciliation', desc: 'Connect your bank and reconcile accounts instantly. Spot discrepancies before they become problems.' },
  { icon: '📄', name: 'Bills & Payables', desc: 'Track what you owe, schedule payments, and never miss a vendor due date again.' },
  { icon: '👥', name: 'Customers & Vendors', desc: 'Full contact management with transaction history, aging reports, and 1099 vendor tracking built in.' },
  { icon: '💰', name: 'Payroll', desc: 'Run payroll for your team with tax calculations handled automatically. Pay on time, every time.' },
  { icon: '📊', name: 'Reports & Dashboards', desc: 'P&L, balance sheet, cash flow, and aged receivables — all real-time, all in one place.' },
  { icon: '🔮', name: 'Cash Flow Forecast', desc: 'See 30/60/90-day projections based on your actuals. Know exactly when cash gets tight before it happens.' },
  { icon: '🤖', name: 'AI Receipt Scanner', desc: 'Snap a photo of any receipt and watch IEBC auto-extract, categorize, and log the transaction for you.' },
  { icon: '📋', name: 'Chart of Accounts', desc: 'Customizable chart of accounts that fits your business structure, with full journal entry support.' },
  { icon: '🗓️', name: 'Recurring Transactions', desc: 'Set it and forget it for subscriptions, rent, retainers, and any other repeating income or expense.' },
  { icon: '📦', name: 'Inventory Management', desc: 'Track stock levels, COGS, and reorder points. Know exactly what you have and what it\'s worth.' },
  { icon: '🚗', name: 'Mileage & Time Tracker', desc: 'Log miles and billable hours with GPS-aware tracking. Auto-calculate deductions at tax time.' },
  { icon: '🧮', name: 'Tax Center & 1099s', desc: 'Estimate quarterly taxes, generate 1099s for contractors, and stay compliant without the stress.' },
  { icon: '📐', name: 'Budgets', desc: 'Set budget targets by category and track variance against actuals in real time.' },
  { icon: '⚙️', name: 'Automation Rules', desc: 'Define rules that auto-categorize, auto-tag, and auto-assign transactions so your books stay current.' },
  { icon: '🔗', name: 'Bank Connect (Plaid)', desc: 'Securely link your bank accounts and import transactions automatically via Plaid.' },
  { icon: '🏗️', name: 'Projects & Job Costing', desc: 'Track income and expenses by project. See exactly which jobs are profitable and which aren\'t.' },
  { icon: '🛒', name: 'Purchase Orders', desc: 'Create and manage POs linked to your vendor records and bills, with full approval tracking.' },
  { icon: '🔍', name: 'Audit Trail', desc: 'Every change is logged with timestamp and user. Full audit history available at any time.' },
  { icon: '🌐', name: 'Client Payment Portal', desc: 'Give clients a secure link to view their invoices and pay online — no account required.' },
  { icon: '📬', name: 'Accounts Receivable', desc: 'Aged receivables dashboard shows exactly who owes what and for how long. Follow up with one click.' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Connect your bank', body: 'Link your accounts via Plaid. Transactions start flowing in automatically — categorized by AI from day one.' },
  { step: '02', title: 'Invoice your clients', body: 'Create an invoice in under 60 seconds. Send it directly from IEBC and let clients pay online via secure portal.' },
  { step: '03', title: 'Close your books', body: 'Reconcile accounts, run your P&L, and export reports. Your accountant (or you) will actually enjoy tax season.' },
]

const PLANS = [
  {
    id: 'silver',
    label: 'Silver',
    price: '$9',
    period: '/mo',
    badge: 'bg-slate-100 text-slate-600',
    features: ['Core accounting dashboard', 'Invoicing & estimates', 'Income & expense tracking', 'Client payment portal', 'Email support'],
    cta: 'Start with Silver',
    href: '/accounting/checkout',
    highlight: false,
  },
  {
    id: 'gold',
    label: 'Gold',
    price: '$22',
    period: '/mo',
    badge: 'bg-amber-50 text-amber-700',
    features: ['Everything in Silver', 'Bank reconciliation', 'Reports & dashboards', 'Cash flow forecast', 'AI receipt scanner', 'Recurring transactions', 'Budgets & rules', 'Priority support'],
    cta: 'Start with Gold',
    href: '/accounting/checkout',
    highlight: true,
  },
  {
    id: 'platinum',
    label: 'Platinum',
    price: '$42',
    period: '/mo',
    badge: 'bg-blue-50 text-blue-700',
    features: ['Everything in Gold', 'Full 22-module suite', 'Payroll', 'Inventory & POs', 'Tax center & 1099s', 'Mileage & time tracker', 'Projects & job costing', 'Audit trail'],
    cta: 'Start with Platinum',
    href: 'https://buy.stripe.com/bJe14h1aVeRj58CfrVgEg01',
    highlight: false,
  },
]

export default function EfficientPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F4C81] rounded-lg flex items-center justify-center">
              <span className="text-white text-base font-extrabold">I</span>
            </div>
            <div className="leading-tight">
              <span className="text-[#0F4C81] font-extrabold text-lg tracking-tight">IEBC</span>
              <span className="hidden md:block text-[10px] text-gray-400 font-medium tracking-wide -mt-1">Efficient Accounting</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Features</Link>
            <Link href="#how-it-works" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">How It Works</Link>
            <Link href="#pricing" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Pricing</Link>
            <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">Back to IEBC</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] transition">Sign In</Link>
            <Link href="/accounting/checkout" className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#082D4F] transition">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative bg-[#050F1C] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-[#0F4C81] opacity-25 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Efficient Accounting by IEBC
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Accounting that works<br />
            <span className="text-[#4A9EE8]">as hard as you do.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            22 modules. One dashboard. No accountant required.<br />
            <span className="text-white font-semibold">From invoices to payroll to tax prep — Efficient does it all.</span>
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Link href="/accounting/checkout" className="bg-[#0F4C81] hover:bg-[#1560A0] text-white px-7 py-3.5 rounded-xl font-semibold text-base transition shadow-lg shadow-blue-900/30">
              Get Started — From $9/mo
            </Link>
            <Link href="/accounting" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition">
              View Dashboard Demo
            </Link>
          </div>

          <p className="text-sm text-slate-500">No contracts · Cancel anytime · Secure via Stripe</p>
        </div>

        {/* Metric bar */}
        <div className="relative border-t border-white/10 bg-white/5">
          <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ['22+', 'accounting modules'],
              ['60 sec', 'to create an invoice'],
              ['$0', 'extra for bank connect'],
              ['Real-time', 'cash flow visibility'],
            ].map(([val, label], i) => (
              <div key={i}>
                <p className="text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#0F4C81] uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Up and running in minutes.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gray-200 -translate-x-4 z-0" />
                )}
                <div className="relative bg-white rounded-xl border border-gray-200 p-7 hover:shadow-md hover:border-[#0F4C81] transition">
                  <div className="w-10 h-10 bg-[#0F4C81] text-white rounded-xl flex items-center justify-center text-sm font-extrabold mb-5">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#0F4C81] uppercase tracking-widest mb-3">Full Module Suite</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Everything your books need.</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">22 modules designed to cover every corner of your financial operations — without the enterprise price tag.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((m, i) => (
              <div
                key={i}
                className="group flex gap-4 p-5 rounded-xl border border-gray-200 hover:border-[#0F4C81] hover:shadow-md transition cursor-default"
              >
                <div className="text-2xl shrink-0 mt-0.5">{m.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#0F4C81] transition">{m.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#0F4C81] uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Start at $9. Scale as you grow.</h2>
            <p className="text-gray-500 mt-4">All plans include the core accounting suite. No setup fees. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map(p => (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border flex flex-col transition relative ${
                  p.highlight
                    ? 'border-[#0F4C81] shadow-2xl shadow-blue-100 ring-2 ring-[#0F4C81]/20'
                    : 'border-gray-200 hover:border-[#0F4C81] hover:shadow-lg'
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#0F4C81] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mb-3 ${p.badge}`}>{p.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
                      <span className="text-gray-400 text-sm">{p.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {p.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={p.href}
                    className={`text-center py-3 rounded-xl font-semibold text-sm transition block ${
                      p.highlight
                        ? 'bg-[#0F4C81] text-white hover:bg-[#082D4F] shadow-md shadow-blue-200'
                        : 'border-2 border-[#0F4C81] text-[#0F4C81] hover:bg-blue-50'
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">All plans billed monthly. Secure payments via Stripe.</p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-6 bg-[#050F1C] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Your books won't keep themselves.</h2>
          <p className="text-slate-400 mb-8 text-lg">Start with Efficient Accounting and close your books faster every month.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/accounting/checkout" className="bg-[#0F4C81] hover:bg-[#1560A0] text-white px-8 py-3.5 rounded-xl font-semibold transition shadow-lg shadow-blue-900/30">
              Get Started — From $9/mo
            </Link>
            <Link href="/" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold transition">
              Back to IEBC
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-200 px-6 py-10 text-center">
        <Link href="/" className="flex items-center gap-2 justify-center mb-3">
          <div className="w-7 h-7 bg-[#0F4C81] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-extrabold">I</span>
          </div>
          <span className="text-[#0F4C81] font-extrabold">IEBC</span>
        </Link>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} IEBC. Integrated Efficiency Business Consultants.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#0F4C81] transition">Home</Link>
          <Link href="/auth/login" className="hover:text-[#0F4C81] transition">Sign In</Link>
          <Link href="/portal" className="hover:text-[#0F4C81] transition">Client Portal</Link>
          <Link href="/accounting/checkout" className="hover:text-[#0F4C81] transition">Pricing</Link>
        </div>
      </footer>

    </main>
  )
}
