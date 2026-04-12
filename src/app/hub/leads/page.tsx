'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Lead = {
  id: string
  business_name: string
  contact_email: string
  industry: string
  heat: 'hot' | 'warm' | 'cold'
  est_value: number
  status: 'new' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost'
  created_at: string
}

const HEAT_STYLES: Record<string, string> = {
  hot: 'bg-red-100 text-red-600',
  warm: 'bg-yellow-100 text-yellow-700',
  cold: 'bg-blue-100 text-blue-600',
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-gray-100 text-gray-600',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-purple-100 text-purple-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-400',
}

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Real Estate', 'Construction', 'Legal', 'Marketing', 'Manufacturing', 'Other']

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US')

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterHeat, setFilterHeat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    business_name: '', contact_email: '', industry: '', heat: 'warm', est_value: '', status: 'new',
  })

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterHeat) params.set('heat', filterHeat)
    const res = await fetch(`/api/leads?${params}`)
    const data = await res.json()
    setLeads(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus, filterHeat])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ business_name: '', contact_email: '', industry: '', heat: 'warm', est_value: '', status: 'new' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    await fetch(`/api/leads?id=${id}`, { method: 'DELETE' })
    load()
  }

  const totalValue = leads.reduce((s, l) => s + Number(l.est_value), 0)
  const wonValue = leads.filter(l => l.status === 'closed_won').reduce((s, l) => s + Number(l.est_value), 0)
  const hotCount = leads.filter(l => l.heat === 'hot').length

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Lead Pipeline</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Lead</button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: String(leads.length), color: 'text-gray-800' },
            { label: 'Hot Leads', value: String(hotCount), color: 'text-red-600' },
            { label: 'Pipeline Value', value: fmt(totalValue), color: 'text-[#0F4C81]' },
            { label: 'Won', value: fmt(wonValue), color: 'text-green-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-1">
            {['', 'new', 'contacted', 'qualified', 'closed_won', 'closed_lost'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterStatus === s ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 hover:border-[#0F4C81]'}`}>
                {s === '' ? 'All Status' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-2">
            {['', 'hot', 'warm', 'cold'].map(h => (
              <button key={h} onClick={() => setFilterHeat(h)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterHeat === h ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 hover:border-[#0F4C81]'}`}>
                {h === '' ? 'All Heat' : h}
              </button>
            ))}
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">New Lead</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Business Name</label>
                <input type="text" required value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Contact Email</label>
                <input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="contact@acme.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Industry</label>
                <select value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Heat</label>
                <select value={form.heat} onChange={e => setForm({...form, heat: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Est. Value ($)</label>
                <input type="number" min="0" step="100" value={form.est_value} onChange={e => setForm({...form, est_value: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="5000" />
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Lead'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-3">No leads yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add First Lead</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Business</th>
                <th className="p-3 text-left">Industry</th>
                <th className="p-3 text-left">Heat</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Est. Value</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium">{lead.business_name}</p>
                      {lead.contact_email && <p className="text-xs text-gray-400">{lead.contact_email}</p>}
                    </td>
                    <td className="p-3 text-gray-500">{lead.industry || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${HEAT_STYLES[lead.heat]}`}>{lead.heat}</span>
                    </td>
                    <td className="p-3">
                      <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[lead.status]}`}>
                        {['new', 'contacted', 'qualified', 'closed_won', 'closed_lost'].map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">{fmt(lead.est_value)}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => deleteLead(lead.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
