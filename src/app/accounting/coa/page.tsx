'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Account = {
  id: string
  code: string
  name: string
  account_type: string
  sub_type: string
  description: string
  is_active: boolean
  balance: number
}

const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Cost of Goods Sold']
const SUB_TYPES: Record<string, string[]> = {
  Asset: ['Current Asset', 'Fixed Asset', 'Other Asset'],
  Liability: ['Current Liability', 'Long-term Liability', 'Other Liability'],
  Equity: ["Owner's Equity", 'Retained Earnings', 'Other Equity'],
  Revenue: ['Operating Revenue', 'Other Revenue'],
  Expense: ['Operating Expense', 'Payroll', 'Rent', 'Utilities', 'Marketing', 'Professional Services', 'Insurance', 'Depreciation', 'Other Expense'],
  'Cost of Goods Sold': ['COGS'],
}

const TYPE_COLOR: Record<string, string> = {
  Asset: 'bg-blue-50 text-blue-700 border-blue-200',
  Liability: 'bg-red-50 text-red-700 border-red-200',
  Equity: 'bg-purple-50 text-purple-700 border-purple-200',
  Revenue: 'bg-green-50 text-green-700 border-green-200',
  Expense: 'bg-orange-50 text-orange-700 border-orange-200',
  'Cost of Goods Sold': 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('All')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    code: '', name: '', account_type: 'Expense', sub_type: 'Operating Expense', description: '',
  })

  useEffect(() => { fetchAccounts() }, [])

  async function fetchAccounts() {
    setLoading(true)
    const res = await fetch('/api/accounting/coa')
    const data = await res.json()
    setAccounts(data.accounts || [])
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/accounting/coa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setMsg('Account created')
      setShowAdd(false)
      setForm({ code: '', name: '', account_type: 'Expense', sub_type: 'Operating Expense', description: '' })
      fetchAccounts()
    } else {
      const d = await res.json()
      setMsg(d.error || 'Error creating account')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function toggleActive(id: string, is_active: boolean) {
    await fetch('/api/accounting/coa', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !is_active }),
    })
    fetchAccounts()
  }

  const filtered = accounts.filter(a => {
    const matchType = filterType === 'All' || a.account_type === filterType
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)
    return matchType && matchSearch
  })

  const grouped: Record<string, Account[]> = {}
  for (const a of filtered) {
    if (!grouped[a.account_type]) grouped[a.account_type] = []
    grouped[a.account_type].push(a)
  }

  const totalAssets = accounts.filter(a => a.account_type === 'Asset').reduce((s, a) => s + Number(a.balance), 0)
  const totalLiabilities = accounts.filter(a => a.account_type === 'Liability').reduce((s, a) => s + Number(a.balance), 0)
  const totalRevenue = accounts.filter(a => a.account_type === 'Revenue').reduce((s, a) => s + Number(a.balance), 0)
  const totalExpenses = accounts.filter(a => a.account_type === 'Expense').reduce((s, a) => s + Number(a.balance), 0)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">General ledger account structure — the foundation of your books</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetch('/api/accounting/coa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'seed' }) }).then(() => fetchAccounts())}
            className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            Seed Default CoA
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm bg-[#0F4C81] text-white px-4 py-1.5 rounded-lg hover:bg-blue-800 transition font-medium"
          >
            + Add Account
          </button>
        </div>
      </div>

      {msg && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${msg.includes('Error') || msg.includes('error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {msg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Assets', value: fmt(totalAssets), color: 'text-blue-700' },
          { label: 'Total Liabilities', value: fmt(totalLiabilities), color: 'text-red-600' },
          { label: 'Total Revenue', value: fmt(totalRevenue), color: 'text-green-700' },
          { label: 'Total Expenses', value: fmt(totalExpenses), color: 'text-orange-600' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Add Account Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">New Account</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label-sm">Account Code*</label>
              <input className="input-field" placeholder="e.g. 1000" required value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="label-sm">Account Name*</label>
              <input className="input-field" placeholder="e.g. Cash and Cash Equivalents" required value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label-sm">Account Type*</label>
              <select className="input-field" value={form.account_type}
                onChange={e => setForm(p => ({ ...p, account_type: e.target.value, sub_type: SUB_TYPES[e.target.value]?.[0] || '' }))}>
                {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-sm">Sub-Type</label>
              <select className="input-field" value={form.sub_type}
                onChange={e => setForm(p => ({ ...p, sub_type: e.target.value }))}>
                {(SUB_TYPES[form.account_type] || []).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-sm">Description</label>
              <input className="input-field" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="col-span-2 md:col-span-3 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-[#0F4C81] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                {saving ? 'Saving...' : 'Create Account'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input className="input-field w-64" placeholder="Search accounts..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['All', ...ACCOUNT_TYPES].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${filterType === t ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table — grouped by type */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium mb-1">No accounts found</p>
          <p className="text-sm text-gray-400 mb-4">Use &ldquo;Seed Default CoA&rdquo; to load a standard chart of accounts, or add accounts manually.</p>
          <button onClick={() => setShowAdd(true)} className="bg-[#0F4C81] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800">Add First Account</button>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).sort((a, b) => {
            const order = ['Asset', 'Liability', 'Equity', 'Revenue', 'Cost of Goods Sold', 'Expense']
            return order.indexOf(a[0]) - order.indexOf(b[0])
          }).map(([type, accts]) => (
            <div key={type} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className={`px-4 py-2 flex items-center justify-between border-b ${TYPE_COLOR[type] || 'bg-gray-50 border-gray-200'}`}>
                <span className="font-semibold text-sm">{type}</span>
                <span className="text-xs font-medium">{accts.length} accounts</span>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-400 text-xs uppercase">
                  <th className="p-3 text-left w-24">Code</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left hidden md:table-cell">Sub-Type</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {accts.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })).map(acct => (
                    <tr key={acct.id} className={`hover:bg-gray-50 ${!acct.is_active ? 'opacity-50' : ''}`}>
                      <td className="p-3 font-mono text-gray-500 font-medium">{acct.code}</td>
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{acct.name}</p>
                        {acct.description && <p className="text-xs text-gray-400">{acct.description}</p>}
                      </td>
                      <td className="p-3 text-gray-500 hidden md:table-cell">{acct.sub_type}</td>
                      <td className="p-3 text-right font-mono font-semibold text-gray-800">{fmt(acct.balance)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${acct.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {acct.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => toggleActive(acct.id, acct.is_active)}
                          className="text-xs text-gray-400 hover:text-gray-700 underline">
                          {acct.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
