'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Bill = {
  id: string
  vendor_name: string
  description: string
  amount: number
  due_date: string
  status: 'unpaid' | 'paid' | 'overdue' | 'void'
  category: string
  reference: string
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-400',
}

const CATEGORIES = ['Rent & Utilities', 'Software & Subscriptions', 'Payroll', 'Professional Services', 'Insurance', 'Marketing', 'Travel', 'Office Supplies', 'Cost of Goods', 'Miscellaneous']

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    vendor_name: '', description: '', amount: '', due_date: '', category: '', reference: '',
  })

  const load = async () => {
    setLoading(true)
    const params = filterStatus ? `?status=${filterStatus}` : ''
    const res = await fetch(`/api/accounting/bills${params}`)
    const data = await res.json()
    setBills(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ vendor_name: '', description: '', amount: '', due_date: '', category: '', reference: '' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const markPaid = async (id: string) => {
    await fetch('/api/accounting/bills', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'paid' }),
    })
    load()
  }

  const voidBill = async (id: string) => {
    if (!confirm('Void this bill?')) return
    await fetch('/api/accounting/bills', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'void' }),
    })
    load()
  }

  const today = new Date().toISOString().split('T')[0]
  const totalUnpaid = bills.filter(b => b.status === 'unpaid' || b.status === 'overdue').reduce((s, b) => s + Number(b.amount), 0)
  const totalOverdue = bills.filter(b => b.status === 'overdue' || (b.status === 'unpaid' && b.due_date < today)).reduce((s, b) => s + Number(b.amount), 0)
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + Number(b.amount), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Bills & Payables</h1>
        </div>
        <div className="flex gap-2">
          <a href="/api/export?type=bills" className="btn-secondary text-sm py-2">Export CSV</a>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Bill</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Bills', value: String(bills.length), color: 'text-gray-800' },
            { label: 'Unpaid', value: fmt(totalUnpaid), color: 'text-yellow-600' },
            { label: 'Overdue', value: fmt(totalOverdue), color: totalOverdue > 0 ? 'text-red-600' : 'text-gray-400' },
            { label: 'Paid (All Time)', value: fmt(totalPaid), color: 'text-green-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['', 'unpaid', 'overdue', 'paid', 'void'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterStatus === s ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 hover:border-[#0F4C81]'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">New Bill</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Vendor *</label>
                <input type="text" required value={form.vendor_name} onChange={e => setForm({...form, vendor_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Vendor name" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="What is this bill for?" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Amount ($) *</label>
                <input type="number" required min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Due Date *</label>
                <input type="date" required value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Invoice/Ref #</label>
                <input type="text" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="INV-001" />
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Bill'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : bills.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-3">No bills yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add First Bill</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Vendor</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {bills.map(bill => {
                  const isOverdue = bill.status === 'unpaid' && bill.due_date < today
                  return (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium">{bill.vendor_name}</p>
                        {bill.reference && <p className="text-xs text-gray-400">{bill.reference}</p>}
                      </td>
                      <td className="p-3 text-gray-500">{bill.description || '—'}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{bill.category || 'Uncategorized'}</span></td>
                      <td className={`p-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{bill.due_date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[isOverdue ? 'overdue' : bill.status]}`}>
                          {isOverdue ? 'overdue' : bill.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-red-600">{fmt(bill.amount)}</td>
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {bill.status !== 'paid' && bill.status !== 'void' && (
                            <button onClick={() => markPaid(bill.id)} className="text-xs text-green-600 hover:underline">Mark Paid</button>
                          )}
                          {bill.status !== 'paid' && bill.status !== 'void' && (
                            <button onClick={() => voidBill(bill.id)} className="text-xs text-gray-400 hover:underline">Void</button>
                          )}
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
