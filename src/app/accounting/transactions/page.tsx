'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string
  vendor: string
}

const CATEGORIES = {
  income: ['Service Revenue', 'Product Sales', 'Consulting', 'Refund Received', 'Other Income'],
  expense: ['Payroll', 'Rent & Utilities', 'Software & Subscriptions', 'Marketing', 'Travel', 'Professional Services', 'Insurance', 'Office Supplies', 'Cost of Goods', 'Miscellaneous'],
  transfer: ['Transfer'],
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'income', category: '', vendor: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const params = filterType ? `?type=${filterType}` : ''
    const res = await fetch(`/api/accounting/transactions${params}`)
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'income', category: '', vendor: '' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    await fetch(`/api/accounting/transactions?id=${id}`, { method: 'DELETE' })
    load()
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Transactions</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Transaction</button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Total Income</p>
            <p className="text-xl font-bold text-green-600 mt-1">{fmt(totalIncome)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Total Expenses</p>
            <p className="text-xl font-bold text-red-600 mt-1">{fmt(totalExpenses)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Net</p>
            <p className={`text-xl font-bold mt-1 ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(totalIncome - totalExpenses)}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['', 'income', 'expense', 'transfer'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterType === t ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 hover:border-[#0F4C81]'}`}>
              {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">New Transaction</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value, category: ''})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Amount ($)</label>
                <input type="number" step="0.01" min="0" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                <input type="text" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="What was this for?" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select category</option>
                  {(CATEGORIES[form.type as keyof typeof CATEGORIES] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Vendor / Payer</label>
                <input type="text" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Company or person" />
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Transaction'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-3">No transactions yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add First Transaction</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Vendor</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="p-3 font-medium">{t.description}</td>
                    <td className="p-3 text-gray-500">{t.vendor || '—'}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{t.category || 'Uncategorized'}</span></td>
                    <td className={`p-3 text-right font-mono font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
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
