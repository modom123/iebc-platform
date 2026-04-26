'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Prospect = { id: string; business_name: string; contact_email: string; contact_name?: string; stage: string; heat: string }

const TEMPLATES = [
  {
    id: 'intro',
    label: 'Introduction',
    subject: 'Quick question about your business infrastructure',
    body: `Hi {name},

I came across {business} and wanted to reach out. At IEBC, we help businesses like yours build the financial and operational infrastructure they need to scale — without the enterprise price tag.

We offer accounting, payroll, formation, and consulting starting at $9/mo.

Would you be open to a quick 15-minute call this week?

Best,
IEBC Team`,
  },
  {
    id: 'followup',
    label: 'Follow Up',
    subject: 'Following up — IEBC Business Infrastructure',
    body: `Hi {name},

Just following up on my previous message. I know things get busy.

We've helped businesses in {industry} reduce their back-office overhead by 60%+ using our all-in-one platform.

Happy to do a quick demo at your convenience — no pressure at all.

Best,
IEBC Team`,
  },
  {
    id: 'proposal',
    label: 'Proposal Ready',
    subject: 'Your IEBC proposal is ready',
    body: `Hi {name},

Thank you for your time earlier. I've put together a proposal tailored to {business}'s needs.

Based on our conversation, I'd recommend starting with our Gold plan ($22/mo) which includes bank reconciliation, reports, and cash flow forecasting.

You can review pricing and start a 30-day free trial here: https://iebusinessconsultants.com/accounting/checkout

Let me know if you have any questions.

Best,
IEBC Team`,
  },
]

export default function OutreachPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [selected, setSelected]   = useState<Prospect | null>(null)
  const [template, setTemplate]   = useState(TEMPLATES[0])
  const [body, setBody]           = useState('')
  const [subject, setSubject]     = useState('')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('hub_prospects')
      .select('id,business_name,contact_email,contact_name,stage,heat')
      .in('stage', ['new', 'contacted', 'demo'])
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => { setProspects(data || []); setLoading(false) })
  }, [])

  const applyTemplate = (t: typeof TEMPLATES[0], p: Prospect | null) => {
    setTemplate(t)
    const name = p?.contact_name || p?.business_name || 'there'
    const biz  = p?.business_name || 'your business'
    setSubject(t.subject.replace('{name}', name).replace('{business}', biz))
    setBody(t.body.replace(/\{name\}/g, name).replace(/\{business\}/g, biz).replace('{industry}', 'your industry'))
  }

  const selectProspect = (p: Prospect) => {
    setSelected(p)
    applyTemplate(template, p)
  }

  const openEmail = () => {
    if (!selected?.contact_email) return
    const mailto = `mailto:${selected.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Outreach Engine</h1>
        </div>
        <Link href="/hub/leads" className="text-sm text-[#0F4C81] hover:underline">CRM / Leads →</Link>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Prospect list */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Prospect</p>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : prospects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center text-sm text-gray-400">
                <p className="mb-3">No prospects yet.</p>
                <Link href="/hub/intakes" className="text-[#0F4C81] font-semibold hover:underline">Add Intake →</Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {prospects.map(p => (
                  <button key={p.id} onClick={() => selectProspect(p)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${selected?.id === p.id ? 'border-[#0F4C81] bg-blue-50' : 'border-gray-200 bg-white hover:border-[#0F4C81]'}`}>
                    <p className="font-semibold text-gray-800">{p.business_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.contact_email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t, selected)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${template.id === t.id ? 'bg-[#0F4C81] text-white' : 'border border-gray-200 text-gray-600 hover:border-[#0F4C81]'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Message</label>
                <textarea rows={12} value={body} onChange={e => setBody(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] resize-none font-mono" />
              </div>
              <div className="flex gap-3">
                <button onClick={openEmail} disabled={!selected}
                  className="flex-1 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold text-sm hover:bg-[#082D4F] disabled:opacity-40 transition">
                  {selected ? `Open Email to ${selected.contact_email}` : 'Select a prospect first'}
                </button>
              </div>
              {!selected && <p className="text-xs text-gray-400 text-center">Select a prospect from the left to personalize the message</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
