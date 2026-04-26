import Link from 'next/link'

const RESOURCES = [
  {
    category: 'Sales & Onboarding',
    items: [
      { title: 'IEBC Service Overview',          desc: 'What we offer, who we serve, and pricing — ready to share with prospects.',   type: 'Guide',    href: '/efficient' },
      { title: 'Client Intake Process',           desc: 'Step-by-step process for getting a new client from discovery to active.',     type: 'Process',  href: '/hub/intakes' },
      { title: 'Proposal Template',               desc: 'Send a personalized proposal using the outreach templates.',                  type: 'Template', href: '/hub/outreach' },
      { title: '30-Day Free Trial Flow',          desc: 'Walk a prospect through the checkout and account creation process.',          type: 'Flow',     href: '/accounting/checkout' },
    ],
  },
  {
    category: 'Accounting Platform',
    items: [
      { title: 'Setting Up Chart of Accounts',   desc: 'How to configure a client\'s COA on their first day.',                       type: 'Guide',    href: '/accounting/coa' },
      { title: 'Bank Connection via Plaid',       desc: 'Connect a client\'s bank account and start importing transactions.',         type: 'Guide',    href: '/accounting/connect' },
      { title: 'Running Payroll',                 desc: 'Process payroll for salaried and hourly employees with tax calculations.',   type: 'Guide',    href: '/accounting/payroll' },
      { title: 'Generating Financial Reports',    desc: 'P&L, balance sheet, and cash flow — how to read and share with clients.',   type: 'Guide',    href: '/accounting/reports' },
    ],
  },
  {
    category: 'Business Formation',
    items: [
      { title: 'LLC Formation Checklist',         desc: 'Complete checklist for forming an LLC in any US state.',                    type: 'Checklist', href: '/hub/formation' },
      { title: 'S-Corp vs LLC Comparison',        desc: 'Help clients choose the right entity type for their situation.',            type: 'Guide',     href: '/hub/formation' },
    ],
  },
  {
    category: 'Growth & Operations',
    items: [
      { title: '52-Week Growth Plan',             desc: 'The IEBC annual roadmap for building a 7-figure consulting business.',      type: 'Plan',     href: '/hub/plan52' },
      { title: 'Outreach Templates',              desc: 'Email templates for intro, follow-up, and proposal outreach.',              type: 'Templates',href: '/hub/outreach' },
      { title: 'Revenue & MRR Dashboard',         desc: 'Track monthly recurring revenue, outstanding invoices, and net profit.',   type: 'Tool',     href: '/hub/revenue' },
    ],
  },
]

const TYPE_COLORS: Record<string, string> = {
  Guide:     'bg-blue-50 text-blue-700',
  Process:   'bg-purple-50 text-purple-700',
  Template:  'bg-amber-50 text-amber-700',
  Templates: 'bg-amber-50 text-amber-700',
  Flow:      'bg-green-50 text-green-700',
  Checklist: 'bg-orange-50 text-orange-700',
  Plan:      'bg-red-50 text-red-700',
  Tool:      'bg-cyan-50 text-cyan-700',
}

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Build Library</h1>
        </div>
        <Link href="/hub/demos" className="text-sm text-[#0F4C81] hover:underline">Demo Gallery →</Link>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <p className="text-gray-500 text-sm">Guides, templates, and resources for running the IEBC consulting business.</p>

        {RESOURCES.map(section => (
          <div key={section.category}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{section.category}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.items.map(item => (
                <Link key={item.title} href={item.href}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#0F4C81] hover:shadow-sm transition group flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800 text-sm group-hover:text-[#0F4C81] transition">{item.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-500'}`}>{item.type}</span>
                    <span className="text-gray-300 group-hover:text-[#0F4C81] text-sm transition">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
