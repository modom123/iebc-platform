'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Suspense } from 'react'

// Fallback direct Stripe payment links (used if price IDs not configured in Stripe dashboard)
const STRIPE_LINKS: Record<string, string> = {
  silver:   process.env.NEXT_PUBLIC_STRIPE_LINK_SILVER   || 'https://buy.stripe.com/dRm7sF9Hr6kNbx0frVgEg03',
  gold:     process.env.NEXT_PUBLIC_STRIPE_LINK_GOLD     || 'https://buy.stripe.com/4gM8wJ8Dn10teJc6VpgEg02',
  platinum: process.env.NEXT_PUBLIC_STRIPE_LINK_PLATINUM || 'https://buy.stripe.com/bJe14h1aVeRj58CfrVgEg01',
}

const plans = [
  {
    id: 'silver',
    label: 'Silver',
    price: '$9',
    period: '/mo',
    consultants: 0,
    users: 1,
    highlight: false,
    features: [
      'Full accounting dashboard',
      'Income & expense tracking',
      'Invoices & estimates',
      'AI receipt scanner',
      'Mileage & time tracker',
      'Reports (P&L, cash flow)',
      'CSV export',
      'Email support',
    ],
  },
  {
    id: 'gold',
    label: 'Gold',
    price: '$22',
    period: '/mo',
    consultants: 3,
    users: 5,
    highlight: true,
    features: [
      'Everything in Silver',
      '3 IEBC consultants assigned',
      'Up to 5 team users',
      'Lead pipeline & CRM',
      'Task management',
      'Budgets & reconciliation',
      'Auto-categorization rules',
      'Priority support',
    ],
  },
  {
    id: 'platinum',
    label: 'Platinum',
    price: '$42',
    period: '/mo',
    consultants: 5,
    users: 10,
    highlight: false,
    features: [
      'Everything in Gold',
      '5 IEBC consultants assigned',
      'Up to 10 team users',
      'Business formation wizard',
      'Tax center & obligations',
      'Projects & job costing',
      'AI workforce dispatch',
      'Dedicated account manager',
    ],
  },
]

function CheckoutInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const canceled = searchParams.get('canceled')
  const preselected = searchParams.get('plan') || ''

  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
      }
      setAuthChecked(true)
    })
  }, [])

  const handleCheckout = async (planId: string) => {
    if (!authChecked) return

    // If not logged in, redirect to login with redirect back to checkout
    if (!userId) {
      router.push(`/auth/login?redirect=/accounting/checkout?plan=${planId}`)
      return
    }

    setCheckingOut(planId)
    setCheckoutError('')

    try {
      // Try server-side Stripe Checkout Session (passes user_id metadata to webhook)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (res.ok) {
        const { url } = await res.json()
        if (url) {
          window.location.href = url
          return
        }
      }

      // Fallback: direct Stripe payment link (metadata won't be captured, but payment goes through)
      const link = STRIPE_LINKS[planId]
      if (link) {
        window.location.href = link
      } else {
        setCheckoutError('Checkout is not available right now. Please contact support.')
        setCheckingOut(null)
      }
    } catch {
      setCheckoutError('An error occurred. Please try again.')
      setCheckingOut(null)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0F4C81]">Choose Your Plan</h1>
          <p className="text-gray-500 mt-2">
            Accounting · AI Scanner · Consultants · Business Growth
          </p>
          {canceled && (
            <p className="mt-3 text-red-600 text-sm font-medium">
              Payment was canceled. Please try again.
            </p>
          )}
          {checkoutError && (
            <p className="mt-3 text-red-600 text-sm font-medium">{checkoutError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map(p => {
            const isPreselected = preselected === p.id
            const isProcessing = checkingOut === p.id
            return (
              <div
                key={p.id}
                className={`bg-white rounded-xl border flex flex-col transition ${
                  p.highlight || isPreselected
                    ? 'border-[#0F4C81] shadow-xl scale-105'
                    : 'border-gray-200 hover:border-[#0F4C81] hover:shadow-md'
                }`}
              >
                {(p.highlight || isPreselected) && (
                  <div className="bg-[#0F4C81] text-white text-xs font-bold text-center py-1.5 rounded-t-xl tracking-widest uppercase">
                    {isPreselected && !p.highlight ? 'Your Selection' : 'Most Popular'}
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
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout(p.id)}
                    disabled={!!checkingOut}
                    className={`w-full py-3 rounded-lg font-semibold transition text-sm disabled:opacity-60 ${
                      p.highlight || isPreselected
                        ? 'bg-[#0F4C81] text-white hover:bg-[#082D4F]'
                        : 'border-2 border-[#0F4C81] text-[#0F4C81] hover:bg-blue-50'
                    }`}
                  >
                    {isProcessing ? 'Redirecting to Stripe...' : `Get ${p.label}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {!userId && authChecked && (
          <p className="text-center text-sm text-gray-500 mt-6">
            You&apos;ll be asked to sign in or create an account before completing your purchase.
          </p>
        )}

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
