'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  incomeCategories: string[]
  expenseCategories: string[]
}

export default function TransactionForm({ incomeCategories, expenseCategories }: Props) {
  const router = useRouter()
  const [type, setType] = useState<'income' | 'expense'>('income')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })

  const categories = type === 'income' ? incomeCategories : expenseCategories

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...form }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save')
      }
      setForm({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Type Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => { setType('income'); setForm(f => ({ ...f, category: '' })) }}
          className={`flex-1 py-2 text-sm font-semibold transition ${type === 'income' ? 'bg-green-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          + Income
        </button>
        <button
          type="button"
          onClick={() => { setType('expense'); setForm(f => ({ ...f, category: '' })) }}
          className={`flex-1 py-2 text-sm font-semibold transition ${type === 'expense' ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          - Expense
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
        <select
          required
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
        >
          <option value="">Select category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <input
          required
          type="text"
          placeholder="e.g. Client payment – Apex Co."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input
            required
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[#0F4C81] text-white rounded-lg text-sm font-semibold hover:bg-[#082D4F] disabled:opacity-50 transition"
      >
        {loading ? 'Saving...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
      </button>
    </form>
  )
}
