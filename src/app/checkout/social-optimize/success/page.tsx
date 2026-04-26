import Link from 'next/link'

const DARK = '#0B2140'
const ACCENT = '#D946EF'
const GOLD = '#C8902A'

export default function SocialOptimizeSuccess() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#F8F6F1' }}>
      <div className="max-w-lg w-full text-center">

        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: ACCENT }}>
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GOLD }}>Down Payment Received</p>
        <h1 className="text-3xl font-extrabold mb-4" style={{ color: DARK }}>Your campaign is launching!</h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          Your 25% down payment was processed. Your dedicated IEBC Social Optimize team will reach out within 1–2 business days to kick off your strategy session.
        </p>

        {/* Milestones */}
        <div className="rounded-2xl p-6 mb-6 text-left" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
          <p className="font-bold text-sm mb-4" style={{ color: DARK }}>Payment Milestones</p>
          <div className="space-y-3">
            {[
              { label: 'Down Payment', timing: 'Paid today ✓', pct: '25%', color: '#16a34a', done: true },
              { label: 'Campaign Launch', timing: 'Invoiced when campaign goes live', pct: '50%', color: GOLD, done: false },
              { label: 'First Month Complete', timing: 'Invoiced at day 30', pct: '25%', color: '#6b7280', done: false },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between text-sm gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold" style={{ background: m.color }}>
                    {m.done ? '✓' : (i + 1)}
                  </div>
                  <div>
                    <p className={`font-semibold ${m.done ? 'text-green-700' : 'text-gray-700'}`}>{m.label}</p>
                    <p className="text-xs text-gray-400">{m.timing}</p>
                  </div>
                </div>
                <span className="font-bold shrink-0" style={{ color: m.color }}>{m.pct}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 border-t pt-3" style={{ borderColor: '#f3f4f6' }}>
            Monthly retainer begins after your campaign launches.
          </p>
        </div>

        {/* What happens next */}
        <div className="rounded-2xl p-6 mb-8 text-left space-y-4" style={{ background: DARK }}>
          <p className="font-bold text-sm text-white">What happens next:</p>
          {[
            { step: '1', label: 'Strategy call scheduled', desc: 'We reach out in 1–2 business days to book your onboarding call and audit your current presence.' },
            { step: '2', label: 'Content strategy built', desc: 'Your IEBC team creates your content calendar, captions, and graphics tailored to your audience.' },
            { step: '3', label: 'Campaigns go live', desc: 'Posts scheduled and published across your platforms. Engagement monitoring starts immediately.' },
            { step: '4', label: 'Monthly reporting', desc: 'You receive a full analytics report every month — growth, reach, engagement, and what\'s next.' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: ACCENT, color: '#fff' }}>
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/hub/social" className="px-7 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-md" style={{ background: ACCENT }}>
            Go to Social Dashboard →
          </Link>
          <Link href="/" className="px-7 py-3 rounded-xl font-bold text-sm border-2 transition-colors hover:text-white" style={{ borderColor: DARK, color: DARK }}>
            Back to Homepage
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Questions?{' '}
          <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="underline">Book a call</a>{' '}
          with your Social Optimize manager.
        </p>
      </div>
    </main>
  )
}
