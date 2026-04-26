'use client'

import { useState, useEffect } from 'react'

type Lead = { id: string; business_name: string; contact_email: string; heat: string; status: string }

const TEMPLATES = [
  {
    id: 'intro',
    label: 'First Touch — Introduction',
    subject: 'Quick question about {company}',
    body: `Hi there,

I came across {company} and noticed [specific observation about their business]. I work with IEBC Business Consultants helping companies like yours with [relevant service].

I'd love to share how we've helped similar businesses [specific outcome]. Would you have 15 minutes this week for a quick call?

Best,
{consultant_name}
IEBC Business Consultants`,
  },
  {
    id: 'followup',
    label: 'Follow-Up (No Response)',
    subject: 'Following up — {company}',
    body: `Hi,

I wanted to follow up on my previous note about helping {company} with [service].

I know things get busy, so I'll keep this short: we've helped [X] businesses in your industry [outcome]. Happy to share a quick overview if you're interested.

Worth a 10-minute call?

{consultant_name}
IEBC Business Consultants`,
  },
  {
    id: 'qualified',
    label: 'Qualified Lead — Send Proposal',
    subject: 'IEBC Proposal for {company}',
    body: `Hi,

Thank you for our conversation — it was great learning more about {company}'s goals.

As discussed, I'm attaching our proposal outlining how IEBC can help you [goal discussed]. This includes:
• [Service 1]
• [Service 2]
• [Timeline and investment]

I'd love to walk you through it on a call. Are you available [Day] at [Time]?

Looking forward to working together,
{consultant_name}
IEBC Business Consultants`,
  },
  {
    id: 'closing',
    label: 'Closing — Decision Needed',
    subject: 'Re: IEBC Proposal — Next Steps',
    body: `Hi,

I wanted to check in on the proposal I sent over for {company}. We have a few client spots opening next month and I'd love to reserve one for you.

Do you have any questions I can address? Happy to jump on a quick call to go over any details.

Let me know how you'd like to proceed!

{consultant_name}
IEBC Business Consultants`,
  },
]

export default function OutreachPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0])
  const [subject, setSubject] = useState(TEMPLATES[0].subject)
  const [body, setBody] = useState(TEMPLATES[0].body)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.ok ? r.json() : [])
      .then(d => setLeads(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setSelectedTemplate(t)
    const company = selectedLead?.business_name ?? '{company}'
    setSubject(t.subject.replace(/{company}/g, company))
    setBody(t.body.replace(/{company}/g, company))
  }

  function selectLead(lead: Lead) {
    setSelectedLead(lead)
    const s = selectedTemplate.subject.replace(/{company}/g, lead.business_name)
    const b = selectedTemplate.body.replace(/{company}/g, lead.business_name)
    setSubject(s)
    setBody(b)
    setSent(false)
  }

  function handleSend() {
    if (!selectedLead) return
    const mailto = `mailto:${selectedLead.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto, '_blank')
    setSent(true)
    // Mark as contacted
    fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedLead.id, status: 'contacted' }),
    }).catch(() => {})
  }

  const HEAT_COLOR: Record<string, string> = { hot: 'text-red-600', warm: 'text-yellow-600', cold: 'text-blue-500' }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Outreach Center</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Pick a lead, choose a template, customize, and send</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Lead picker */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">1. Pick a Lead</p>
          <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
            {leads.filter(l => l.status !== 'closed_lost').map(l => (
              <button key={l.id} onClick={() => selectLead(l)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition ${
                  selectedLead?.id === l.id ? 'bg-[#1a3a5c] text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}>
                <p className="font-semibold truncate">{l.business_name}</p>
                <p className={`text-[11px] truncate ${selectedLead?.id === l.id ? 'text-blue-200' : HEAT_COLOR[l.heat]}`}>
                  {l.heat} · {l.contact_email}
                </p>
              </button>
            ))}
            {leads.length === 0 && (
              <p className="text-[12px] text-gray-400 text-center py-4">No leads yet — add some from CRM</p>
            )}
          </div>
        </div>

        {/* Compose */}
        <div className="lg:col-span-2 space-y-4">

          {/* Template picker */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">2. Choose Template</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition border ${
                    selectedTemplate.id === t.id
                      ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a3a5c]/40'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email composer */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">3. Customize & Send</p>
            {selectedLead ? (
              <div className="text-[12px] text-gray-500">
                To: <span className="font-semibold text-gray-800">{selectedLead.contact_email}</span>
                <span className="ml-2 text-gray-400">({selectedLead.business_name})</span>
              </div>
            ) : (
              <p className="text-[12px] text-gray-400">← Select a lead first</p>
            )}
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject line"
              className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 focus:border-[#1a3a5c] font-medium"
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={12}
              className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 focus:border-[#1a3a5c] resize-none font-mono leading-relaxed"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleSend}
                disabled={!selectedLead}
                className="bg-[#1a3a5c] text-white text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#0d2e4a] transition disabled:opacity-40 disabled:cursor-not-allowed">
                ✉ Open in Email Client
              </button>
              {sent && (
                <span className="text-[12px] text-green-600 font-semibold">
                  ✓ Sent — lead marked as Contacted
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">Opens your email client pre-filled. The lead status will be updated to "Contacted" automatically.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
