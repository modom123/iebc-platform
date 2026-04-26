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
  income:   ['Service Revenue', 'Product Sales', 'Consulting', 'Refund Received', 'Other Income'],
  expense:  ['Payroll', 'Rent & Utilities', 'Software & Subscriptions', 'Marketing', 'Travel', 'Professional Services', 'Insurance', 'Office Supplies', 'Cost of Goods', 'Miscellaneous'],
  transfer: ['Transfer'],
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent placeholder:text-gray-400 transition-all min-h-[44px]'

// ── Accessible autocomplete input ─────────────────────────────────────────────
function AutocompleteInput({
  id, value, onChange, suggestions, placeholder, required, className,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder?: string
  required?: boolean
  className?: string
}) {
  const [open, setOpen]         = useState(false)
  const [activeIdx, setActive]  = useState(-1)
  const containerRef            = useRef<HTMLDivElement>(null)
  const listId                  = `${id}-list`

  const filtered = suggestions
    .filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value)
    .slice(0, 7)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setActive(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setActive(-1) }, [filtered.length])

  const choose = (s: string) => { onChange(s); setOpen(false); setActive(-1) }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); choose(filtered[activeIdx]) }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); setActive(-1) }
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        id={id}
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && filtered.length > 0}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={activeIdx >= 0 ? `${listId}-opt-${activeIdx}` : undefined}
        onChange={e => { onChange(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {open && filtered.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
        >
          {filtered.map((s, i) => (
            <li
              key={s}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={activeIdx === i}
              onMouseDown={e => { e.preventDefault(); choose(s) }}
              className={`px-3 py-2.5 text-sm cursor-pointer transition ${
                activeIdx === i ? 'bg-[#EEF4FB] text-[#0F4C81] font-medium' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Frequent transactions ─────────────────────────────────────────────────────
type FreqTx = { key: string; type: string; description: string; vendor: string; category: string; amount: number; count: number }

function getFrequent(txs: Transaction[]): FreqTx[] {
  const map = new Map<string, FreqTx>()
  for (const t of txs) {
    if (!t.description) continue
    const key = `${t.type}|${t.description}|${t.vendor || ''}|${t.category}`
    if (map.has(key)) { map.get(key)!.count++ }
    else map.set(key, { key, type: t.type, description: t.description, vendor: t.vendor || '', category: t.category, amount: t.amount, count: 1 })
  }
  return Array.from(map.values()).filter(f => f.count >= 2).sort((a, b) => b.count - a.count).slice(0, 5)
}

// ── Table loading skeleton ────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="p-6 space-y-3" aria-label="Loading transactions" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 shrink-0" />
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded w-28 shrink-0 hidden sm:block" />
          <div className="h-4 bg-gray-200 rounded w-20 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [projects, setProjects]         = useState<Project[]>([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [filterType, setFilterType]     = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '', amount: '', type: 'income', category: '', vendor: '', project_id: '',
  })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterType)    params.set('type', filterType)
    if (filterProject) params.set('project_id', filterProject)
    const qs = params.toString()
    const res  = await fetch(`/api/accounting/transactions${qs ? '?' + qs : ''}`)
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
    setSaving(true); setError('')
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

  const applyFrequent = (f: FreqTx) => {
    setForm(p => ({ ...p, type: f.type, description: f.description, vendor: f.vendor, category: f.category, amount: String(f.amount) }))
  }

  const descSuggestions   = [...new Set(transactions.map(t => t.description).filter(Boolean))].sort()
  const vendorSuggestions = [...new Set(transactions.map(t => t.vendor).filter(Boolean))].sort()
  const frequent          = getFrequent(transactions)

  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300" aria-hidden="true">|</span>
          <h1 className="font-bold text-gray-800">Transactions</h1>
        </div>
        <div className="flex gap-2">
          <a href="/api/export?type=transactions" className="btn-secondary text-sm py-2">Export CSV</a>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Transaction</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* KPI Summary */}
        <div className="grid grid-cols-3 gap-4" role="region" aria-label="Financial summary">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Income</p>
            <p className="text-xl font-bold text-green-600 mt-1" aria-label={`Total income: ${fmt(totalIncome)}`}>{fmt(totalIncome)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Expenses</p>
            <p className="text-xl font-bold text-red-600 mt-1" aria-label={`Total expenses: ${fmt(totalExpenses)}`}>{fmt(totalExpenses)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Net</p>
            <p className={`text-xl font-bold mt-1 ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}
               aria-label={`Net: ${fmt(totalIncome - totalExpenses)}`}>
              {fmt(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center" role="toolbar" aria-label="Filter transactions">
          <div className="flex gap-1" role="group" aria-label="Filter by type">
            {['', 'income', 'expense', 'transfer'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                aria-pressed={filterType === t}
                className={`px-4 py-2 rounded-full text-sm font-medium transition min-h-[36px] ${filterType === t ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 hover:border-[#0F4C81] text-gray-600'}`}>
                {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          {projects.length > 0 && (
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              aria-label="Filter by project"
              className="ml-auto border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-h-[36px]">
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>

        {/* Add Form */}
        {showForm && (
          <section className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm space-y-5" aria-label="New transaction form">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#0F4C81]">New Transaction</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="text-gray-400 hover:text-gray-600 text-lg leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                ✕
              </button>
            </div>

            {/* Frequent quick-fill */}
            {frequent.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Frequent — click to fill</p>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Frequent transactions">
                  {frequent.map(f => (
                    <button
                      key={f.key}
                      type="button"
                      role="listitem"
                      onClick={() => applyFrequent(f)}
                      aria-label={`Fill ${f.description}, ${fmt(f.amount)}`}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:border-[#0F4C81] hover:bg-[#EEF4FB] transition group min-h-[36px]">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${f.type === 'income' ? 'bg-green-500' : f.type === 'expense' ? 'bg-red-400' : 'bg-gray-400'}`} aria-hidden="true" />
                      <span className="font-medium text-gray-700 group-hover:text-[#0F4C81] max-w-[120px] truncate">{f.description}</span>
                      {f.vendor && <span className="text-gray-400 max-w-[80px] truncate hidden sm:inline">{f.vendor}</span>}
                      <span className={`font-mono font-semibold ${f.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{fmt(f.amount)}</span>
                      <span className="text-gray-300">×{f.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tx-date" className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Date</label>
                <input id="tx-date" type="date" required value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                  className={inputCls} />
              </div>
              <div>
                <label htmlFor="tx-type" className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Type</label>
                <select id="tx-type" value={form.type}
                  onChange={e => setForm({...form, type: e.target.value, category: ''})}
                  className={inputCls}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label htmlFor="tx-amount" className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Amount ($)</label>
                <input id="tx-amount" type="number" step="0.01" min="0" required value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  placeholder="0.00"
                  className={inputCls} />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="tx-description" className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Description</label>
                <AutocompleteInput
                  id="tx-description"
                  value={form.description}
                  onChange={v => setForm({...form, description: v})}
                  suggestions={descSuggestions}
                  placeholder="What was this for?"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="tx-category" className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Category</label>
                <select id="tx-category" value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className={inputCls}>
                  <option value="">Select category</option>
                  {(CATEGORIES[form.type as keyof typeof CATEGORIES] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="tx-vendor" className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Vendor / Payer</label>
                <AutocompleteInput
                  id="tx-vendor"
                  value={form.vendor}
                  onChange={v => setForm({...form, vendor: v})}
                  suggestions={vendorSuggestions}
                  placeholder="Company or person"
                  className={inputCls}
                />
              </div>
              {projects.length > 0 && (
                <div>
                  <label htmlFor="tx-project" className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Project (optional)</label>
                  <select id="tx-project" value={form.project_id}
                    onChange={e => setForm({...form, project_id: e.target.value})}
                    className={inputCls}>
                    <option value="">No project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {error && (
                <p role="alert" className="col-span-full text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  {saving ? <><span className="spinner-sm" aria-hidden="true" /> Saving…</> : 'Save Transaction'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </section>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-3xl">💰</span>
              </div>
              <p className="font-semibold text-gray-700 mb-1">
                {filterType ? `No ${filterType} transactions` : 'No transactions yet'}
              </p>
              <p className="text-sm text-gray-400 mb-5">
                {filterType ? 'Try a different filter or add a new transaction.' : 'Add your first transaction to start tracking your finances.'}
              </p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add Transaction</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                    <th scope="col" className="p-3 text-left font-semibold">Date</th>
                    <th scope="col" className="p-3 text-left font-semibold">Description</th>
                    <th scope="col" className="p-3 text-left font-semibold">Vendor</th>
                    <th scope="col" className="p-3 text-left font-semibold">Category</th>
                    <th scope="col" className="p-3 text-left font-semibold">Project</th>
                    <th scope="col" className="p-3 text-right font-semibold">Amount</th>
                    <th scope="col" className="p-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(t => {
                    const proj = projects.find(p => p.id === t.project_id)
                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-500 whitespace-nowrap tabular-nums">{t.date}</td>
                        <td className="p-3 font-medium text-gray-800 max-w-[200px] truncate" title={t.description}>{t.description}</td>
                        <td className="p-3 text-gray-500 max-w-[120px] truncate" title={t.vendor || ''}>{t.vendor || '—'}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">{t.category || 'Uncategorized'}</span>
                        </td>
                        <td className="p-3">
                          {proj
                            ? <Link href="/accounting/projects" className="text-xs text-[#0F4C81] hover:underline">{proj.name}</Link>
                            : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className={`p-3 text-right font-mono font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="sr-only">{t.type === 'income' ? 'Income' : 'Expense'}:</span>
                          {t.reconciled && <span className="text-green-400 mr-1 text-xs" aria-label="Reconciled">✓</span>}
                          {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(t.id)}
                            aria-label={`Delete transaction: ${t.description}`}
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition min-h-[32px] font-medium">
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
