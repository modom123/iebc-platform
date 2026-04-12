'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type LineItem = { description: string; qty: number; rate: number }
type Estimate = {
  id: string
  estimate_number: string
  client_name: string
  client_email: string | null
  items: LineItem[]
  subtotal: number
  tax_rate: number
  total: number
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired'
  valid_until: string | null
  notes: string | null
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
  expired:  'bg-yellow-100 text-yellow-700',
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

const emptyItem = (): LineItem => ({ description: '', qty: 1, rate: 0 })

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    client_name: '', client_email: '', notes: '', tax_rate: '0', valid_until: '',
    items: [emptyItem()],
  })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/accounting/estimates')
    const data = await res.json()
    setEstimates(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const setItem = (i: number, field: keyof LineItem, value: string) => {
    setForm(f => {
      const items = [...f.items]
      items[i] = { ...items[i], [field]: field === 'description' ? value : parseFloat(value) || 0 }
      return { ...f, items }
    })
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }))
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  const subtotal = form.items.reduce((s, i) => s + i.qty * i.rate, 0)
  const taxAmount = subtotal * (parseFloat(form.tax_rate || '0') / 100)
  const total = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.items.every(i => !i.description)) { setError('Add at least one line item'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tax_rate: parseFloat(form.tax_rate || '0') }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ client_name: '', client_email: '', notes: '', tax_rate: '0', valid_until: '', items: [emptyItem()] })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/accounting/estimates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  const convertToInvoice = async (id: string) => {
    if (!confirm('Convert this estimate to an invoice?')) return
    setConverting(id)
    const res = await fetch('/api/accounting/estimates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setSuccess('Estimate converted to invoice!')
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Conversion failed')
    }
    setConverting(null)
  }

  const deleteEstimate = async (id: string) => {
    if (!confirm('Delete this estimate?')) return
    await fetch(`/api/accounting/estimates?id=${id}`, { method: 'DELETE' })
    load()
  }

  const totalValue = estimates.reduce((s, e) => s + Number(e.total), 0)
  const acceptedValue = estimates.filter(e => e.status === 'accepted').reduce((s, e) => s + Number(e.total), 0)
  const sentCount = estimates.filter(e => e.status === 'sent').length

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Estimates & Quotes</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/accounting/invoices" className="btn-secondary text-sm px-4 py-2 border-2 border-[#0F4C81] text-[#0F4C81] rounded-lg font-semibold">Invoices</Link>
          <button onClick={() => { setShowForm(true); setError('') }} className="btn-primary text-sm">+ New Estimate</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Estimates', value: String(estimates.length), color: 'text-gray-800' },
            { label: 'Awaiting Response', value: String(sentCount), color: 'text-blue-600' },
            { label: 'Total Value', value: fmt(totalValue), color: 'text-[#0F4C81]' },
            { label: 'Accepted Value', value: fmt(acceptedValue), color: 'text-green-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Success / Error */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex justify-between">
            ✓ {success} <button onClick={() => setSuccess('')} className="text-green-400">✕</button>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold text-[#0F4C81] mb-4">New Estimate</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Client Name *</label>
                  <input required type="text" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Client Email</label>
                  <input type="email" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="client@acme.com" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Valid Until</label>
                  <input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Tax Rate (%)</label>
                  <input type="number" min="0" max="100" step="0.1" value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Line Items</label>
                  <button type="button" onClick={addItem} className="text-xs text-[#0F4C81] font-semibold hover:underline">+ Add Line</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input type="text" required value={item.description} onChange={e => setItem(i, 'description', e.target.value)}
                          placeholder="Service description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="1" value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)}
                          placeholder="Qty" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" min="0" step="0.01" value={item.rate || ''} onChange={e => setItem(i, 'rate', e.target.value)}
                          placeholder="Rate" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="col-span-1 text-right">
                        {form.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-1 text-sm text-right">
                  <div className="flex justify-end gap-4 text-gray-500">
                    <span>Subtotal:</span><span className="font-semibold">{fmt(subtotal)}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-end gap-4 text-gray-500">
                      <span>Tax ({form.tax_rate}%):</span><span className="font-semibold">{fmt(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-end gap-4 font-bold text-[#0F4C81]">
                    <span>Total:</span><span>{fmt(total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Notes / Terms</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Payment terms, expiry notes, etc." />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Create Estimate'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Estimates Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : estimates.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium text-gray-600 mb-1">No estimates yet</p>
              <p className="text-sm text-gray-400 mb-4">Create your first estimate or quote to send to a client.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Create First Estimate</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Estimate #</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Valid Until</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {estimates.map(est => (
                  <tr key={est.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-gray-600">{est.estimate_number}</td>
                    <td className="p-3">
                      <p className="font-medium">{est.client_name}</p>
                      {est.client_email && <p className="text-xs text-gray-400">{est.client_email}</p>}
                    </td>
                    <td className="p-3">
                      <select value={est.status} onChange={e => updateStatus(est.id, e.target.value)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[est.status]}`}>
                        {['draft','sent','accepted','declined','expired'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{est.valid_until || '—'}</td>
                    <td className="p-3 text-right font-semibold font-mono">{fmt(est.total)}</td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {(est.status === 'accepted' || est.status === 'sent') && (
                          <button
                            onClick={() => convertToInvoice(est.id)}
                            disabled={converting === est.id}
                            className="text-xs text-[#0F4C81] hover:underline font-semibold disabled:opacity-50"
                          >
                            {converting === est.id ? '...' : '→ Invoice'}
                          </button>
                        )}
                        <button onClick={() => deleteEstimate(est.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
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
