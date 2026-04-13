'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Customer = { id: string; name: string; email: string }
type PortalToken = {
  id: string; token: string; label: string; portal_url: string;
  expires_at: string | null; last_accessed_at: string | null; access_count: number;
  is_active: boolean; created_at: string; customers: { name: string; email: string }
}

export default function ClientPortalsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [tokens, setTokens] = useState<PortalToken[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ customer_id: '', label: '', expires_days: '30' })
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const load = async () => {
    const [custRes, tokRes] = await Promise.all([
      fetch('/api/accounting/customers'),
      fetch('/api/portal/generate'),
    ])
    const [custs, toks] = await Promise.all([custRes.json(), tokRes.json()])
    setCustomers(Array.isArray(custs) ? custs : [])
    setTokens(Array.isArray(toks) ? toks : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    const res = await fetch('/api/portal/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ customer_id: '', label: '', expires_days: '30' })
      load()
    }
    setGenerating(false)
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this portal link? The client will no longer be able to access it.')) return
    await fetch(`/api/portal/generate?id=${id}`, { method: 'DELETE' })
    load()
  }

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Client Portals</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Generate New Portal Link */}
        <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
          <h2 className="font-bold text-[#0F4C81] mb-1">Generate Client Portal Link</h2>
          <p className="text-xs text-gray-500 mb-4">Create a secure, shareable link for your client to view their invoices and account history.</p>
          <form onSubmit={handleGenerate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">Client</label>
              <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select client…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Label (optional)</label>
              <input type="text" value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Q1 2026" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Expires in</label>
              <select value={form.expires_days} onChange={e => setForm({...form, expires_days: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="">Never</option>
              </select>
            </div>
            <div className="col-span-full">
              <button type="submit" disabled={generating} className="btn-primary text-sm">
                {generating ? 'Generating...' : 'Generate Portal Link'}
              </button>
            </div>
          </form>
        </div>

        {/* Active Portal Links */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Active Portal Links</h2>
            <span className="text-xs text-gray-400">{tokens.filter(t => t.is_active).length} active</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : tokens.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">🔗</p>
              <p className="text-gray-500 text-sm">No portal links yet. Generate one above to share with a client.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                  <th className="px-5 py-2 text-left">Client</th>
                  <th className="px-5 py-2 text-left">Label</th>
                  <th className="px-5 py-2 text-left">Expires</th>
                  <th className="px-5 py-2 text-center">Views</th>
                  <th className="px-5 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tokens.map(t => (
                  <tr key={t.id} className={`hover:bg-gray-50 ${!t.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{t.customers?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{t.customers?.email || ''}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{t.label || '—'}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {t.expires_at ? new Date(t.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="font-semibold text-gray-700">{t.access_count}</span>
                      {t.last_accessed_at && <p className="text-xs text-gray-400">{new Date(t.last_accessed_at).toLocaleDateString()}</p>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => copyLink(t.portal_url, t.id)}
                          className="text-xs bg-[#0F4C81] text-white px-3 py-1.5 rounded-lg hover:opacity-90"
                        >
                          {copied === t.id ? '✓ Copied!' : 'Copy Link'}
                        </button>
                        <a href={t.portal_url} target="_blank" rel="noreferrer" className="text-xs border border-gray-200 px-2 py-1.5 rounded-lg hover:border-gray-400">Preview</a>
                        <button onClick={() => handleRevoke(t.id)} className="text-xs text-red-400 hover:text-red-600">Revoke</button>
                      </div>
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
