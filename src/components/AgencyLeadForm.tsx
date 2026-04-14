'use client'

import { useState } from 'react'

export default function AgencyLeadForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    business_name: '',
    industry: '',
    service_interest: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'agency_homepage' }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl"
          style={{ background: '#C8902A', color: '#fff' }}>✓</div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#0B2140' }}>
          We'll be in touch soon.
        </h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Expect a reply within 24 hours. In the meantime, you can book your strategy call directly:
        </p>
        <a
          href="https://calendly.com/new56money/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg"
          style={{ background: '#C8902A', color: '#fff' }}
        >
          Book Your Strategy Call →
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0B2140' }}>
            Your Name
          </label>
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="John Smith"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0B2140' }}>
            Email Address *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="john@company.com"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0B2140' }}>
            Business Name
          </label>
          <input
            value={form.business_name}
            onChange={e => update('business_name', e.target.value)}
            placeholder="Acme LLC"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0B2140' }}>
            Industry
          </label>
          <select
            value={form.industry}
            onChange={e => update('industry', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-white"
          >
            <option value="">Select industry</option>
            <option value="logistics">Logistics &amp; Trucking</option>
            <option value="contractor">Contractors &amp; 1099</option>
            <option value="creative">Creative &amp; Freelance</option>
            <option value="retail">Retail &amp; E-commerce</option>
            <option value="restaurant">Restaurant &amp; Food</option>
            <option value="nonprofit">Nonprofit</option>
            <option value="sports">Sports &amp; NIL</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0B2140' }}>
          What service are you most interested in?
        </label>
        <select
          value={form.service_interest}
          onChange={e => update('service_interest', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-white"
        >
          <option value="">Select service</option>
          <option value="formation">Business Formation</option>
          <option value="website">Intelligent Website</option>
          <option value="hub">Automated Business Hub</option>
          <option value="infrastructure">Business Infrastructure</option>
          <option value="consultants">IEBC Consultants</option>
          <option value="all">All Services — Full Build</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0B2140' }}>
          What&apos;s your biggest business challenge?
        </label>
        <textarea
          value={form.message}
          onChange={e => update('message', e.target.value)}
          rows={3}
          placeholder="Tell us about your current situation and what you're trying to achieve..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          Something went wrong. Please try again or{' '}
          <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer"
            className="underline font-semibold">book directly</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-xl font-bold text-base transition shadow-lg disabled:opacity-60"
        style={{ background: '#C8902A', color: '#fff' }}
      >
        {status === 'loading' ? 'Sending...' : 'Get My Free Strategy Call →'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Or book directly:{' '}
        <a
          href="https://calendly.com/new56money/30min"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#C8902A', textDecoration: 'underline' }}
        >
          calendly.com/new56money/30min
        </a>
      </p>
    </form>
  )
}
