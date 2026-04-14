'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type EntityType = 'llc' | 's_corp' | 'c_corp' | 'sole_prop'

type FormationData = {
  entity_type: EntityType | null
  business_name: string | null
  state: string | null
  steps: Record<string, boolean>
  status: 'not_started' | 'in_progress' | 'completed'
}

const ENTITY_INFO: Record<EntityType, { label: string; icon: string; description: string; color: string }> = {
  llc:       { label: 'LLC',                   icon: '🏢', description: 'Limited Liability Company — flexible management, pass-through taxation, strong liability protection.', color: 'border-blue-500 bg-blue-50' },
  s_corp:    { label: 'S-Corporation',          icon: '📈', description: 'S-Corp election — avoid double taxation, up to 100 shareholders, ideal for growing businesses.', color: 'border-green-500 bg-green-50' },
  c_corp:    { label: 'C-Corporation',          icon: '🏦', description: 'C-Corp — unlimited shareholders, investor-friendly, best for VC-backed startups.', color: 'border-purple-500 bg-purple-50' },
  sole_prop: { label: 'Sole Proprietorship',    icon: '👤', description: 'Simplest structure — no formal filing required, but no liability protection.', color: 'border-yellow-500 bg-yellow-50' },
}

const CHECKLISTS: Record<EntityType, { id: string; label: string; detail: string; resource?: string }[]> = {
  llc: [
    { id: 'name', label: 'Choose a unique business name', detail: 'Search your state\'s business name database to confirm availability.' },
    { id: 'articles', label: 'File Articles of Organization', detail: 'Submit to your state\'s Secretary of State office. Fee varies by state ($50–$500).' },
    { id: 'agent', label: 'Designate a registered agent', detail: 'Must have a physical address in your state. Can be yourself or a registered agent service.' },
    { id: 'operating', label: 'Draft an Operating Agreement', detail: 'Defines ownership percentages, management roles, and profit distribution. Not always required by law but critical.' },
    { id: 'ein', label: 'Obtain EIN from the IRS', detail: 'Free at IRS.gov. Required to open a business bank account and hire employees.' },
    { id: 'bank', label: 'Open a dedicated business bank account', detail: 'Keep personal and business finances separate to maintain liability protection.' },
    { id: 'licenses', label: 'Get required business licenses & permits', detail: 'Check federal, state, and local requirements for your industry.' },
    { id: 'taxes', label: 'Register for state taxes', detail: 'Sales tax, payroll tax, and other state-specific registrations may apply.' },
    { id: 'accounting', label: 'Set up business accounting', detail: 'Start tracking income, expenses, and use the IEBC accounting dashboard.' },
  ],
  s_corp: [
    { id: 'name', label: 'Choose a unique business name', detail: 'Must include "Corp", "Inc.", or "Incorporated" in most states.' },
    { id: 'articles', label: 'File Articles of Incorporation', detail: 'File with your state\'s Secretary of State. Sets up the C-Corp base.' },
    { id: 'agent', label: 'Designate a registered agent', detail: 'Required in every state where you do business.' },
    { id: 'bylaws', label: 'Create corporate bylaws', detail: 'Internal rules governing how the corporation will operate.' },
    { id: 'meeting', label: 'Hold organizational meeting', detail: 'Elect directors, appoint officers, issue stock, and adopt bylaws.' },
    { id: 'stock', label: 'Issue stock to shareholders', detail: 'Document all stock issuances. S-Corps can have up to 100 shareholders.' },
    { id: 'form2553', label: 'File IRS Form 2553 (S-Corp election)', detail: 'Must be filed within 75 days of incorporation or by March 15 for the current tax year.' },
    { id: 'ein', label: 'Obtain EIN from the IRS', detail: 'Free at IRS.gov.' },
    { id: 'bank', label: 'Open a business bank account', detail: 'Separate personal and business finances.' },
    { id: 'taxes', label: 'Register for state and payroll taxes', detail: 'S-Corp owners who work in the business must take a reasonable salary.' },
    { id: 'records', label: 'Maintain corporate records', detail: 'Keep minutes of board meetings, resolutions, and shareholder records.' },
  ],
  c_corp: [
    { id: 'name', label: 'Choose a unique business name', detail: 'Must include "Corp", "Inc.", or "Incorporated".' },
    { id: 'articles', label: 'File Articles of Incorporation', detail: 'Delaware is popular for investor-friendly corporate law.' },
    { id: 'agent', label: 'Designate a registered agent', detail: 'Required in every state of formation and operation.' },
    { id: 'bylaws', label: 'Create corporate bylaws', detail: 'Governs internal procedures and shareholder rights.' },
    { id: 'meeting', label: 'Hold organizational meeting & issue stock', detail: 'Elect directors, appoint officers, issue shares, set up cap table.' },
    { id: 'ein', label: 'Obtain EIN from the IRS', detail: 'Required immediately for banking and tax purposes.' },
    { id: 'bank', label: 'Open a business bank account', detail: 'Use a business account exclusively for corporate funds.' },
    { id: 'taxes', label: 'Register for federal and state taxes', detail: 'C-Corps pay corporate income tax at the entity level (21% federal).' },
    { id: 'records', label: 'Maintain corporate records & minutes', detail: 'Required for legal compliance and investor due diligence.' },
    { id: '409a', label: 'Get a 409A valuation (if issuing options)', detail: 'Required before issuing stock options to employees or contractors.' },
  ],
  sole_prop: [
    { id: 'dba', label: 'Register a DBA (doing business as)', detail: 'Required if operating under a name other than your legal name. File with county or state.' },
    { id: 'licenses', label: 'Obtain required business licenses & permits', detail: 'Check city, county, state, and federal requirements for your industry.' },
    { id: 'ein', label: 'Get an EIN (or use your SSN)', detail: 'An EIN is recommended for privacy and if you plan to hire employees.' },
    { id: 'bank', label: 'Open a separate business bank account', detail: 'Not legally required, but strongly recommended for clean recordkeeping.' },
    { id: 'taxes', label: 'Register for state & self-employment taxes', detail: 'You\'ll pay 15.3% self-employment tax on net profit. Make quarterly estimated payments.' },
    { id: 'insurance', label: 'Get business insurance', detail: 'General liability insurance protects you since there\'s no corporate shield.' },
    { id: 'accounting', label: 'Set up business accounting', detail: 'Track income and expenses from day one using the IEBC dashboard.' },
  ],
}

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

