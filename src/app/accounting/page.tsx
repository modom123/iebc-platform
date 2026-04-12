import Link from 'next/link'
export default function Accounting() {
  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#0F4C81]">📊 Efficient by IEBC</h1>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Public Site</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[['Revenue','$24,850'],['Expenses','$9,320'],['Net Profit','$15,530'],['Cash on Hand','$47,200']].map(([l,v],i)=>(
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200"><p className="text-sm text-gray-500">{l}</p><p className="text-2xl font-bold text-green-700">{v}</p></div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Vendor</th><th className="p-3 text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            <tr><td className="p-3">2026-04-03</td><td className="p-3">AWS Cloud</td><td className="p-3 text-right font-mono text-red-600">-$284.00</td></tr>
            <tr><td className="p-3">2026-04-02</td><td className="p-3">Apex Co. Payment</td><td className="p-3 text-right font-mono text-green-600">+$4,200.00</td></tr>
          </tbody></table>
        </div>
      </div>
    </main>
  )
}
