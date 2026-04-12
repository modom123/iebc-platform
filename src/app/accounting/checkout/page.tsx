'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const plans = [
  {
    id: 'silver',
    label: 'Silver',
    price: '$9',
    period: '/mo',
    consultants: 0,
    users: 1,
    features: [
      'Core accounting dashboard',
      'Income & expense tracking',
      'Transaction history',
      'Monthly financial summary',
      'Email support',
    ],
    link: process.env.NEXT_PUBLIC_STRIPE_LINK_SILVER || 'https://buy.stripe.com/dRm7sF9Hr6kNbx0frVgEg03',
    highlight: false,
  },
  {
    id: 'gold',
    label: 'Gold',
    price: '$22',
    period: '/mo',
    consultants: 3,
    users: 5,
    features: [
      'Everything in Silver',
      '3 IEBC consultants assigned',
      'Up to 5 team users',
      'Invoice generation',
      'Lead pipeline access',
      'Priority support',
    ],
    link: process.env.NEXT_PUBLIC_STRIPE_LINK_GOLD || 'https://buy.stripe.com/4gM8wJ8Dn10teJc6VpgEg02',
    highlight: true,
  },
  {
    id: 'platinum',
    label: 'Platinum',
    price: '$42',
    period: '/mo',
    consultants: 5,
    users: 10,
    features: [
      'Everything in Gold',
      '5 IEBC consultants assigned',
      'Up to 10 team users',
      'Full accounting suite',
      'Business formation support',
      'AI workforce dispatch',
      'Dedicated account manager',
    ],
    link: 'https://buy.stripe.com/bJe14h1aVeRj58CfrVgEg01',
    highlight: false,
  },
]

function CheckoutInner() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')

  const handleCheckout = (plan: typeof plans[0]) => {
    if (plan.link) {
      window.location.href = plan.link
    } else {
      alert(`${plan.label} plan coming soon. Please select Platinum or contact support.`)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0F4C81]">Choose Your Plan</h1>
          <p className="text-gray-500 mt-2">
            Efficient by IEBC — Accounting · Consultants · Business Growth
          </p>
          {canceled && (
            <p className="mt-3 text-red-600 text-sm font-medium">
              Payment was canceled. Please try again.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div
              key={p.id}
              className={`bg-white rounded-xl border flex flex-col transition ${
                p.highlight
                  ? 'border-[#0F4C81] shadow-lg scale-105'
                  : 'border-gray-200 hover:border-[#0F4C81] hover:shadow-md'
              }`}
            >
              {p.highlight && (
                <div className="bg-[#0F4C81] text-white text-xs font-bold text-center py-1.5 rounded-t-xl tracking-widest uppercase">
                  Most Popular
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-800">{p.label}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-4xl font-extrabold text-[#0F4C81]">{p.price}</span>
                  <span className="text-gray-500 text-sm">{p.period}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  {p.consultants > 0 ? `${p.consultants} IEBC consultants · ` : ''}
                  Up to {p.users} user{p.users > 1 ? 's' : ''}
                </p>
                <ul className="space-y-2 flex-1 mb-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(p)}
                  className={`w-full py-3 rounded-lg font-semibold transition text-sm ${
                    p.highlight
                      ? 'bg-[#0F4C81] text-white hover:bg-[#082D4F]'
                      : 'border-2 border-[#0F4C81] text-[#0F4C81] hover:bg-blue-50'
                  }`}
                >
                  {p.link ? `Get ${p.label}` : 'Coming Soon'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          All plans billed monthly. Cancel anytime. Secure payments via Stripe.
        </p>
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
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
