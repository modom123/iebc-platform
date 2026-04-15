import Link from 'next/link'

export default function FormationCheckoutSuccess() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8F6F1' }}>
      <div className="max-w-lg w-full text-center">

        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ background: '#0B2140' }}
        >
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#C8902A' }}>
          Payment Confirmed
        </p>
        <h1 className="text-3xl font-extrabold mb-4" style={{ color: '#0B2140' }}>
          You&apos;re all set!
        </h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          Your formation order has been received and your payment was processed successfully.
          Our team will begin working on your documents immediately.
          <br /><br />
          <span className="font-semibold text-gray-800">
            Expect to hear from us within 1 business day
          </span>{' '}
          with a project update and your document delivery timeline.
        </p>

        {/* What happens next */}
        <div
          className="rounded-2xl p-6 mb-8 text-left space-y-4"
          style={{ background: '#fff', border: '1px solid #e5e7eb' }}
        >
          <p className="font-bold text-sm" style={{ color: '#0B2140' }}>What happens next:</p>
          {[
            { step: '1', label: 'Order confirmation email sent', desc: 'Check your inbox for a receipt and order summary.' },
            { step: '2', label: 'IEBC team reviews your order', desc: 'We verify your information and assign your formation specialist.' },
            { step: '3', label: 'Documents filed & delivered', desc: 'Formation documents completed within 5–10 business days.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                style={{ background: '#C8902A' }}
              >
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-7 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-md"
            style={{ background: '#0B2140' }}
          >
            Back to Homepage
          </Link>
          <Link
            href="/auth/signup"
            className="px-7 py-3 rounded-xl font-bold text-sm border-2 transition-colors hover:bg-[#0B2140] hover:text-white"
            style={{ borderColor: '#0B2140', color: '#0B2140' }}
          >
            Create Your IEBC Account →
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Questions? Email us or{' '}
          <a
            href="https://calendly.com/new56money/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            book a call
          </a>.
        </p>
      </div>
    </main>
  )
}
