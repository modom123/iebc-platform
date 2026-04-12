import Link from 'next/link'
export default function Checkout() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-lg w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-[#0F4C81]">🛒 Choose Your Plan</h1>
        <div className="grid grid-cols-3 gap-3">
          {['Solo $19/mo','Business $49/mo','Pro $99/mo'].map(p=>(
            <button key={p} className="p-4 border rounded-lg hover:border-[#0F4C81] hover:bg-blue-50 text-sm font-medium">{p}</button>
          ))}
        </div>
        <Link href="/accounting" className="block w-full bg-[#0F4C81] text-white py-3 rounded-lg font-semibold hover:bg-[#082D4F]">Continue to Payment →</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>
      </div>
    </main>
  )
}
