'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

type Transaction = { id: string; date: string; description: string; amount: number; type: string; reconciled: boolean }
type BankRow = { date: string; description: string; amount: number; matched?: string }

const fmt = (n: number) => '$' + Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function ReconcilePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [bankRows, setBankRows] = useState<BankRow[]>([])
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/accounting/transactions?limit=200')
      .then(r => r.json())
      .then(d => { setTransactions(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const lines = text.trim().split('\n').slice(1) // skip header
      const rows: BankRow[] = lines.map(line => {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
        return {
          date: cols[0] || '',
          description: cols[1] || cols[2] || '',
          amount: Math.abs(parseFloat(cols[2] || cols[3] || '0')),
        }
      }).filter(r => r.date && !isNaN(r.amount))
      setBankRows(rows)
      autoMatch(rows)
    }
    reader.readAsText(file)
  }

  const autoMatch = (rows: BankRow[]) => {
    const newMatching: Record<string, string> = {}
    rows.forEach((row, ri) => {
      const match = transactions.find(t =>
        Math.abs(Number(t.amount) - row.amount) < 0.01 &&
        Math.abs(new Date(t.date).getTime() - new Date(row.date).getTime()) < 3 * 86400000
      )
      if (match) newMatching[String(ri)] = match.id
    })
    setMatching(newMatching)
  }

  const handleSave = async () => {
    setSaving(true)
    const ids = Object.values(matching).filter(Boolean)
    await Promise.all(ids.map(id =>
      fetch('/api/accounting/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reconciled: true }),
      })
    ))
    const res = await fetch('/api/accounting/transactions?limit=200')
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
    setSaving(false)
    alert(`✓ ${ids.length} transactions marked as reconciled`)
  }

  const matchedCount = Object.values(matching).filter(Boolean).length
  const unmatchedTx = transactions.filter(t => !t.reconciled && !Object.values(matching).includes(t.id))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Bank Reconciliation</h1>
        </div>
        {bankRows.length > 0 && (
          <button onClick={handleSave} disabled={saving || matchedCount === 0} className="btn-primary text-sm">
            {saving ? 'Saving...' : `Confirm ${matchedCount} Matches`}
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Import */}
        {bankRows.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">🏦</div>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Import Bank Statement</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Upload a CSV bank export. Expected columns: Date, Description, Amount.
              We&apos;ll auto-match transactions within 3 days and within $0.01.
            </p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="btn-primary">Upload Bank CSV</button>
            <p className="text-xs text-gray-400 mt-4">Supported: Chase, Bank of America, Wells Fargo, and most CSV exports</p>
          </div>
        )}

        {/* Reconciliation View */}
        {bankRows.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {/* Stats */}
            <div className="col-span-2 grid grid-cols-4 gap-3">
              {[
                { label: 'Bank Rows', value: String(bankRows.length), color: 'text-gray-800' },
                { label: 'Auto-Matched', value: String(matchedCount), color: 'text-green-600' },
                { label: 'Unmatched', value: String(bankRows.length - matchedCount), color: 'text-yellow-600' },
                { label: 'Unreconciled in Books', value: String(unmatchedTx.length), color: 'text-red-600' },
              ].map((c, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 uppercase">{c.label}</p>
                  <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Bank Statement */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Bank Statement</h3>
                <button onClick={() => { setBankRows([]); setMatching({}) }} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
              </div>
              <div className="overflow-y-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-left">Match</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {bankRows.map((row, ri) => {
                      const matchId = matching[String(ri)]
                      const matchedTx = matchId ? transactions.find(t => t.id === matchId) : null
                      return (
                        <tr key={ri} className={`hover:bg-gray-50 ${matchedTx ? 'bg-green-50/50' : ''}`}>
                          <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{row.date}</td>
                          <td className="p-3 truncate max-w-[120px]" title={row.description}>{row.description}</td>
                          <td className="p-3 text-right font-mono">{fmt(row.amount)}</td>
                          <td className="p-3">
                            {matchedTx ? (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                <span>✓</span> {matchedTx.description.substring(0, 20)}
                              </span>
                            ) : (
                              <select
                                value={matching[String(ri)] || ''}
                                onChange={e => setMatching(prev => ({ ...prev, [String(ri)]: e.target.value }))}
                                className="text-xs border border-gray-200 rounded px-1 py-0.5 w-full max-w-[140px]"
                              >
                                <option value="">Select...</option>
                                {transactions.filter(t => !t.reconciled).map(t => (
                                  <option key={t.id} value={t.id}>{t.date} — {fmt(t.amount)}</option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unmatched in Books */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">Unreconciled Transactions</h3>
                <p className="text-xs text-gray-400 mt-0.5">Entries in your books not found in bank statement</p>
              </div>
              <div className="overflow-y-auto max-h-[500px]">
                {loading ? (
                  <div className="p-8 text-center text-gray-400">Loading...</div>
                ) : unmatchedTx.length === 0 ? (
                  <div className="p-8 text-center text-green-600 font-medium">All transactions reconciled!</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {unmatchedTx.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="p-3 text-gray-500 text-xs">{t.date}</td>
                          <td className="p-3">{t.description}</td>
                          <td className={`p-3 text-right font-mono font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
