'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BundleSuccessPage() {
  const [bundle, setBundle] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const label = params.get('bundle') || 'Your Bundle'
      setBundle(label)
    }
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8F6F1' }}>
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: '#0B2140' }}>
          <span className="text-white text-3xl font-black">✓</span>
        </div>

        <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#0B2140' }}>Down payment received!</h1>
        <p className="text-gray-500 mb-8">
          Your <span className="font-semibold text-gray-700">{bundle}</span> is locked in.
          You&apos;ll hear from us within 24 hours to schedule your kickoff call.
        </p>

        {/* Milestone tracker */}
        <div className="rounded-2xl overflow-hidden border mb-8 bg-white text-left" style={{ borderColor: '#e5e7eb' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#e5e7eb', background: '#F8F6F1' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C8902A' }}>Build Milestones</p>
          </div>
          <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
            {[
              {
                step: '01',
                title: 'Down Payment',
                desc: 'Paid — your spot is confirmed.',
                done: true,
              },
              {
                step: '02',
                title: 'Kickoff Call',
                desc: 'We review your requirements and create your custom build plan.',
                done: false,
              },
              {
                step: '03',
                title: 'Build & Deploy (50% invoiced)',
                desc: 'We build your website, hub, and connect your accounting — second payment due here.',
                done: false,
              },
              {
                step: '04',
                title: 'Final Delivery (25% invoiced)',
                desc: 'Full handoff, team onboarding, and go-live — final payment due here.',
                done: false,
              },
              {
                step: '05',
                title: 'Monthly Retainer Begins',
                desc: 'Ongoing hosting, support, and AI consultant access.',
                done: false,
              },
            ].map((m, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-extrabold"
                  style={{
                    background: m.done ? '#0B2140' : '#f3f4f6',
                    color: m.done ? '#fff' : '#9ca3af',
                  }}
                >
                  {m.done ? '✓' : m.step}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: m.done ? '#0B2140' : '#374151' }}>{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="https://calendly.com/new56money/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 shadow-lg block"
            style={{ background: '#C8902A' }}
          >
            Schedule Your Kickoff Call →
          </a>
          <Link
            href="/"
            className="w-full py-3 rounded-xl font-semibold text-sm text-center border transition-colors hover:bg-gray-50 block"
            style={{ borderColor: '#0B2140', color: '#0B2140' }}
          >
            Back to IEBC Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Questions? Email us at{' '}
          <a href="mailto:info@iebconsultants.com" className="underline" style={{ color: '#0B2140' }}>
            info@iebconsultants.com
          </a>
        </p>
      </div>
    </main>
  )
}
