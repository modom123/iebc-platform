'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-10 h-10 bg-[#0F4C81] rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-black text-[11px] tracking-tight">IEBC</span>
        </div>
        <div className="leading-tight">
          <p className="text-[#0F4C81] font-extrabold text-base tracking-tight">IEBC</p>
          <p className="text-gray-400 text-[10px] font-medium">Business Infrastructure</p>
        </div>
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center">

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
          </div>

          <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Server Error</p>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Something went wrong</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-2 max-w-sm mx-auto">
            An unexpected error occurred. This has been logged and we&apos;ll look into it.
          </p>

          {error.digest && (
            <p className="text-xs text-gray-300 font-mono mb-6">Error ID: {error.digest}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={reset}
              className="bg-[#0F4C81] hover:bg-[#082D4F] text-white px-6 py-3 rounded-xl font-semibold text-sm transition shadow-sm"
            >
              Try Again
            </button>
            <Link
              href="/accounting"
              className="border-2 border-gray-200 hover:border-[#0F4C81] hover:text-[#0F4C81] text-gray-600 px-6 py-3 rounded-xl font-semibold text-sm transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          If this keeps happening, email{' '}
          <a href="mailto:info@iebusinessconsultants.com" className="text-[#0F4C81] hover:underline font-medium">
            info@iebusinessconsultants.com
          </a>
        </p>
      </div>
    </main>
  )
}
