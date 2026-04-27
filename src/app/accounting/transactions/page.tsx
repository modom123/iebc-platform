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
  project_id?: string
  reconciled?: boolean
}

type Project = { id: string; name: string }

const CATEGORIES = {
  income: ['Service Revenue', 'Product Sales', 'Consulting', 'Refund Received', 'Other Income'],
  expense: ['Payroll', 'Rent & Utilities', 'Software & Subscriptions', 'Marketing', 'Travel', 'Professional Services', 'Insurance', 'Office Supplies', 'Cost of Goods', 'Miscellaneous'],
  transfer: ['Transfer'],
}

const EMPTY_FORM = { date: '', description: '', amount: '', type: 'income', category: '', vendor: '', project_id: '' }
const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [form, setForm] = useState({ ...EMPTY_FORM, date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<typeof EMPTY_FORM & { date: string }>({ ...EMPTY_FORM, date: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

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

    // Optimistically add
    const tempId = 'temp-' + Date.now()
    const optimistic: Transaction = {
      id: tempId,
      date: form.date,
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type as Transaction['type'],
      category: form.category,
      vendor: form.vendor,
      project_id: form.project_id || undefined,
      reconciled: false,
    }
    setTransactions(prev => [optimistic, ...prev])
    setShowForm(false)
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().split('T')[0] })

    const res = await fetch('/api/accounting/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const saved = await res.json()
      setTransactions(prev => prev.map(t => t.id === tempId ? saved : t))
    } else {
      const d = await res.json()
      setTransactions(prev => prev.filter(t => t.id !== tempId))
      setShowForm(true)
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const startEdit = (t: Transaction) => {
    setEditingId(t.id)
    setEditForm({
      date: t.date,
      description: t.description,
      amount: String(t.amount),
      type: t.type,
      category: t.category || '',
      vendor: t.vendor || '',
      project_id: t.project_id || '',
    })
    setEditError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditError('')
  }

  const handleEditSave = async (id: string) => {
    setEditSaving(true)
    setEditError('')

    const updated: Transaction = {
      id,
      date: editForm.date,
      description: editForm.description,
      amount: parseFloat(editForm.amount),
      type: editForm.type as Transaction['type'],
      category: editForm.category,
      vendor: editForm.vendor,
      project_id: editForm.project_id || undefined,
    }

    // Optimistically update
    const prev = transactions
    setTransactions(txns => txns.map(t => t.id === id ? { ...t, ...updated } : t))
    setEditingId(null)

    const res = await fetch('/api/accounting/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm, amount: parseFloat(editForm.amount) }),
    })

    if (!res.ok) {
      const d = await res.json()
      setTransactions(prev)
      setEditingId(id)
      setEditError(d.error || 'Failed to update')
    }
    setEditSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return

    // Optimistically remove
    const prev = transactions
    setTransactions(txns => txns.filter(t => t.id !== id))

    const res = await fetch(`/api/accounting/transactions?id=${id}`, { method: 'DELETE' })
    if (!res.ok) setTransactions(prev)
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
              {projects.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Project (optional)</label>
                  <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
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
                  const isTemp = t.id.startsWith('temp-')

                  if (editingId === t.id) {
                    return (
                      <tr key={t.id} className="bg-blue-50">
                        <td className="p-2">
                          <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
                        </td>
                        <td className="p-2">
                          <input type="text" required value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
                        </td>
                        <td className="p-2">
                          <input type="text" value={editForm.vendor} onChange={e => setEditForm({...editForm, vendor: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" placeholder="Vendor" />
                        </td>
                        <td className="p-2">
                          <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1 text-xs">
                            <option value="">Uncategorized</option>
                            {(CATEGORIES[editForm.type as keyof typeof CATEGORIES] || []).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="p-2">
                          {projects.length > 0 ? (
                            <select value={editForm.project_id} onChange={e => setEditForm({...editForm, project_id: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1 text-xs">
                              <option value="">No project</option>
                              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          ) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="p-2">
                          <div className="flex flex-col gap-1 items-end">
                            <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value, category: ''})} className="border border-gray-300 rounded px-2 py-1 text-xs w-24">
                              <option value="income">Income</option>
                              <option value="expense">Expense</option>
                              <option value="transfer">Transfer</option>
                            </select>
                            <input type="number" step="0.01" min="0" required value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="border border-gray-300 rounded px-2 py-1 text-xs w-24 text-right" />
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          {editError && <p className="text-red-500 text-xs mb-1">{editError}</p>}
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleEditSave(t.id)} disabled={editSaving} className="px-2 py-1 bg-[#0F4C81] text-white rounded text-xs hover:bg-[#0a3a66] disabled:opacity-50">
                              {editSaving ? '...' : 'Save'}
                            </button>
                            <button onClick={cancelEdit} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={t.id} className={`hover:bg-gray-50 transition-opacity ${isTemp ? 'opacity-60' : ''}`}>
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
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => startEdit(t)}
                            disabled={isTemp}
                            className="text-[#0F4C81] hover:text-[#0a3a66] text-xs disabled:opacity-40"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDelete(t.id)} disabled={isTemp} className="text-red-400 hover:text-red-600 text-xs disabled:opacity-40">Delete</button>
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
