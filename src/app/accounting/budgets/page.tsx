'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Budget = {
  id: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  spent?: number
}

const EXPENSE_CATEGORIES = [
  'Payroll', 'Rent & Utilities', 'Software & Subscriptions', 'Marketing',
  'Travel', 'Professional Services', 'Insurance', 'Office Supplies',
  'Cost of Goods', 'Miscellaneous',
]

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

function ProgressBar({ pct, over }: { pct: number; over: boolean }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
      <div
        className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ category: '', amount: '', period: 'monthly' })

  const load = async () => {
    setLoading(true)
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const to = now.toISOString().split('T')[0]

    const [budgetRes, txRes] = await Promise.all([
      fetch('/api/accounting/budgets'),
      fetch(`/api/accounting/transactions?type=expense&from=${from}&to=${to}&limit=500`),
    ])
    const buds = await budgetRes.json()
    const txs = await txRes.json()

    // Calculate spent per category this month
    const spentMap: Record<string, number> = {}
    if (Array.isArray(txs)) {
      for (const t of txs) {
        const cat = t.category || 'Miscellaneous'
        spentMap[cat] = (spentMap[cat] || 0) + Number(t.amount)
      }
    }

    const enriched = (Array.isArray(buds) ? buds : []).map((b: Budget) => ({
      ...b,
      spent: spentMap[b.category] || 0,
    }))

    setBudgets(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (b: Budget) => {
    setEditId(b.id)
    setForm({ category: b.category, amount: String(b.amount), period: b.period })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/budgets', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editId ? { id: editId, ...form, amount: parseFloat(form.amount) } : { ...form, amount: parseFloat(form.amount) }),
    })
    if (res.ok) {
      setShowForm(false)
      setEditId(null)
      setForm({ category: '', amount: '', period: 'monthly' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this budget?')) return
    await fetch(`/api/accounting/budgets?id=${id}`, { method: 'DELETE' })
    load()
  }

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.amount), 0)
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Budget Tracker</h1>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">This Month</span>
        </div>
        <button onClick={() => { setEditId(null); setForm({ category: '', amount: '', period: 'monthly' }); setShowForm(true) }}
          className="btn-primary text-sm">+ Set Budget</button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Budgeted', value: fmt(totalBudgeted), color: 'text-[#0F4C81]' },
            { label: 'Total Spent', value: fmt(totalSpent), color: totalSpent > totalBudgeted ? 'text-red-600' : 'text-gray-800' },
            { label: 'Remaining', value: fmt(Math.max(0, totalBudgeted - totalSpent)), color: totalSpent > totalBudgeted ? 'text-red-600' : 'text-green-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">{editId ? 'Edit Budget' : 'Set Budget'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category *</label>
                <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Budget Amount ($) *</label>
                <input type="number" required min="0" step="1" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="5000" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Period</label>
                <select value={form.period} onChange={e => setForm({...form, period: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editId ? 'Update' : 'Set Budget'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Budget Cards */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading...</div>
        ) : budgets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-400 mb-3">No budgets set yet</p>
            <p className="text-sm text-gray-400 mb-4">Set budgets for expense categories to track your spending.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Set First Budget</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(b => {
              const spent = b.spent || 0
              const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0
              const over = spent > b.amount
              const remaining = b.amount - spent
              return (
                <div key={b.id} className={`bg-white rounded-xl border p-5 ${over ? 'border-red-200' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-semibold text-gray-800">{b.category}</p>
                      <p className="text-xs text-gray-400 capitalize">{b.period}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {over && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Over budget</span>}
                      <button onClick={() => openEdit(b)} className="text-xs text-gray-400 hover:text-gray-600">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mt-3">
                    <span className={`font-bold ${over ? 'text-red-600' : 'text-gray-700'}`}>{fmt(spent)} spent</span>
                    <span className="text-gray-400">of {fmt(b.amount)}</span>
                  </div>
                  <ProgressBar pct={pct} over={over} />
                  <p className={`text-xs mt-1.5 ${over ? 'text-red-500' : remaining < b.amount * 0.2 ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {over ? `${fmt(Math.abs(remaining))} over budget` : `${fmt(remaining)} remaining · ${pct.toFixed(0)}% used`}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
