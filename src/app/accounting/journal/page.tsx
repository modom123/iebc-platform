'use client'

import { useState, useEffect } from 'react'

type JournalEntry = {
  id: string
  entry_number: string
  date: string
  description: string
  reference: string
  status: 'draft' | 'posted'
  total_debit: number
  total_credit: number
  lines: JournalLine[]
}

type JournalLine = {
  id?: string
  account_code: string
  account_name: string
  description: string
  debit: number
  credit: number
}

type CoAAccount = { id: string; code: string; name: string; account_type: string }

const fmt = (n: number) => n === 0 ? '—' : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const EMPTY_LINE: JournalLine = { account_code: '', account_name: '', description: '', debit: 0, credit: 0 }

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [accounts, setAccounts] = useState<CoAAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    lines: [{ ...EMPTY_LINE }, { ...EMPTY_LINE }] as JournalLine[],
  })

  useEffect(() => {
    Promise.all([fetchEntries(), fetchAccounts()])
  }, [])

  async function fetchEntries() {
    setLoading(true)
    const res = await fetch('/api/accounting/journal')
    const data = await res.json()
    setEntries(data.entries || [])
    setLoading(false)
  }

  async function fetchAccounts() {
    const res = await fetch('/api/accounting/coa')
    const data = await res.json()
    setAccounts(data.accounts || [])
  }

  function updateLine(i: number, field: keyof JournalLine, value: string | number) {
    setForm(p => {
      const lines = [...p.lines]
      if (field === 'account_code') {
        const acct = accounts.find(a => a.code === value)
        lines[i] = { ...lines[i], account_code: String(value), account_name: acct?.name || '' }
      } else {
        lines[i] = { ...lines[i], [field]: field === 'debit' || field === 'credit' ? Number(value) || 0 : value }
      }
      return { ...p, lines }
    })
  }

  function addLine() {
    setForm(p => ({ ...p, lines: [...p.lines, { ...EMPTY_LINE }] }))
  }

  function removeLine(i: number) {
    if (form.lines.length <= 2) return
    setForm(p => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }))
  }

  const totalDebit = form.lines.reduce((s, l) => s + (l.debit || 0), 0)
  const totalCredit = form.lines.reduce((s, l) => s + (l.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  async function handleSubmit(status: 'draft' | 'posted') {
    if (!isBalanced) { setMsg('Debits must equal credits before posting'); return }
    setSaving(true)
    const res = await fetch('/api/accounting/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status }),
    })
    if (res.ok) {
      setMsg(status === 'posted' ? 'Journal entry posted!' : 'Draft saved')
      setShowNew(false)
      setForm({ date: new Date().toISOString().split('T')[0], description: '', reference: '', lines: [{ ...EMPTY_LINE }, { ...EMPTY_LINE }] })
      fetchEntries()
    } else {
      const d = await res.json()
      setMsg(d.error || 'Error saving entry')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function postEntry(id: string) {
    await fetch('/api/accounting/journal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'posted' }),
    })
    fetchEntries()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manual double-entry bookkeeping — debits equal credits</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-[#0F4C81] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-800 transition font-medium">
          + New Entry
        </button>
      </div>

      {msg && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${msg.includes('Error') || msg.includes('must') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {msg}
        </div>
      )}

      {/* New Entry Form */}
      {showNew && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">New Journal Entry</h3>
            <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-sm">Date*</label>
                <input className="input-field" type="date" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label-sm">Memo / Description*</label>
                <input className="input-field" placeholder="e.g. Monthly depreciation, Accrued interest..." required value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="label-sm">Reference #</label>
                <input className="input-field" placeholder="e.g. INV-001" value={form.reference}
                  onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
              </div>
            </div>

            {/* Lines Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="p-2.5 text-left w-32">Account Code</th>
                  <th className="p-2.5 text-left">Account Name</th>
                  <th className="p-2.5 text-left hidden md:table-cell">Line Memo</th>
                  <th className="p-2.5 text-right w-28">Debit</th>
                  <th className="p-2.5 text-right w-28">Credit</th>
                  <th className="p-2.5 w-8"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {form.lines.map((line, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        <input list={`codes-${i}`} className="input-field font-mono text-xs" placeholder="1000" value={line.account_code}
                          onChange={e => updateLine(i, 'account_code', e.target.value)} />
                        <datalist id={`codes-${i}`}>
                          {accounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
                        </datalist>
                      </td>
                      <td className="p-2">
                        <input className="input-field text-xs" placeholder="Auto-fills from code" value={line.account_name}
                          onChange={e => updateLine(i, 'account_name', e.target.value)} />
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        <input className="input-field text-xs" placeholder="Optional line note" value={line.description}
                          onChange={e => updateLine(i, 'description', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="number" min="0" step="0.01" className="input-field text-right font-mono text-xs" placeholder="0.00" value={line.debit || ''}
                          onChange={e => updateLine(i, 'debit', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="number" min="0" step="0.01" className="input-field text-right font-mono text-xs" placeholder="0.00" value={line.credit || ''}
                          onChange={e => updateLine(i, 'credit', e.target.value)} />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeLine(i)} className="text-gray-300 hover:text-red-400 transition text-lg leading-none">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={`font-bold text-sm ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}>
                    <td className="p-3" colSpan={3}>
                      <button onClick={addLine} className="text-[#0F4C81] text-xs hover:underline">+ Add Line</button>
                    </td>
                    <td className="p-3 text-right font-mono">{fmt(totalDebit)}</td>
                    <td className="p-3 text-right font-mono">{fmt(totalCredit)}</td>
                    <td className="p-3 text-center text-xs">{isBalanced ? '✓' : '!'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {!isBalanced && totalDebit > 0 && (
              <p className="text-sm text-red-600 font-medium">
                Out of balance by {fmt(Math.abs(totalDebit - totalCredit))} — debits must equal credits.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => handleSubmit('posted')} disabled={saving || !isBalanced || !form.description}
                className="bg-[#0F4C81] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-40 transition">
                {saving ? 'Posting...' : 'Post Entry'}
              </button>
              <button onClick={() => handleSubmit('draft')} disabled={saving}
                className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">
                Save Draft
              </button>
              <button onClick={() => setShowNew(false)} className="text-gray-400 text-sm hover:text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">All Entries</h2>
          <span className="text-xs text-gray-400">{entries.length} entries</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm mb-3">No journal entries yet</p>
            <button onClick={() => setShowNew(true)} className="bg-[#0F4C81] text-white text-sm px-4 py-2 rounded-lg">Create First Entry</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {entries.map(entry => (
              <div key={entry.id}>
                <button
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 text-left transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-500">{entry.entry_number}</span>
                      <span className="font-medium text-sm text-gray-800">{entry.description}</span>
                      {entry.reference && <span className="text-xs text-gray-400">Ref: {entry.reference}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{entry.date}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-500">Debit</p>
                      <p className="text-sm font-mono font-semibold">{fmt(entry.total_debit)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${entry.status === 'posted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {entry.status}
                    </span>
                    {entry.status === 'draft' && (
                      <button onClick={e => { e.stopPropagation(); postEntry(entry.id) }}
                        className="text-xs text-[#0F4C81] hover:underline font-medium">Post</button>
                    )}
                    <span className="text-gray-400 text-sm">{expanded === entry.id ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expanded === entry.id && entry.lines && (
                  <div className="px-4 pb-4">
                    <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
                      <thead><tr className="bg-gray-50 text-gray-400 uppercase">
                        <th className="p-2 text-left">Code</th>
                        <th className="p-2 text-left">Account</th>
                        <th className="p-2 text-left">Memo</th>
                        <th className="p-2 text-right">Debit</th>
                        <th className="p-2 text-right">Credit</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {entry.lines.map((l, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-2 font-mono text-gray-500">{l.account_code}</td>
                            <td className="p-2 font-medium">{l.account_name}</td>
                            <td className="p-2 text-gray-500">{l.description}</td>
                            <td className="p-2 text-right font-mono">{l.debit > 0 ? fmt(l.debit) : '—'}</td>
                            <td className="p-2 text-right font-mono">{l.credit > 0 ? fmt(l.credit) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
