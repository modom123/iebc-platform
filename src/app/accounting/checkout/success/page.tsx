import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">You&apos;re in!</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Your subscription is confirmed. Your 7-day free trial starts now — no charge until day 8.
        </p>

        {/* What happens next */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left mb-6 space-y-4">
          <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">What happens next</p>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0F4C81] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Check your email</p>
              <p className="text-xs text-gray-500 mt-0.5">We&apos;re setting up your account now. You&apos;ll receive an email with a link to create your password and log in — usually within a few minutes.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0F4C81] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Set your password & log in</p>
              <p className="text-xs text-gray-500 mt-0.5">Click the link in your email, set a password, and you&apos;re inside the Efficient SaaS platform.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0F4C81] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Your AI consultants are ready</p>
              <p className="text-xs text-gray-500 mt-0.5">Your assigned IEBC AI consultants are already available in the Hub. Ask them anything about your business.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#0F4C81] hover:bg-[#082D4F] text-white transition shadow-lg block text-center"
          >
            Go to Login →
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 transition block text-center"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Questions? Email us at{' '}
          <a href="mailto:support@iebusinessconsultants.com" className="text-[#0F4C81] hover:underline">
            support@iebusinessconsultants.com
          </a>
        </p>
      </div>
    </main>
  )
}
