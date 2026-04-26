'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const INDUSTRIES = ['Technology','Healthcare','Finance','Retail','Real Estate','Construction','Legal','Marketing','Manufacturing','Other']
const SERVICES   = ['Financial Infrastructure','Business Formation','Social Optimize','Website Build','Bundle Package','Consulting Only']

const empty = { business_name: '', contact_name: '', contact_email: '', phone: '', industry: '', service: '', notes: '' }

export default function IntakesPage() {
  const [form, setForm]     = useState(empty)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('hub_prospects').insert({
        business_name:  form.business_name,
        contact_name:   form.contact_name,
        contact_email:  form.contact_email,
        phone:          form.phone,
        industry:       form.industry,
        stage:          'new',
        notes:          `Service interest: ${form.service}\n${form.notes}`,
      })
      if (err) throw err
      setSaved(true); setForm(empty)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save intake')
    }
    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">New Client Intake</h1>
        </div>
        <Link href="/hub/leads" className="text-sm text-[#0F4C81] hover:underline">View CRM / Leads →</Link>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <p className="text-green-700 font-semibold text-sm">✅ Intake saved and added to CRM</p>
            <div className="flex gap-3">
              <Link href="/hub/leads" className="text-sm text-[#0F4C81] font-semibold hover:underline">View in CRM</Link>
              <button onClick={() => setSaved(false)} className="text-sm text-gray-500 hover:underline">Add Another</button>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 space-y-5">
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-1">New Client Intake Form</h2>
            <p className="text-sm text-gray-400">Fill this out when a new prospect reaches out. It goes directly into the CRM.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Business Name *</label>
              <input required value={form.business_name} onChange={e => setForm(f => ({...f, business_name: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                placeholder="Acme Corp" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Contact Name</label>
              <input value={form.contact_name} onChange={e => setForm(f => ({...f, contact_name: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                placeholder="Jane Smith" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                placeholder="+1 (555) 000-0000" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Email *</label>
              <input required type="email" value={form.contact_email} onChange={e => setForm(f => ({...f, contact_email: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                placeholder="jane@acmecorp.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Industry</label>
              <select value={form.industry} onChange={e => setForm(f => ({...f, industry: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
                <option value="">Select industry...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Service Interest</label>
              <select value={form.service} onChange={e => setForm(f => ({...f, service: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
                <option value="">Select service...</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] resize-none"
                placeholder="How did they find us? What are their pain points? Any urgency?" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠️ {error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold text-sm hover:bg-[#082D4F] disabled:opacity-50 transition">
              {saving ? 'Saving...' : 'Save Intake → Add to CRM'}
            </button>
            <Link href="/hub/leads"
              className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition text-center">
              View CRM
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
