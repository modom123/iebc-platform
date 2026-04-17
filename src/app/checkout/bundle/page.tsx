'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const DARK = '#0B2140'
const GOLD = '#C9A02E'

const PLAN_CONFIG = {
  starter: { name: 'Starter Bundle', setup: 1500, monthly: 299, maxAdvisors: 5 },
  growth:  { name: 'Growth Bundle',  setup: 3500, monthly: 499, maxAdvisors: 10 },
  pro:     { name: 'Pro Bundle',     setup: 6500, monthly: 799, maxAdvisors: 20 },
}

const DURATION_OPTIONS = [
  { months: 1,  label: '1 Month',   discount: 0  },
  { months: 3,  label: '3 Months',  discount: 10 },
  { months: 6,  label: '6 Months',  discount: 20 },
  { months: 12, label: '12 Months', discount: 30 },
]

type Advisor = { id: string; name: string; title: string; deptName: string }

const DEPARTMENTS = [
  { id: 'finance', name: 'Finance & Accounting', icon: '💼', color: '#0F4C81',
    advisors: [
      { id: 'f1', name: 'Marcus Webb',    title: 'CFO Advisor' },
      { id: 'f2', name: 'Priya Sharma',   title: 'Tax Strategist' },
      { id: 'f3', name: 'David Chen',     title: 'Bookkeeping Expert' },
      { id: 'f4', name: 'Rachel Torres',  title: 'Cash Flow Analyst' },
      { id: 'f5', name: 'James Okafor',   title: 'Payroll Specialist' },
    ] },
  { id: 'marketing', name: 'Marketing & Sales', icon: '📣', color: '#7C3AED',
    advisors: [
      { id: 'm1', name: 'Sofia Reyes',     title: 'Brand Strategist' },
      { id: 'm2', name: 'Tyler Nash',      title: 'SEO Specialist' },
      { id: 'm3', name: 'Amara Johnson',   title: 'Social Media Manager' },
      { id: 'm4', name: 'Kevin Park',      title: 'Paid Advertising' },
      { id: 'm5', name: 'Lisa Hernandez',  title: 'Sales Coach' },
    ] },
  { id: 'operations', name: 'Operations', icon: '⚙️', color: '#059669',
    advisors: [
      { id: 'o1', name: 'Robert Kim',    title: 'Operations Manager' },
      { id: 'o2', name: 'Dana White',    title: 'Supply Chain Expert' },
      { id: 'o3', name: 'Marcus Fields', title: 'Project Manager' },
      { id: 'o4', name: 'Nina Patel',    title: 'Process Improvement' },
    ] },
  { id: 'legal', name: 'Legal & Compliance', icon: '⚖️', color: '#DC2626',
    advisors: [
      { id: 'l1', name: 'Jennifer Moss',  title: 'Business Attorney' },
      { id: 'l2', name: 'Carlos Rivera',  title: 'Contract Specialist' },
      { id: 'l3', name: 'Sandra Liu',     title: 'Compliance Officer' },
      { id: 'l4', name: 'Aaron Banks',    title: 'IP Advisor' },
    ] },
  { id: 'hr', name: 'HR & People', icon: '👥', color: '#D97706',
    advisors: [
      { id: 'h1', name: 'Michelle Grant',   title: 'HR Director' },
      { id: 'h2', name: 'Derek Thompson',   title: 'Recruiting Specialist' },
      { id: 'h3', name: 'Yuki Tanaka',      title: 'Culture Advisor' },
      { id: 'h4', name: 'Christine Lee',    title: 'Training & Development' },
    ] },
  { id: 'technology', name: 'Technology', icon: '💻', color: '#0891B2',
    advisors: [
      { id: 't1', name: 'Alex Morgan',    title: 'CTO Advisor' },
      { id: 't2', name: 'Raj Gupta',      title: 'Cybersecurity Expert' },
      { id: 't3', name: 'Emma Walsh',     title: 'Software Architect' },
      { id: 't4', name: 'Chris Brown',    title: 'Data Analyst' },
      { id: 't5', name: 'Maya Robinson',  title: 'AI Integration' },
    ] },
  { id: 'strategy', name: 'Strategy & Growth', icon: '♟️', color: '#6D28D9',
    advisors: [
      { id: 's1', name: 'Brian Foster',   title: 'Business Strategist' },
      { id: 's2', name: 'Natasha Green',  title: 'Growth Expert' },
      { id: 's3', name: 'William Hayes',  title: 'M&A Advisor' },
      { id: 's4', name: 'Alicia Monroe',  title: 'Franchise Consultant' },
    ] },
  { id: 'industry', name: 'Industry Specialists', icon: '🏆', color: '#0F766E',
    advisors: [
      { id: 'i1', name: 'Gregory Stone',      title: 'Real Estate Advisor' },
      { id: 'i2', name: 'Dr. Sarah Mitchell', title: 'Healthcare Consultant' },
      { id: 'i3', name: 'Jason Wu',           title: 'E-commerce Expert' },
      { id: 'i4', name: 'Maria Santos',       title: 'Restaurant & Food' },
    ] },
]

function BundleContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [planId, setPlanId] = useState<keyof typeof PLAN_CONFIG>('growth')
  const [deptId, setDeptId] = useState(DEPARTMENTS[0].id)
  const [selected, setSelected] = useState<(Advisor & { deptName: string })[]>([])
  const [duration, setDuration] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const p = searchParams.get('plan') as keyof typeof PLAN_CONFIG
    if (p && PLAN_CONFIG[p]) setPlanId(p)
  }, [searchParams])

  const plan = PLAN_CONFIG[planId]
  const dept = DEPARTMENTS.find(d => d.id === deptId)!
  const atLimit = selected.length >= plan.maxAdvisors
  const durationOpt = DURATION_OPTIONS.find(d => d.months === duration)!
  const subtotal = plan.monthly * duration
  const discountAmt = Math.round(subtotal * durationOpt.discount / 100)
  const total = subtotal - discountAmt

  function toggleAdvisor(adv: { id: string; name: string; title: string }, deptName: string) {
    setSelected(prev => {
      const exists = prev.some(a => a.id === adv.id)
      if (exists) return prev.filter(a => a.id !== adv.id)
      if (prev.length >= plan.maxAdvisors) return prev
      return [...prev, { ...adv, deptName }]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/infrastructure/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bundle', plan: planId, advisors: selected, duration, total, ...form }),
      })
    } catch { /* non-blocking */ }
    setSubmitting(false)
    setSubmitted(true)
  }

  // ── Success ──
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F5F7FA' }}>
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: DARK }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GOLD }}>Order Received</p>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: DARK }}>You&apos;re in!</h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            Your <strong>{plan.name}</strong> with {selected.length} AI Advisor{selected.length !== 1 ? 's' : ''} is confirmed.
            We&apos;ll reach out to <strong>{form.email}</strong> within 2 business hours.
          </p>
          {selected.length > 0 && (
            <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
              <p className="font-bold text-sm mb-3" style={{ color: DARK }}>Your AI Advisor Team</p>
              <div className="grid grid-cols-2 gap-2">
                {selected.map(a => (
                  <div key={a.id} className="flex items-center gap-2">
                    <img src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(a.name)}&backgroundColor=0B2140`} alt={a.name} className="w-8 h-8 rounded-full border border-gray-100 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{a.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{a.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/hub/workforce" className="px-7 py-3 rounded-xl font-bold text-sm text-white shadow-md" style={{ background: DARK }}>View My Workforce →</Link>
            <Link href="/" className="px-7 py-3 rounded-xl font-bold text-sm border-2 hover:bg-gray-50 transition" style={{ borderColor: DARK, color: DARK }}>Back to Homepage</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div style={{ background: DARK }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/#pricing" className="text-blue-300 text-sm hover:text-white mb-3 inline-block">← Back to Pricing</Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Bundle Order</h1>
          <p className="text-blue-200 text-sm">Website · Hub · Accounting · AI Advisor Workforce — all six services, fully integrated.</p>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-5 text-xs">
            {[['1','Choose Plan'],['2','Select Advisors'],['3','Your Info']].map(([n, label], i) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${step > i + 1 ? 'bg-green-400 text-white' : step === i + 1 ? 'bg-white text-[#0B2140]' : 'bg-white/20 text-white/50'}`}>{step > i + 1 ? '✓' : n}</div>
                <span className={step === i + 1 ? 'text-white font-semibold' : 'text-white/40'}>{label}</span>
                {i < 2 && <span className="text-white/20 mx-1">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Step 1: Choose Plan ── */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Choose your bundle</h2>
            <div className="space-y-3 mb-6">
              {(Object.entries(PLAN_CONFIG) as [keyof typeof PLAN_CONFIG, typeof PLAN_CONFIG['starter']][]).map(([id, p]) => (
                <button key={id} onClick={() => setPlanId(id)}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition ${planId === id ? 'border-[#0B2140] bg-blue-50 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${planId === id ? 'border-[#0B2140] bg-[#0B2140]' : 'border-gray-300'}`}>
                        {planId === id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">Includes <span className="font-semibold text-[#0B2140]">{p.maxAdvisors} AI Advisors</span> — you pick your team</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-gray-900">${p.setup.toLocaleString()} <span className="text-xs font-normal text-gray-400">setup</span></p>
                      <p className="text-sm font-semibold" style={{ color: GOLD }}>${p.monthly}/mo</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { setSelected([]); setStep(2) }}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition hover:opacity-90" style={{ background: GOLD }}>
              Continue — Select Your {plan.maxAdvisors} AI Advisors →
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">No payment until you sign the agreement · We contact you within 2 hours</p>
          </div>
        )}

        {/* ── Step 2: Select Advisors ── */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select your AI Advisor team</h2>
                <p className="text-sm text-gray-500 mt-0.5">Choose up to <strong>{plan.maxAdvisors}</strong> advisors for your {plan.name}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${atLimit ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-[#0B2140]'}`}>
                  {selected.length} / {plan.maxAdvisors} selected
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-gray-600">← Back</button>
              </div>
            </div>

            {atLimit && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
                ✓ Team full! You&apos;ve selected all {plan.maxAdvisors} advisors. Continue to finalize your order.
              </div>
            )}

            <div className="flex gap-6">
              {/* Dept sidebar */}
              <aside className="hidden md:block w-48 shrink-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Departments</p>
                <div className="space-y-0.5">
                  {DEPARTMENTS.map(d => {
                    const hasSelected = selected.some(a => d.advisors.some(x => x.id === a.id))
                    return (
                      <button key={d.id} onClick={() => setDeptId(d.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${deptId === d.id ? 'bg-[#0B2140] text-white' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                      >
                        <span>{d.icon}</span>
                        <span className="truncate">{d.name}</span>
                        {hasSelected && <span className="ml-auto w-2 h-2 rounded-full bg-green-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </aside>

              {/* Mobile dept tabs */}
              <div className="md:hidden w-full mb-4">
                <div className="flex overflow-x-auto gap-2 pb-2">
                  {DEPARTMENTS.map(d => (
                    <button key={d.id} onClick={() => setDeptId(d.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${deptId === d.id ? 'bg-[#0B2140] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                      {d.icon} {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advisor grid */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{dept.icon}</span>
                  <h3 className="font-bold text-gray-900">{dept.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dept.advisors.map(adv => {
                    const isSelected = selected.some(a => a.id === adv.id)
                    const disabled = !isSelected && atLimit
                    return (
                      <button key={adv.id} onClick={() => !disabled && toggleAdvisor(adv, dept.name)} disabled={disabled}
                        className={`text-left rounded-xl border-2 p-4 transition ${isSelected ? 'border-[#0B2140] bg-blue-50 shadow-md' : disabled ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <img src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(adv.name)}&backgroundColor=0B2140`} alt={adv.name} className="w-10 h-10 rounded-full border border-gray-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{adv.name}</p>
                            <p className="text-xs text-gray-500 truncate">{adv.title}</p>
                          </div>
                        </div>
                        <div className={`w-full py-1.5 rounded-lg text-xs font-bold text-center transition ${isSelected ? 'bg-[#0B2140] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {isSelected ? '✓ Selected' : '+ Select'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-4 shadow-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{selected.length} of {plan.maxAdvisors} advisors selected</p>
                <p className="text-xs text-gray-400 truncate">{selected.map(a => a.name).join(', ') || 'None yet — browse departments above'}</p>
              </div>
              <button onClick={() => setStep(3)} disabled={selected.length === 0}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed shrink-0" style={{ background: GOLD }}>
                Continue →
              </button>
            </div>
            <div className="h-20" />
          </div>
        )}

        {/* ── Step 3: Contact Info ── */}
        {step === 3 && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Your information</h2>
                <button onClick={() => setStep(2)} className="text-xs text-gray-400 hover:text-gray-600">← Back to advisors</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent" placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent" placeholder="jane@company.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent" placeholder="(555) 000-0000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Company *</label>
                      <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent" placeholder="Acme Corp" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tell us about your business</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent resize-none" placeholder="Industry, current challenges, goals…" />
                  </div>

                  {/* Duration selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Contract Duration</label>
                    <div className="grid grid-cols-4 gap-2">
                      {DURATION_OPTIONS.map(opt => (
                        <button key={opt.months} type="button" onClick={() => setDuration(opt.months)}
                          className={`py-2.5 rounded-xl text-xs font-semibold transition text-center ${duration === opt.months ? 'bg-[#0B2140] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {opt.label}
                          {opt.discount > 0 && (
                            <span className={`block text-[9px] mt-0.5 ${duration === opt.months ? 'text-blue-300' : 'text-green-600'}`}>Save {opt.discount}%</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="rounded-xl p-4 border border-gray-100" style={{ background: '#F8F8F8' }}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Setup Payment Milestones</p>
                    <div className="space-y-2">
                      {[
                        { pct: '25%', label: 'Down Payment',    timing: 'Due upon signing agreement', color: GOLD },
                        { pct: '50%', label: 'Build Complete',  timing: 'Invoiced at delivery',       color: DARK },
                        { pct: '25%', label: 'Launch Approved', timing: 'Invoiced at go-live',         color: '#6B7280' },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px]" style={{ background: m.color }}>{i + 1}</div>
                            <div><p className="font-semibold text-gray-700">{m.label}</p><p className="text-gray-400">{m.timing}</p></div>
                          </div>
                          <span className="font-bold shrink-0" style={{ color: m.color }}>{m.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md disabled:opacity-50 transition" style={{ background: GOLD }}>
                    {submitting ? 'Submitting…' : `Place Order — ${plan.name} →`}
                  </button>
                  <div className="text-center">
                    <p className="text-[11px] text-gray-400">No payment until you sign the agreement · We contact you within 2 hours</p>
                    <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline mt-1 inline-block" style={{ color: DARK }}>Prefer a call instead →</a>
                  </div>
                </form>
              </div>
            </div>

            {/* Order summary */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4" style={{ background: DARK }}>
                  <p className="text-white font-bold text-sm">{plan.name}</p>
                  <p className="text-blue-300 text-xs">{selected.length} AI Advisors · {duration}-month contract{durationOpt.discount > 0 ? ` · ${durationOpt.discount}% off` : ''}</p>
                </div>
                <div className="p-4 space-y-3">
                  {selected.length > 0 && (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {selected.map(a => (
                        <div key={a.id} className="flex items-center gap-2.5">
                          <img src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(a.name)}&backgroundColor=0B2140`} alt={a.name} className="w-8 h-8 rounded-full border border-gray-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{a.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{a.title}</p>
                          </div>
                          <button onClick={() => setSelected(s => s.filter(x => x.id !== a.id))} className="text-[10px] text-red-400 hover:text-red-600 shrink-0">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Setup fee</span><span className="font-bold text-gray-900">${plan.setup.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">{plan.monthly}/mo × {duration} mo</span><span className="font-bold text-gray-700">${subtotal.toLocaleString()}</span></div>
                    {durationOpt.discount > 0 && (
                      <div className="flex justify-between text-xs text-green-600 font-medium">
                        <span>Multi-month discount ({durationOpt.discount}%)</span>
                        <span>−${discountAmt.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-gray-100" style={{ color: DARK }}>
                      <span>Total (excl. setup)</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">${Math.round(total / duration).toLocaleString()}/mo · {duration}-month contract</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function BundleCheckout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400 text-sm">Loading…</div></div>}>
      <BundleContent />
    </Suspense>
  )
}
