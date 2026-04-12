'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Recurring = {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  vendor: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  next_date: string
  end_date: string | null
  is_active: boolean
}

const CATEGORIES = {
  income: ['Service Revenue', 'Product Sales', 'Consulting', 'Rental Income', 'Other Income'],
  expense: ['Payroll', 'Rent & Utilities', 'Software & Subscriptions', 'Marketing', 'Insurance', 'Professional Services', 'Miscellaneous'],
}

const FREQ_LABELS: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }
const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function RecurringPage() {
  const [items, setItems] = useState<Recurring[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    description: '', amount: '', type: 'expense', category: '', vendor: '',
    frequency: 'monthly', next_date: new Date().toISOString().split('T')[0], end_date: '',
  })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/accounting/recurring')
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ description: '', amount: '', type: 'expense', category: '', vendor: '', frequency: 'monthly', next_date: new Date().toISOString().split('T')[0], end_date: '' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const toggle = async (id: string, is_active: boolean) => {
    await fetch('/api/accounting/recurring', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !is_active }),
    })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this recurring entry?')) return
    await fetch(`/api/accounting/recurring?id=${id}`, { method: 'DELETE' })
    load()
  }

  const monthlyTotal = items.filter(i => i.is_active).reduce((s, i) => {
    const mult = i.frequency === 'daily' ? 30 : i.frequency === 'weekly' ? 4 : i.frequency === 'yearly' ? 1 / 12 : 1
    return s + (i.type === 'income' ? 1 : -1) * Number(i.amount) * mult
  }, 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Recurring Transactions</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Recurring</button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Active Rules</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{items.filter(i => i.is_active).length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Monthly Net Impact</p>
            <p className={`text-xl font-bold mt-1 ${monthlyTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(Math.abs(monthlyTotal))}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Upcoming (7 days)</p>
            <p className="text-xl font-bold text-[#0F4C81] mt-1">
              {items.filter(i => {
                const d = new Date(i.next_date)
                const now = new Date()
                const week = new Date(now.getTime() + 7 * 86400000)
                return i.is_active && d >= now && d <= week
              }).length}
            </p>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">New Recurring Transaction</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Description *</label>
                <input type="text" required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. AWS Monthly Subscription" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Amount ($) *</label>
                <input type="number" required min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value, category: ''})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select category</option>
                  {(CATEGORIES[form.type as keyof typeof CATEGORIES] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Vendor / Payer</label>
                <input type="text" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Company name" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Frequency</label>
                <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">First / Next Date *</label>
                <input type="date" required value={form.next_date} onChange={e => setForm({...form, next_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">End Date (optional)</label>
                <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Create Recurring'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 mb-2">No recurring transactions yet</p>
              <p className="text-sm text-gray-400 mb-4">Set up subscriptions, salaries, rent, or any repeating income/expense.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add First Recurring</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Vendor</th>
                <th className="p-3 text-left">Frequency</th>
                <th className="p-3 text-left">Next Date</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${!item.is_active ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </td>
                    <td className="p-3 text-gray-500">{item.vendor || '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{FREQ_LABELS[item.frequency]}</span>
                    </td>
                    <td className="p-3 text-gray-500">{item.next_date}</td>
                    <td className={`p-3 text-right font-mono font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.type === 'income' ? '+' : '-'}{fmt(item.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => toggle(item.id, item.is_active)}
                        className={`relative inline-flex h-5 w-9 rounded-full transition ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${item.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => del(item.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
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
