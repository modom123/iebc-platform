'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type TaxObligation = {
  id: string
  name: string
  type: 'income_tax' | 'sales_tax' | 'vat' | 'payroll_tax' | 'other'
  amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
  period_start: string
  period_end: string
  notes: string
}

const TYPE_LABELS: Record<string, string> = {
  income_tax: 'Income Tax',
  sales_tax: 'Sales Tax',
  vat: 'VAT/GST',
  payroll_tax: 'Payroll Tax',
  other: 'Other',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function TaxPage() {
  const [obligations, setObligations] = useState<TaxObligation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', type: 'income_tax', amount: '', due_date: '',
    period_start: '', period_end: '', notes: '',
  })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/accounting/tax')
    const data = await res.json()
    setObligations(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/tax', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', type: 'income_tax', amount: '', due_date: '', period_start: '', period_end: '', notes: '' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const markPaid = async (id: string) => {
    await fetch('/api/accounting/tax', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'paid' }),
    })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this tax obligation?')) return
    await fetch(`/api/accounting/tax?id=${id}`, { method: 'DELETE' })
    load()
  }

  const today = new Date().toISOString().split('T')[0]
  const totalPending = obligations.filter(o => o.status !== 'paid').reduce((s, o) => s + Number(o.amount), 0)
  const overdueCount = obligations.filter(o => o.status !== 'paid' && o.due_date < today).length

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Tax Center</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Tax Obligation</button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Pending', value: fmt(totalPending), color: totalPending > 0 ? 'text-yellow-600' : 'text-gray-400' },
            { label: 'Overdue', value: String(overdueCount), color: overdueCount > 0 ? 'text-red-600' : 'text-gray-400' },
            { label: 'Total Filed', value: String(obligations.filter(o => o.status === 'paid').length), color: 'text-green-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Alert */}
        {overdueCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
            ⚠️ You have {overdueCount} overdue tax obligation{overdueCount > 1 ? 's' : ''}. File immediately to avoid penalties.
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">New Tax Obligation</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Name / Description *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Q1 2026 Estimated Tax" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tax Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Amount Owed ($) *</label>
                <input type="number" required min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Due Date *</label>
                <input type="date" required value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Period Start</label>
                <input type="date" value={form.period_start} onChange={e => setForm({...form, period_start: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Period End</label>
                <input type="date" value={form.period_end} onChange={e => setForm({...form, period_end: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : obligations.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 mb-2">No tax obligations tracked</p>
              <p className="text-sm text-gray-400 mb-4">Track income tax, sales tax, payroll tax, and VAT/GST obligations.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add Tax Obligation</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Period</th>
                <th className="p-3 text-left">Due</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {obligations.map(ob => {
                  const effectiveStatus = ob.status !== 'paid' && ob.due_date < today ? 'overdue' : ob.status
                  return (
                    <tr key={ob.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{ob.name}</td>
                      <td className="p-3 text-gray-500">{TYPE_LABELS[ob.type]}</td>
                      <td className="p-3 text-xs text-gray-400">{ob.period_start && `${ob.period_start} → ${ob.period_end}`}</td>
                      <td className={`p-3 ${effectiveStatus === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{ob.due_date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[effectiveStatus]}`}>{effectiveStatus}</span>
                      </td>
                      <td className="p-3 text-right font-semibold">{fmt(ob.amount)}</td>
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {ob.status !== 'paid' && <button onClick={() => markPaid(ob.id)} className="text-xs text-green-600 hover:underline">Mark Filed</button>}
                          <button onClick={() => del(ob.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
