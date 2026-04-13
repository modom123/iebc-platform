'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type JournalLine = {
  id: string
  account_id: string
  description: string
  debit: number
  credit: number
  accounts?: { code: string; name: string; type: string }
}

type JournalEntry = {
  id: string
  entry_number: string
  date: string
  description: string
  reference: string
  created_at: string
  journal_entry_lines: JournalLine[]
}

const fmt = (n: number) => n > 0 ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [accounts, setAccounts] = useState<{ id: string; code: string; name: string; type: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    lines: [
      { account_id: '', description: '', debit: '', credit: '' },
      { account_id: '', description: '', debit: '', credit: '' },
    ],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/accounting/journal')
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/accounting/accounts').then(r => r.json()),
      load(),
    ]).then(([accts]) => setAccounts(Array.isArray(accts) ? accts : []))
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { account_id: '', description: '', debit: '', credit: '' }] }))
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))
  const updateLine = (i: number, field: string, value: string) => {
    setForm(f => {
      const lines = [...f.lines]
      lines[i] = { ...lines[i], [field]: value }
      return { ...f, lines }
    })
  }

  const totalDebits = form.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0)
  const totalCredits = form.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.005

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isBalanced) { setError('Debits must equal credits'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: form.date,
        description: form.description,
        reference: form.reference,
        lines: form.lines.map(l => ({
          account_id: l.account_id,
          description: l.description,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
        })).filter(l => l.account_id && (l.debit > 0 || l.credit > 0)),
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        reference: '',
        lines: [
          { account_id: '', description: '', debit: '', credit: '' },
          { account_id: '', description: '', debit: '', credit: '' },
        ],
      })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">General Journal</h1>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{entries.length} entries</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ New Journal Entry</button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-5">

        {/* New Entry Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#0F4C81]">New Journal Entry</h3>
              <div className={`text-xs font-medium px-2 py-1 rounded ${isBalanced && totalDebits > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isBalanced && totalDebits > 0 ? '✓ Balanced' : `Out of balance: $${Math.abs(totalDebits - totalCredits).toFixed(2)}`}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Description / Memo</label>
                  <input type="text" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Journal entry description" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Reference</label>
                  <input type="text" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="INV-001, etc." />
                </div>
              </div>

              {/* Lines */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="p-2 text-left">Account</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right w-28">Debit</th>
                      <th className="p-2 text-right w-28">Credit</th>
                      <th className="p-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {form.lines.map((line, i) => (
                      <tr key={i}>
                        <td className="p-1.5">
                          <select value={line.account_id} onChange={e => updateLine(i, 'account_id', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs">
                            <option value="">Select account</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5">
                          <input type="text" value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Optional note" />
                        </td>
                        <td className="p-1.5">
                          <input type="number" step="0.01" min="0" value={line.debit} onChange={e => updateLine(i, 'debit', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right font-mono" placeholder="0.00" />
                        </td>
                        <td className="p-1.5">
                          <input type="number" step="0.01" min="0" value={line.credit} onChange={e => updateLine(i, 'credit', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right font-mono" placeholder="0.00" />
                        </td>
                        <td className="p-1.5 text-center">
                          {form.lines.length > 2 && <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td colSpan={2} className="p-2 text-right text-xs font-semibold text-gray-600">Totals:</td>
                      <td className={`p-2 text-right font-mono text-sm font-bold ${isBalanced ? 'text-gray-800' : 'text-red-600'}`}>${totalDebits.toFixed(2)}</td>
                      <td className={`p-2 text-right font-mono text-sm font-bold ${isBalanced ? 'text-gray-800' : 'text-red-600'}`}>${totalCredits.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <button type="button" onClick={addLine} className="text-xs text-[#0F4C81] hover:underline">+ Add Line</button>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving || !isBalanced || totalDebits === 0} className="btn-primary text-sm disabled:opacity-50">
                  {saving ? 'Posting...' : 'Post Journal Entry'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading journal entries...</div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-3">No journal entries yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Create First Entry</button>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => {
              const totalDebitsEntry = (entry.journal_entry_lines || []).reduce((s, l) => s + Number(l.debit), 0)
              const isOpen = expanded.has(entry.id)
              return (
                <div key={entry.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <span className="font-mono text-xs text-gray-400 w-20 shrink-0">{entry.entry_number || 'JE'}</span>
                      <span className="text-gray-500 text-sm shrink-0">{entry.date}</span>
                      <span className="font-medium text-gray-800">{entry.description}</span>
                      {entry.reference && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{entry.reference}</span>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-semibold text-gray-700">${totalDebitsEntry.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-gray-400 text-xs uppercase">
                            <th className="px-5 py-2 text-left">Account</th>
                            <th className="px-5 py-2 text-left">Description</th>
                            <th className="px-5 py-2 text-right">Debit</th>
                            <th className="px-5 py-2 text-right">Credit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {(entry.journal_entry_lines || []).map(line => (
                            <tr key={line.id} className="hover:bg-gray-50">
                              <td className="px-5 py-2.5">
                                {line.accounts ? (
                                  <span>
                                    <span className="font-mono text-xs text-gray-400 mr-2">{line.accounts.code}</span>
                                    <span className="text-gray-700">{line.accounts.name}</span>
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-5 py-2.5 text-gray-500">{line.description || '—'}</td>
                              <td className="px-5 py-2.5 text-right font-mono text-gray-800">{fmt(Number(line.debit))}</td>
                              <td className="px-5 py-2.5 text-right font-mono text-gray-800">{fmt(Number(line.credit))}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                          <tr>
                            <td colSpan={2} className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase">Totals</td>
                            <td className="px-5 py-2 text-right font-mono font-bold text-gray-800">
                              ${(entry.journal_entry_lines || []).reduce((s, l) => s + Number(l.debit), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-5 py-2 text-right font-mono font-bold text-gray-800">
                              ${(entry.journal_entry_lines || []).reduce((s, l) => s + Number(l.credit), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
