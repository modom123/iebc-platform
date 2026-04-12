'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Rule = {
  id: string
  match_field: 'description' | 'vendor' | 'amount_gt' | 'amount_lt'
  match_value: string
  set_category: string
  set_type: string
  priority: number
  is_active: boolean
}

const CATEGORIES = {
  income: ['Service Revenue', 'Product Sales', 'Consulting', 'Rental Income', 'Other Income'],
  expense: ['Payroll', 'Rent & Utilities', 'Software & Subscriptions', 'Marketing', 'Travel', 'Professional Services', 'Insurance', 'Office Supplies', 'Cost of Goods', 'Miscellaneous'],
}

const FIELD_LABELS: Record<string, string> = {
  description: 'Description contains',
  vendor: 'Vendor contains',
  amount_gt: 'Amount greater than',
  amount_lt: 'Amount less than',
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ match_field: 'vendor', match_value: '', set_category: '', set_type: 'expense', priority: '0' })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/accounting/rules')
    const data = await res.json()
    setRules(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ match_field: 'vendor', match_value: '', set_category: '', set_type: 'expense', priority: '0' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const toggle = async (id: string, is_active: boolean) => {
    await fetch('/api/accounting/rules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !is_active }),
    })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this rule?')) return
    await fetch(`/api/accounting/rules?id=${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Automation Rules</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Rule</button>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* Explainer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Smart auto-categorization.</strong> Rules run when transactions are imported or created. Higher priority rules run first. Rules match case-insensitively.
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">New Automation Rule</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">When...</label>
                  <select value={form.match_field} onChange={e => setForm({...form, match_field: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {Object.entries(FIELD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Value *</label>
                  <input type="text" required value={form.match_value} onChange={e => setForm({...form, match_value: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder={form.match_field.startsWith('amount') ? '1000' : 'AWS, Netflix, Spotify...'} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Set Type To</label>
                  <select value={form.set_type} onChange={e => setForm({...form, set_type: e.target.value, set_category: ''})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="">Don't change type</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Set Category To *</label>
                  <select required value={form.set_category} onChange={e => setForm({...form, set_category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select category</option>
                    {(CATEGORIES[form.set_type as keyof typeof CATEGORIES] || [...CATEGORIES.income, ...CATEGORIES.expense]).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Priority (higher = runs first)</label>
                  <input type="number" min="0" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Rule'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Rules List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 mb-2">No rules yet</p>
              <p className="text-sm text-gray-400 mb-4">Create rules like: <em>&quot;If vendor contains AWS → Software & Subscriptions&quot;</em></p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Create First Rule</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Condition</th>
                <th className="p-3 text-left">Then Set</th>
                <th className="p-3 text-center">Priority</th>
                <th className="p-3 text-center">Active</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {rules.sort((a, b) => b.priority - a.priority).map(rule => (
                  <tr key={rule.id} className={`hover:bg-gray-50 ${!rule.is_active ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <span className="text-gray-500">{FIELD_LABELS[rule.match_field]}</span>{' '}
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{rule.match_value}</span>
                    </td>
                    <td className="p-3">
                      {rule.set_type && <span className={`mr-1 px-2 py-0.5 rounded-full text-xs font-medium ${rule.set_type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{rule.set_type}</span>}
                      <span className="font-medium">{rule.set_category}</span>
                    </td>
                    <td className="p-3 text-center text-gray-500">{rule.priority}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => toggle(rule.id, rule.is_active)}
                        className={`relative inline-flex h-5 w-9 rounded-full transition ${rule.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${rule.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => del(rule.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
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
