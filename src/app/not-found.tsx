import Link from 'next/link'

const QUICK_LINKS = [
  { href: '/accounting',              icon: '◈', label: 'Accounting Dashboard' },
  { href: '/accounting/invoices',     icon: '▤', label: 'Invoices' },
  { href: '/accounting/transactions', icon: '⇄', label: 'Transactions' },
  { href: '/accounting/reports',      icon: '▦', label: 'Reports' },
  { href: '/efficient',               icon: '⚡', label: 'Efficient — Pricing' },
  { href: '/',                        icon: '🏠', label: 'IEBC Home' },
]

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-10 h-10 bg-[#0F4C81] rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-black text-[11px] tracking-tight">IEBC</span>
        </div>
        <div className="leading-tight">
          <p className="text-[#0F4C81] font-extrabold text-base tracking-tight">IEBC</p>
          <p className="text-gray-400 text-[10px] font-medium">Business Infrastructure</p>
        </div>
      </Link>

      <div className="w-full max-w-lg">
        {/* Main card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center mb-6">

          {/* 404 graphic */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center">
              <span className="text-5xl font-black text-[#0F4C81] leading-none">?</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#C9A02E] rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-black">!</span>
            </div>
          </div>

          <p className="text-xs font-bold text-[#C9A02E] uppercase tracking-widest mb-2">404 — Page Not Found</p>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
            We can&apos;t find that page
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            The page you&apos;re looking for may have moved, been renamed, or doesn&apos;t exist.
            Here are some places to start:
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/accounting"
              className="bg-[#0F4C81] hover:bg-[#082D4F] text-white px-6 py-3 rounded-xl font-semibold text-sm transition shadow-sm"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="border-2 border-gray-200 hover:border-[#0F4C81] hover:text-[#0F4C81] text-gray-600 px-6 py-3 rounded-xl font-semibold text-sm transition"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
            Quick Links
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map(({ href, icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-[#0F4C81] transition group"
              >
                <span className="text-base w-5 text-center shrink-0 text-gray-400 group-hover:text-[#0F4C81]">{icon}</span>
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Need help?{' '}
          <a href="mailto:info@iebusinessconsultants.com" className="text-[#0F4C81] hover:underline font-medium">
            info@iebusinessconsultants.com
          </a>
        </p>
      </div>
    </main>
  )
}
