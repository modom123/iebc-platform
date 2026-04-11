import Link from 'next/link'
export default function Hub() {
  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#0F4C81]">🏢 IEBC Master Hub</h1>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Public Site</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[['Active Builds','0'],['Hot Leads','400'],['Tasks Due','0'],['MRR Target','$10M']].map(([l,v],i)=>(
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200"><p className="text-sm text-gray-500">{l}</p><p className="text-2xl font-bold">{v}</p></div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4">🤖 AI Workforce (60 System)</h3>
          <p className="text-sm text-gray-600">Department routing, task dispatch, and approval loop wired. Ready for Supabase sync.</p>
        </div>
      </div>
    </main>
  )
}