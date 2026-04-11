import Link from 'next/link'
export default function SmartNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#0F4C81]">IEBC</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/hub" className="hover:text-[#0F4C81]">Hub</Link>
          <Link href="/accounting" className="hover:text-[#0F4C81]">Accounting</Link>
          <Link href="/accounting/checkout" className="bg-[#0F4C81] text-white px-3 py-1.5 rounded">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}
