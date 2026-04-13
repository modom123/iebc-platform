'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Account = {
  id: string
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  subtype: string
  is_active: boolean
  balance?: number
}

const TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense']
const TYPE_COLORS: Record<string, string> = {
  asset: 'bg-blue-100 text-blue-700',
  liability: 'bg-red-100 text-red-700',
  equity: 'bg-purple-100 text-purple-700',
  revenue: 'bg-green-100 text-green-700',
  expense: 'bg-orange-100 text-orange-700',
}
const TYPE_LABELS: Record<string, string> = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
}

const SUBTYPES: Record<string, string[]> = {
  asset: ['bank', 'receivable', 'inventory', 'fixed_asset', 'prepaid', 'other_asset'],
  liability: ['payable', 'credit_card', 'loan', 'accrued', 'tax_payable', 'other_liability'],
  equity: ['equity', 'retained_earnings', 'drawings'],
  revenue: ['revenue', 'other_income'],
  expense: ['cogs', 'payroll', 'facilities', 'software', 'marketing', 'travel', 'professional', 'insurance', 'office', 'depreciation', 'misc'],
}

const fmt = (n: number) => '$' + Math.abs(Number(n || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [form, setForm] = useState({ code: '', name: '', type: 'asset', subtype: 'bank' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/accounting/accounts')
    const data = await res.json()
    setAccounts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const method = editAccount ? 'PATCH' : 'POST'
    const body = editAccount ? { id: editAccount.id, ...form } : form
    const res = await fetch('/api/accounting/accounts', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setShowForm(false)
      setEditAccount(null)
      setForm({ code: '', name: '', type: 'asset', subtype: 'bank' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const openEdit = (acc: Account) => {
    setEditAccount(acc)
    setForm({ code: acc.code, name: acc.name, type: acc.type, subtype: acc.subtype })
    setShowForm(true)
  }

  const filtered = accounts.filter(a =>
    search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)
  )

  const grouped = TYPE_ORDER.map(type => ({
    type,
    accounts: filtered.filter(a => a.type === type).sort((a, b) => a.code.localeCompare(b.code)),
  })).filter(g => g.accounts.length > 0)

  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((s, a) => s + (a.balance || 0), 0)
  const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((s, a) => s + (a.balance || 0), 0)
  const totalEquity = accounts.filter(a => a.type === 'equity').reduce((s, a) => s + (a.balance || 0), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Chart of Accounts</h1>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{accounts.length} accounts</span>
        </div>
        <button onClick={() => { setShowForm(true); setEditAccount(null); setForm({ code: '', name: '', type: 'asset', subtype: 'bank' }) }} className="btn-primary text-sm">+ Add Account</button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Balance Sheet Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Assets', value: totalAssets, color: 'text-blue-600' },
            { label: 'Total Liabilities', value: totalLiabilities, color: 'text-red-600' },
            { label: 'Total Equity', value: totalEquity, color: 'text-purple-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{fmt(c.value)}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by account name or number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0F4C81]"
        />

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">{editAccount ? 'Edit Account' : 'New Account'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Account Number</label>
                <input type="text" required value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 5100" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Account Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Office Supplies" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value, subtype: SUBTYPES[e.target.value][0]})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {TYPE_ORDER.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Subtype</label>
                <select value={form.subtype} onChange={e => setForm({...form, subtype: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {(SUBTYPES[form.type] || []).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : (editAccount ? 'Update Account' : 'Create Account')}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditAccount(null) }} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Account Groups */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading accounts...</div>
        ) : (
          <div className="space-y-4">
            {grouped.map(group => (
              <div key={group.type} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-700">{TYPE_LABELS[group.type]}</h3>
                  <span className="text-xs text-gray-400">{group.accounts.length} accounts</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                      <th className="px-5 py-2 text-left w-24">Number</th>
                      <th className="px-5 py-2 text-left">Name</th>
                      <th className="px-5 py-2 text-left">Subtype</th>
                      <th className="px-5 py-2 text-center">Status</th>
                      <th className="px-5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {group.accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono text-gray-500 text-xs">{acc.code}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{acc.name}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[acc.type]}`}>
                            {acc.subtype.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${acc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {acc.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => openEdit(acc)} className="text-[#0F4C81] hover:underline text-xs font-medium">Edit</button>
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
    </main>
  )
}
