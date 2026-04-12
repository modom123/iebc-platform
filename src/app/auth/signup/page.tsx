'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PLAN_LABELS: Record<string, string> = {
  silver: 'Silver — $9/mo',
  gold: 'Gold — $22/mo',
  platinum: 'Platinum — $42/mo',
}

function SignupInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || ''
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Build post-confirm redirect: if plan selected, go to checkout; else go to hub
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const next = plan ? `/accounting/checkout?plan=${plan}` : '/hub'
    const emailRedirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md text-center shadow-sm">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-[#0F4C81] mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">
            We sent a confirmation link to <strong>{email}</strong>.
            {plan
              ? ` Click it to confirm your account — you'll be taken straight to checkout for the ${PLAN_LABELS[plan] || plan} plan.`
              : ' Click it to activate your account, then sign in.'}
          </p>
          <Link href="/auth/login" className="btn-primary mt-6 inline-block">Go to Sign In</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0F4C81]">IEBC</h1>
          <p className="text-gray-500 text-sm mt-1">
            {plan ? `Sign up to get the ${PLAN_LABELS[plan] || plan} plan` : 'Create your account'}
          </p>
          {plan && (
            <div className="mt-2 inline-block bg-blue-50 text-[#0F4C81] text-xs font-semibold px-3 py-1 rounded-full">
              {PLAN_LABELS[plan] || plan}
            </div>
          )}
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              placeholder="Min. 8 characters"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F4C81] text-white py-3 rounded-lg font-semibold hover:bg-[#082D4F] transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : plan ? `Create Account & Choose ${PLAN_LABELS[plan]?.split(' —')[0] || 'Plan'}` : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href={`/auth/login${plan ? `?redirect=/accounting/checkout?plan=${plan}` : ''}`} className="text-[#0F4C81] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
        <div className="text-center mt-3">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to home</Link>
        </div>
      </div>
    </main>
  )
}

export default function Signup() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  )
}
