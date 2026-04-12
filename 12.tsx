'use client'
import { useRouter } from 'next/navigation'

export default function Checkout() {
  const router = useRouter()
  const plans = [
    { id: 'solo', label: 'Solo', price: '$19/mo' },
    { id: 'business', label: 'Business', price: '$49/mo' },
    { id: 'pro', label: 'Pro', price: '$99/mo' },
    { id: 'starter', label: 'Starter Bundle', price: '$1,500 + $299/mo' },
    { id: 'growth', label: 'Growth Bundle', price: '$3,500 + $499/mo' }
  ]

  const handleCheckout = async (plan: string) => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-[#0F4C81] mb-8">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {plans.map(p => (
          <button key={p.id} onClick={() => handleCheckout(p.id)} className="bg-white p-6 rounded-xl border hover:border-[#0F4C81] hover:shadow-md transition text-left">
            <h3 className="text-xl font-bold">{p.label}</h3>
            <p className="text-2xl font-extrabold text-[#0F4C81] mt-2">{p.price}</p>
            <span className="btn-primary mt-4 block text-center">Select {p.label}</span>
          </button>
        ))}
      </div>
    </main>
  )
}