export default function FormationPage() {
  const [formation, setFormation] = useState<FormationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [setupForm, setSetupForm] = useState({ entity_type: '' as EntityType | '', business_name: '', state: '' })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/formation')
    const data = await res.json()
    setFormation(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const startFormation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!setupForm.entity_type) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/formation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setupForm),
    })
    if (res.ok) {
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to start formation')
    }
    setSaving(false)
  }

  const toggleStep = async (stepId: string) => {
    if (!formation) return
    const newSteps = { ...formation.steps, [stepId]: !formation.steps[stepId] }
    const checklist = formation.entity_type ? CHECKLISTS[formation.entity_type] : []
    const allDone = checklist.every(s => newSteps[s.id])
    const newStatus = allDone ? 'completed' : 'in_progress'

    setFormation({ ...formation, steps: newSteps, status: newStatus })

    await fetch('/api/formation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps: newSteps, status: newStatus }),
    })
  }

  const resetFormation = async () => {
    if (!confirm('Reset your formation checklist? This will clear all progress.')) return
    await fetch('/api/formation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps: {}, status: 'not_started', entity_type: null, business_name: null, state: null }),
    })
    setFormation(null)
    load()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  const checklist = formation?.entity_type ? CHECKLISTS[formation.entity_type] : []
  const completedSteps = checklist.filter(s => formation?.steps[s.id]).length
  const progress = checklist.length > 0 ? Math.round((completedSteps / checklist.length) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Business Formation</h1>
        </div>
        {formation?.entity_type && (
          <button onClick={resetFormation} className="text-xs text-red-400 hover:text-red-600">Reset Checklist</button>
        )}
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* ── À La Carte Formation Services Banner ── */}
        <div className="rounded-xl overflow-hidden border border-[#C8902A]/30 shadow-sm">
          <div
            className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg, #0B2140 0%, #1a3a5c 100%)' }}
          >
            <div>
              <p className="text-[#C8902A] text-xs font-black uppercase tracking-widest mb-1">
                Done-For-You Services
              </p>
              <h3 className="text-white font-bold text-base leading-snug">
                Need help with formation? Shop our à la carte services.
              </h3>
              <p className="text-blue-200 text-xs mt-1">
                LLC · S-Corp · EIN · Operating Agreements · Registered Agent · and more
              </p>
            </div>
            <a
              href="/checkout/formation"
              className="shrink-0 px-5 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 shadow-md whitespace-nowrap"
              style={{ background: '#C8902A', color: '#fff' }}
            >
              Shop Formation Services →
            </a>
          </div>
        </div>

        {!formation?.entity_type ? (
          /* Setup: Choose entity type */
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Choose Your Business Structure</h2>
              <p className="text-gray-500 text-sm mt-1">Select the entity type that fits your goals. You can always consult an IEBC advisor for guidance.</p>
            </div>

            {/* Entity type cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(ENTITY_INFO) as [EntityType, typeof ENTITY_INFO[EntityType]][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSetupForm(f => ({ ...f, entity_type: key }))}
                  className={`text-left p-5 rounded-xl border-2 transition ${
                    setupForm.entity_type === key
                      ? info.color + ' shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-3xl mb-2">{info.icon}</div>
                  <h3 className="font-bold text-gray-800">{info.label}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{info.description}</p>
                </button>
              ))}
            </div>

            {/* Formation details form */}
            {setupForm.entity_type && (
              <form onSubmit={startFormation} className="bg-white rounded-xl border border-[#0F4C81] p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-[#0F4C81]">
                  {ENTITY_INFO[setupForm.entity_type].icon} {ENTITY_INFO[setupForm.entity_type].label} Formation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Business Name (optional)</label>
                    <input
                      type="text"
                      placeholder="Acme Ventures LLC"
                      value={setupForm.business_name}
                      onChange={e => setSetupForm(f => ({ ...f, business_name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Formation State</label>
                    <select
                      value={setupForm.state}
                      onChange={e => setSetupForm(f => ({ ...f, state: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    >
                      <option value="">Select state</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" disabled={saving} className="btn-primary text-sm w-full">
                  {saving ? 'Starting...' : `Start ${ENTITY_INFO[setupForm.entity_type].label} Formation`}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Checklist view */
          <div className="space-y-5">
            {/* Formation header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{ENTITY_INFO[formation.entity_type].icon}</span>
                    <h2 className="text-xl font-bold text-gray-800">
                      {formation.business_name || 'Your Business'} — {ENTITY_INFO[formation.entity_type].label}
                    </h2>
                  </div>
                  {formation.state && <p className="text-sm text-gray-500">Forming in {formation.state}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  formation.status === 'completed' ? 'bg-green-100 text-green-700' :
                  formation.status === 'in_progress' ? 'bg-blue-100 text-[#0F4C81]' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {formation.status.replace('_', ' ')}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{completedSteps} of {checklist.length} steps complete</span>
                  <span className="font-semibold text-[#0F4C81]">{progress}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: progress === 100 ? '#16a34a' : '#0F4C81',
                    }}
                  />
                </div>
                {progress === 100 && (
                  <p className="mt-2 text-sm text-green-600 font-semibold">
                    🎉 Formation complete! Your business is officially set up.
                  </p>
                )}
              </div>
            </div>

            {/* Steps checklist */}
            <div className="space-y-2">
              {checklist.map((step, i) => {
                const done = formation.steps[step.id] ?? false
                return (
                  <div
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={`bg-white rounded-xl border p-4 flex items-start gap-4 cursor-pointer hover:shadow-sm transition ${
                      done ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-[#0F4C81]'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      done ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">Step {i + 1}</span>
                        <p className={`font-semibold text-sm ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {step.label}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Next steps prompt if not done */}
            {progress < 100 && (
              <div className="bg-[#0F4C81] text-white rounded-xl p-5">
                <h3 className="font-bold mb-1">Need Help?</h3>
                <p className="text-blue-200 text-sm mb-3">
                  IEBC consultants can handle your formation paperwork, EIN registration, and operating agreements for you.
                </p>
                <Link href="/accounting/checkout" className="inline-block bg-white text-[#0F4C81] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
                  Upgrade to Platinum for Full Support →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
