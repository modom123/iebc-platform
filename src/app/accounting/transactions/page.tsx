'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string
  vendor: string
  project_id?: string
  reconciled?: boolean
}

type Project = { id: string; name: string }

const CATEGORIES = {
  income: ['Service Revenue', 'Product Sales', 'Consulting', 'Refund Received', 'Other Income'],
  expense: ['Payroll', 'Rent & Utilities', 'Software & Subscriptions', 'Marketing', 'Travel', 'Professional Services', 'Insurance', 'Office Supplies', 'Cost of Goods', 'Miscellaneous'],
  transfer: ['Transfer'],
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

// ── Autocomplete field ────────────────────────────────────────────────────────
function AutocompleteInput({
  value, onChange, suggestions, placeholder, required, className,
}: {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder?: string
  required?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase()) && s !== value
  ).slice(0, 6)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className={className}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {filtered.map(s => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={() => { onChange(s); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-[#0F4C81] transition truncate"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Derive frequent transactions from history ─────────────────────────────────
type FrequentTx = {
  key: string
  type: string
  description: string
  vendor: string
  category: string
  amount: number
  count: number
}

function getFrequent(transactions: Transaction[]): FrequentTx[] {
  const map = new Map<string, FrequentTx>()
  for (const t of transactions) {
    if (!t.description) continue
    const key = `${t.type}|${t.description}|${t.vendor || ''}|${t.category}`
    if (map.has(key)) {
      map.get(key)!.count++
    } else {
      map.set(key, { key, type: t.type, description: t.description, vendor: t.vendor || '', category: t.category, amount: t.amount, count: 1 })
    }
  }
  return Array.from(map.values())
    .filter(f => f.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'income', category: '', vendor: '', project_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterType) params.set('type', filterType)
    if (filterProject) params.set('project_id', filterProject)
    const qs = params.toString()
    const res = await fetch(`/api/accounting/transactions${qs ? '?' + qs : ''}`)
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/accounting/projects').then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => { load() }, [filterType, filterProject])

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
      setForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'income', category: '', vendor: '', project_id: '' })
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

  const applyFrequent = (f: FrequentTx) => {
    setForm(prev => ({
      ...prev,
      type: f.type,
      description: f.description,
      vendor: f.vendor,
      category: f.category,
      amount: String(f.amount),
    }))
  }

  // Unique sorted description/vendor lists for autocomplete
  const allTransactions = transactions  // unfiltered would be ideal but this covers most cases
  const descSuggestions = [...new Set(allTransactions.map(t => t.description).filter(Boolean))].sort()
  const vendorSuggestions = [...new Set(allTransactions.map(t => t.vendor).filter(Boolean))].sort()
  const frequent = getFrequent(allTransactions)

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Transactions</h1>
        </div>
        <div className="flex gap-2">
          <a href="/api/export?type=transactions" className="btn-secondary text-sm py-2">Export CSV</a>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Transaction</button>
        </div>
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
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {['', 'income', 'expense', 'transfer'].map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterType === t ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 hover:border-[#0F4C81]'}`}>
                {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          {projects.length > 0 && (
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="ml-auto border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#0F4C81]">New Transaction</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕ Cancel</button>
            </div>

            {/* Frequent transactions quick-fill */}
            {frequent.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Frequent — click to auto-fill</p>
                <div className="flex flex-wrap gap-2">
                  {frequent.map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => applyFrequent(f)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:border-[#0F4C81] hover:bg-blue-50 transition group"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.type === 'income' ? 'bg-green-500' : f.type === 'expense' ? 'bg-red-400' : 'bg-gray-400'}`} />
                      <span className="font-medium text-gray-700 group-hover:text-[#0F4C81] max-w-[120px] truncate">{f.description}</span>
                      {f.vendor && <span className="text-gray-400 max-w-[80px] truncate">{f.vendor}</span>}
                      <span className={`font-mono font-semibold ${f.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{fmt(f.amount)}</span>
                      <span className="text-gray-300">×{f.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value, category: ''})} className={inputCls}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Amount ($)</label>
                <input type="number" step="0.01" min="0" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className={inputCls} placeholder="0.00" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                <AutocompleteInput
                  value={form.description}
                  onChange={v => setForm({...form, description: v})}
                  suggestions={descSuggestions}
                  placeholder="What was this for?"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputCls}>
                  <option value="">Select category</option>
                  {(CATEGORIES[form.type as keyof typeof CATEGORIES] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Vendor / Payer</label>
                <AutocompleteInput
                  value={form.vendor}
                  onChange={v => setForm({...form, vendor: v})}
                  suggestions={vendorSuggestions}
                  placeholder="Company or person"
                  className={inputCls}
                />
              </div>
              {projects.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Project (optional)</label>
                  <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} className={inputCls}>
                    <option value="">No project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
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
                <th className="p-3 text-left">Project</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map(t => {
                  const proj = projects.find(p => p.id === t.project_id)
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500 whitespace-nowrap">{t.date}</td>
                      <td className="p-3 font-medium">{t.description}</td>
                      <td className="p-3 text-gray-500">{t.vendor || '—'}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{t.category || 'Uncategorized'}</span></td>
                      <td className="p-3">
                        {proj ? <Link href="/accounting/projects" className="text-xs text-[#0F4C81] hover:underline">{proj.name}</Link> : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className={`p-3 text-right font-mono font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.reconciled && <span className="text-green-400 mr-1 text-xs">✓</span>}
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
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
