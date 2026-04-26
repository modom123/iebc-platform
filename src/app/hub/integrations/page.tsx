import Link from 'next/link'

const INTEGRATIONS = [
  {
    category: 'Active — Built In',
    items: [
      { name: 'Stripe',    icon: '💳', desc: 'Payments, subscriptions, and invoicing. Powers the Efficient checkout and client invoicing.', status: 'active',  href: '/accounting/invoices' },
      { name: 'Supabase',  icon: '🗄️', desc: 'Database and authentication. All client data, accounts, and transactions stored here.',       status: 'active',  href: '/settings' },
      { name: 'Plaid',     icon: '🏦', desc: 'Bank account connection. Imports real-time transactions from 12,000+ banks.',                  status: 'active',  href: '/accounting/connect' },
      { name: 'Claude AI', icon: '🤖', desc: 'AI receipt scanner, advisor workspace, and AI consultant workforce.',                          status: 'active',  href: '/accounting/scanner' },
      { name: 'ElevenLabs',icon: '🎙️', desc: 'High-quality AI voice for the Advisor Workspace.',                                            status: 'active',  href: '/hub/workspace' },
    ],
  },
  {
    category: 'Available — Configure in Vercel',
    items: [
      { name: 'Resend',    icon: '📧', desc: 'Transactional email. Welcome emails, invoice notifications, and password resets.',             status: 'config',  href: 'https://resend.com' },
    ],
  },
  {
    category: 'Roadmap — Coming Soon',
    items: [
      { name: 'QuickBooks Sync', icon: '📊', desc: 'Two-way sync with QuickBooks for clients who need it.',         status: 'roadmap', href: '#' },
      { name: 'Gusto Payroll',   icon: '💼', desc: 'Full-service payroll processing with direct deposit.',           status: 'roadmap', href: '#' },
      { name: 'Zapier',          icon: '⚡', desc: 'Connect Efficient to 6,000+ apps with no code.',                status: 'roadmap', href: '#' },
      { name: 'DocuSign',        icon: '✍️', desc: 'E-signatures for contracts and proposals.',                     status: 'roadmap', href: '#' },
      { name: 'Google Calendar', icon: '📅', desc: 'Sync due dates and tax deadlines to Google Calendar.',          status: 'roadmap', href: '#' },
    ],
  },
]

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  active:  { label: 'Active',     cls: 'bg-green-100 text-green-700' },
  config:  { label: 'Configure',  cls: 'bg-yellow-100 text-yellow-700' },
  roadmap: { label: 'Coming Soon',cls: 'bg-gray-100 text-gray-500' },
}

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Vendor Integrations</h1>
        </div>
        <Link href="/settings" className="text-sm text-[#0F4C81] hover:underline">Settings →</Link>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <p className="text-gray-500 text-sm">All third-party services connected to the IEBC platform.</p>

        {INTEGRATIONS.map(section => (
          <div key={section.category}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{section.category}</p>
            <div className="space-y-3">
              {section.items.map(item => {
                const s = STATUS_STYLES[item.status]
                const isExternal = item.href.startsWith('http')
                const Tag = isExternal ? 'a' : Link
                const props = isExternal
                  ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: item.href }
                return (
                  // @ts-expect-error dynamic tag
                  <Tag key={item.name} {...props}
                    className={`flex items-center gap-5 bg-white rounded-xl border p-5 transition ${item.status !== 'roadmap' ? 'border-gray-200 hover:border-[#0F4C81] hover:shadow-sm cursor-pointer' : 'border-gray-100 opacity-60 cursor-default'}`}>
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.cls}`}>{s.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                    {item.status !== 'roadmap' && <span className="text-gray-300 text-sm shrink-0">→</span>}
                  </Tag>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
