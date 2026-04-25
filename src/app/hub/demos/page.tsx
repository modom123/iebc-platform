import Link from 'next/link'

const DEMOS = [
  {
    title: 'Efficient — Accounting Dashboard',
    desc: 'Full walkthrough of the Efficient accounting platform: transactions, invoices, payroll, reports, and bank connect.',
    tag: 'Accounting',
    tagColor: 'bg-blue-100 text-blue-700',
    href: '/accounting',
    cta: 'Open Live Demo',
    icon: '◈',
  },
  {
    title: 'AI Receipt Scanner',
    desc: 'Upload a receipt or PDF and watch Claude AI extract vendor, amount, date, and line items in seconds.',
    tag: 'AI Feature',
    tagColor: 'bg-purple-100 text-purple-700',
    href: '/accounting/scanner',
    cta: 'Try Scanner',
    icon: '🤖',
  },
  {
    title: 'Invoice & Client Portal',
    desc: 'Create an invoice, send a secure payment link to the client, and collect payment — no login required for the client.',
    tag: 'Invoicing',
    tagColor: 'bg-green-100 text-green-700',
    href: '/accounting/invoices',
    cta: 'Create Invoice',
    icon: '▤',
  },
  {
    title: 'Financial Reports',
    desc: 'P&L, balance sheet, cash flow statement, aged receivables — all real-time, all exportable to CSV.',
    tag: 'Reports',
    tagColor: 'bg-amber-100 text-amber-700',
    href: '/accounting/reports',
    cta: 'View Reports',
    icon: '▦',
  },
  {
    title: 'Cash Flow Forecast',
    desc: 'See 30/60/90-day projections based on recurring transactions, outstanding invoices, and upcoming bills.',
    tag: 'Finance',
    tagColor: 'bg-cyan-100 text-cyan-700',
    href: '/accounting/forecast',
    cta: 'View Forecast',
    icon: '▲',
  },
  {
    title: 'Business Formation',
    desc: 'Step-by-step guided checklist for forming an LLC, S-Corp, or C-Corp in any US state.',
    tag: 'Formation',
    tagColor: 'bg-orange-100 text-orange-700',
    href: '/hub/formation',
    cta: 'View Formation',
    icon: '🏛️',
  },
  {
    title: 'Payroll Processing',
    desc: 'Run payroll for hourly or salaried employees with federal, state, social security, and Medicare tax calculations.',
    tag: 'Payroll',
    tagColor: 'bg-indigo-100 text-indigo-700',
    href: '/accounting/payroll',
    cta: 'View Payroll',
    icon: '◫',
  },
  {
    title: 'Checkout — 30-Day Free Trial',
    desc: 'The full Efficient checkout flow: pick a plan, enter email and password, go to Stripe, return to dashboard.',
    tag: 'Checkout',
    tagColor: 'bg-red-100 text-red-700',
    href: '/accounting/checkout',
    cta: 'View Checkout',
    icon: '💳',
  },
]

export default function DemosPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Demo Gallery</h1>
        </div>
        <Link href="/accounting/checkout" className="text-sm text-[#0F4C81] hover:underline">Checkout →</Link>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <p className="text-gray-500 text-sm">Live demos of every IEBC product feature. Use these when presenting to prospects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DEMOS.map(d => (
            <div key={d.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 hover:border-[#0F4C81] hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">{d.icon}</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{d.title}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${d.tagColor}`}>{d.tag}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{d.desc}</p>
              <Link href={d.href}
                className="text-center py-2.5 bg-[#0F4C81] hover:bg-[#082D4F] text-white rounded-xl font-semibold text-sm transition">
                {d.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
