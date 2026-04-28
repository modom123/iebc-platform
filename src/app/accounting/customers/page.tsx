'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  created_at: string
  invoice_count?: number
  total_billed?: number
}

type PortalToken = {
  id: string; token: string; label: string; portal_url: string
  expires_at: string | null; last_accessed_at: string | null
  access_count: number; is_active: boolean; created_at: string
  customers: { name: string; email: string }
}

export default function CustomersPage() {
  const [tab, setTab] = useState<'customers' | 'portals'>('customers')

  // ── Customers state ──
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  // ── Portals state ──
  const [tokens, setTokens] = useState<PortalToken[]>([])
  const [portalsLoading, setPortalsLoading] = useState(false)
  const [portalForm, setPortalForm] = useState({ customer_id: '', label: '', expires_days: '30' })
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const loadCustomers = async () => {
    setLoading(true)
    const [custRes, invRes] = await Promise.all([
      fetch('/api/accounting/customers'),
      fetch('/api/accounting/invoices'),
    ])
    const custs = await custRes.json()
    const invs = await invRes.json()
    const enriched = (Array.isArray(custs) ? custs : []).map((c: Customer) => {
      const custInvoices = Array.isArray(invs) ? invs.filter((i: { customer_id: string; total: number }) => i.customer_id === c.id) : []
      return { ...c, invoice_count: custInvoices.length, total_billed: custInvoices.reduce((s: number, i: { total: number }) => s + Number(i.total), 0) }
    })
    setCustomers(enriched)
    setLoading(false)
  }

  const loadPortals = async () => {
    setPortalsLoading(true)
    const res = await fetch('/api/portal/generate')
    const data = await res.json()
    setTokens(Array.isArray(data) ? data : [])
    setPortalsLoading(false)
  }

  useEffect(() => { loadCustomers() }, [])
  useEffect(() => { if (tab === 'portals') loadPortals() }, [tab])

  const openEdit = (c: Customer) => {
    setEditId(c.id)
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/accounting/customers', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editId ? { id: editId, ...form } : form),
    })
    if (res.ok) { setShowForm(false); setEditId(null); setForm({ name: '', email: '', phone: '', address: '' }); loadCustomers() }
    else { const d = await res.json(); setError(d.error || 'Failed to save') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer? Their invoice history will remain.')) return
    await fetch(`/api/accounting/customers?id=${id}`, { method: 'DELETE' })
    loadCustomers()
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault(); setGenerating(true)
    const res = await fetch('/api/portal/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portalForm),
    })
    if (res.ok) { setPortalForm({ customer_id: '', label: '', expires_days: '30' }); loadPortals() }
    setGenerating(false)
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this portal link?')) return
    await fetch(`/api/portal/generate?id=${id}`, { method: 'DELETE' })
    loadPortals()
  }

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Customers & Portals</h1>
        </div>
        {tab === 'customers' && (
          <button onClick={() => { setEditId(null); setForm({ name: '', email: '', phone: '', address: '' }); setShowForm(true) }}
            className="btn-primary text-sm">+ New Customer</button>
        )}
      </div>

      {/* Tab toggle */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex gap-1">
          {(['customers', 'portals'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-[#0F4C81] text-[#0F4C81]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'customers' ? '◯ Customers' : '🔗 Client Portals'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* ── CUSTOMERS TAB ── */}
        {tab === 'customers' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Customers', value: String(customers.length), color: 'text-gray-800' },
                { label: 'Total Billed', value: fmt(customers.reduce((s, c) => s + (c.total_billed || 0), 0)), color: 'text-[#0F4C81]' },
                { label: 'Avg. Value', value: customers.length ? fmt(customers.reduce((s, c) => s + (c.total_billed || 0), 0) / customers.length) : '$0.00', color: 'text-green-600' },
              ].map((c, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 uppercase">{c.label}</p>
                  <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="relative">
              <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] bg-white" />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>

            {showForm && (
              <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
                <h3 className="font-bold mb-4 text-[#0F4C81]">{editId ? 'Edit Customer' : 'New Customer'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Full Name / Business Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Address</label>
                    <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="123 Main St, City, State" />
                  </div>
                  {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
                  <div className="col-span-full flex gap-3">
                    <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editId ? 'Update Customer' : 'Save Customer'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 mb-3">{search ? 'No customers match your search' : 'No customers yet'}</p>
                  {!search && <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add First Customer</button>}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Contact</th>
                    <th className="p-3 text-right">Invoices</th>
                    <th className="p-3 text-right">Total Billed</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-semibold text-gray-800">{c.name}</p>
                          {c.address && <p className="text-xs text-gray-400">{c.address}</p>}
                        </td>
                        <td className="p-3">
                          {c.email && <p className="text-gray-600">{c.email}</p>}
                          {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                        </td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{c.invoice_count || 0}</span>
                        </td>
                        <td className="p-3 text-right font-semibold">{fmt(c.total_billed || 0)}</td>
                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <Link href={`/accounting/invoices?customer=${c.id}`} className="text-xs text-[#0F4C81] hover:underline">Invoices</Link>
                            <button onClick={() => { setPortalForm(p => ({ ...p, customer_id: c.id })); setTab('portals') }}
                              className="text-xs text-gray-500 hover:underline">Portal</button>
                            <button onClick={() => openEdit(c)} className="text-xs text-gray-500 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── PORTALS TAB ── */}
        {tab === 'portals' && (
          <>
            <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
              <h2 className="font-bold text-[#0F4C81] mb-1">Generate Client Portal Link</h2>
              <p className="text-xs text-gray-500 mb-4">Create a secure, shareable link for your client to view their invoices and account history.</p>
              <form onSubmit={handleGenerate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Client</label>
                  <select required value={portalForm.customer_id} onChange={e => setPortalForm({...portalForm, customer_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select client…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Label (optional)</label>
                  <input type="text" value={portalForm.label} onChange={e => setPortalForm({...portalForm, label: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Q1 2026" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Expires in</label>
                  <select value={portalForm.expires_days} onChange={e => setPortalForm({...portalForm, expires_days: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
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

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-800">Active Portal Links</h2>
                <span className="text-xs text-gray-400">{tokens.filter(t => t.is_active).length} active</span>
              </div>
              {portalsLoading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
              ) : tokens.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-4xl mb-3">🔗</p>
                  <p className="text-gray-500 text-sm">No portal links yet. Generate one above to share with a client.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                    <th className="px-5 py-2 text-left">Client</th>
                    <th className="px-5 py-2 text-left">Label</th>
                    <th className="px-5 py-2 text-left">Expires</th>
                    <th className="px-5 py-2 text-center">Views</th>
                    <th className="px-5 py-2 text-right">Actions</th>
                  </tr></thead>
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
                            <button onClick={() => copyLink(t.portal_url, t.id)}
                              className="text-xs bg-[#0F4C81] text-white px-3 py-1.5 rounded-lg hover:opacity-90">
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
          </>
        )}
      </div>
    </main>
  )
}
