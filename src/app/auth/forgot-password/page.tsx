'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md text-center shadow-sm">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-[#0F4C81] mb-2">Check your inbox</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
          </p>
          <Link href="/auth/login" className="btn-primary inline-block text-sm">Back to Sign In</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0F4C81]">IEBC</h1>
          <p className="text-gray-500 text-sm mt-1">Reset your password</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F4C81] text-white py-3 rounded-lg font-semibold hover:bg-[#082D4F] transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-[#0F4C81] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
