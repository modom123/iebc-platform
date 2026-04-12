'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const plans = [
  { id: 'solo', label: 'Solo', price: '$19/mo', desc: 'Perfect for freelancers and solo operators.' },
  { id: 'business', label: 'Business', price: '$49/mo', desc: 'For growing teams up to 10 people.' },
  { id: 'pro', label: 'Pro', price: '$99/mo', desc: 'Full platform access with priority support.' },
  { id: 'starter', label: 'Starter Bundle', price: '$1,500 + $299/mo', desc: 'Formation + monthly consulting retainer.' },
  { id: 'growth', label: 'Growth Bundle', price: '$3,500 + $499/mo', desc: 'Full formation, accounting & 60-consultant system.' },
]

function CheckoutInner() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')

  const handleCheckout = async (plan: string) => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else if (data.error === 'Unauthorized') {
      window.location.href = '/auth/login'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0F4C81]">Choose Your Plan</h1>
          <p className="text-gray-500 mt-2">Formation · Accounting · 60 Consultants. Cancel anytime.</p>
          {canceled && (
            <p className="mt-3 text-red-600 text-sm font-medium">Payment was canceled. Please try again.</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#0F4C81] hover:shadow-md transition flex flex-col">
              <h3 className="text-xl font-bold">{p.label}</h3>
              <p className="text-2xl font-extrabold text-[#0F4C81] mt-2">{p.price}</p>
              <p className="text-sm text-gray-500 mt-2 flex-1">{p.desc}</p>
              <button
                onClick={() => handleCheckout(p.id)}
                className="btn-primary mt-4 text-center w-full"
              >
                Select {p.label}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>
        </div>
      </div>
    </main>
  )
}

export default function Checkout() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  )
}
