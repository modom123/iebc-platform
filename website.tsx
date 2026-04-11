import Link from 'next/link'
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="sticky top-0 z-50 bg-white/95 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-[#0F4C81]">IEBC</span>
        <div className="flex gap-4 text-sm">
          <Link href="/hub" className="hover:text-[#0F4C81]">👥 Master Hub</Link>
          <Link href="/accounting" className="hover:text-[#0F4C81]">📊 Accounting</Link>
          <Link href="/accounting/checkout" className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#082D4F]">🛒 Get Started</Link>
        </div>
      </nav>
      <header className="py-24 px-6 text-center bg-gradient-to-b from-white to-gray-50">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Stop Working <span className="text-[#0F4C81]">In</span> Your Business.<br>Start Working <span className="text-[#0F4C81]">On</span> It.</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">Formation · Accounting · Hubs · 60 Consultants. Avg. 22 hrs saved/week.</p>
        <Link href="/accounting/checkout" className="bg-[#0F4C81] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#082D4F]">🚀 Get Started</Link>
      </header>
    </main>
  )
}