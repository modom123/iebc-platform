'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/accounting'
  const isConsultant = next.includes('/hub/consultants') || next.includes('consultant')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-sm shadow-sm">
        {/* Logo */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-[#0B2140] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px] tracking-tight">IEBC</span>
            </div>
            <span className="font-extrabold text-[#0B2140] text-lg">
              {isConsultant ? 'Consultants' : 'Client Portal'}
            </span>
          </Link>
          <p className="text-gray-500 text-sm">
            {isConsultant ? 'Sign in to the IEBC Consultant Hub' : 'Sign in to your client portal'}
          </p>
          {isConsultant && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0B2140] border border-blue-200">
              <span>🤖</span> IEBC Consultant Access
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-[#0B2140] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error === 'Invalid login credentials'
                ? 'Email or password is incorrect. Check your credentials or reset your password.'
                : error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 shadow-sm"
            style={{ background: '#0B2140', color: '#fff' }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-center">
          {isConsultant ? (
            <p className="text-sm text-gray-500">
              Looking for the client portal?{' '}
              <Link href="/auth/login" className="text-[#0B2140] font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                New subscriber?{' '}
                <Link href="/auth/signup" className="text-[#0B2140] font-semibold hover:underline">
                  Create your account
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                Don&apos;t have a subscription yet?{' '}
                <Link href="/accounting/checkout?plan=silver" className="text-[#C8902A] hover:underline font-medium">
                  Get started from $9/mo →
                </Link>
              </p>
            </>
          )}
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to home</Link>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
