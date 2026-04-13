'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type TrialBalanceRow = { code: string; name: string; type: string; debit: number; credit: number }

type ReportData = {
  type: string
  period?: { from: string; to: string }
  summary?: Record<string, number | string>
  income?: { total: number; by_category: { category: string; amount: number }[] }
  expenses?: { total: number; by_category: { category: string; amount: number }[] }
  monthly?: { month: string; income: number; expenses: number; net: number }[]
  assets?: { accounts_receivable: number; cash: number; total: number }
  liabilities?: { accounts_payable?: number; total: number }
  equity?: { retained_earnings: number; total: number }
  rows?: TrialBalanceRow[]
  totals?: { debit: number; credit: number }
  balanced?: boolean
}

const fmt = (n: number | string) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

function ReportsInner() {
  const searchParams = useSearchParams()
  const [reportType, setReportType] = useState(searchParams.get('type') || 'pnl')
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/accounting/reports?type=${reportType}&from=${from}&to=${to}`)
    const d = await res.json()
    setData(d)
    setLoading(false)
  }, [reportType, from, to])

  useEffect(() => { load() }, [load])

  const REPORT_TYPES = [
    ['pnl', 'P&L'],
    ['cashflow', 'Cash Flow'],
    ['balance_sheet', 'Balance Sheet'],
    ['trial_balance', 'Trial Balance'],
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Reports</h1>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm py-2"
        >
          Print / Export PDF
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Controls */}
        <div className="print:hidden bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 flex-wrap">
            {REPORT_TYPES.map(([val, label]) => (
              <button key={val} onClick={() => setReportType(val)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${reportType === val ? 'bg-[#0F4C81] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto items-center">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <span className="text-gray-400 text-sm">to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Generating report...</div>
        ) : data && (

          <div className="space-y-6">
            {/* P&L */}
            {data.type === 'profit_and_loss' && data.summary && (
              <>
                <div className="print:text-center print:mb-6 hidden print:block">
                  <h2 className="text-2xl font-bold">Profit & Loss Statement</h2>
                  <p className="text-gray-500">{from} to {to}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: fmt(data.summary.total_income), color: 'text-green-600' },
                    { label: 'Total Expenses', value: fmt(data.summary.total_expenses), color: 'text-red-600' },
                    { label: 'Net Profit', value: fmt(data.summary.net_profit), color: Number(data.summary.net_profit) >= 0 ? 'text-green-600' : 'text-red-600' },
                    { label: 'Profit Margin', value: `${data.summary.profit_margin}%`, color: 'text-[#0F4C81]' },
                  ].map((c, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 text-center">
                      <p className="text-xs text-gray-500 uppercase">{c.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[{ title: 'Income', items: data.income?.by_category, color: 'text-green-600', total: data.income?.total },
                    { title: 'Expenses', items: data.expenses?.by_category, color: 'text-red-600', total: data.expenses?.total }].map(section => (
                    <div key={section.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 flex justify-between">
                        <h3 className="font-bold text-gray-800">{section.title}</h3>
                        <span className={`font-bold ${section.color}`}>{fmt(section.total || 0)}</span>
                      </div>
                      {section.items && section.items.length > 0 ? (
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-gray-50">
                            {section.items.map((row, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-600">{row.category}</td>
                                <td className={`p-3 text-right font-semibold ${section.color}`}>{fmt(row.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="p-4 text-sm text-gray-400">No {section.title.toLowerCase()} recorded</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Monthly Breakdown */}
                {data.monthly && data.monthly.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800">Monthly Breakdown</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="p-3 text-left">Month</th>
                        <th className="p-3 text-right">Revenue</th>
                        <th className="p-3 text-right">Expenses</th>
                        <th className="p-3 text-right">Net Profit</th>
                        <th className="p-3 text-right">Margin</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.monthly.map(row => {
                          const margin = row.income > 0 ? ((row.net / row.income) * 100).toFixed(1) : '—'
                          return (
                            <tr key={row.month} className="hover:bg-gray-50">
                              <td className="p-3 font-medium">{row.month}</td>
                              <td className="p-3 text-right text-green-600 font-mono">{fmt(row.income)}</td>
                              <td className="p-3 text-right text-red-600 font-mono">{fmt(row.expenses)}</td>
                              <td className={`p-3 text-right font-bold font-mono ${row.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(row.net)}</td>
                              <td className="p-3 text-right text-gray-500">{margin !== '—' ? `${margin}%` : '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                        <tr>
                          <td className="p-3 font-bold text-gray-700">Total</td>
                          <td className="p-3 text-right font-bold text-green-600 font-mono">{fmt(data.income?.total || 0)}</td>
                          <td className="p-3 text-right font-bold text-red-600 font-mono">{fmt(data.expenses?.total || 0)}</td>
                          <td className={`p-3 text-right font-bold font-mono ${Number(data.summary.net_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(data.summary.net_profit)}</td>
                          <td className="p-3 text-right text-gray-500">{data.summary.profit_margin}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Cash Flow */}
            {data.type === 'cash_flow' && data.summary && (
              <>
                <div className="print:text-center print:mb-6 hidden print:block">
                  <h2 className="text-2xl font-bold">Cash Flow Statement</h2>
                  <p className="text-gray-500">{from} to {to}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Cash In', value: fmt(data.summary.cash_in), color: 'text-green-600' },
                    { label: 'Cash Out', value: fmt(data.summary.cash_out), color: 'text-red-600' },
                    { label: 'Net Cash', value: fmt(data.summary.net_cash), color: Number(data.summary.net_cash) >= 0 ? 'text-green-600' : 'text-red-600' },
                  ].map((c, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 text-center">
                      <p className="text-xs text-gray-500 uppercase">{c.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                  ))}
                </div>

                {data.monthly && data.monthly.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100"><h3 className="font-bold">Monthly Breakdown</h3></div>
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="p-3 text-left">Month</th>
                        <th className="p-3 text-right">Cash In</th>
                        <th className="p-3 text-right">Cash Out</th>
                        <th className="p-3 text-right">Net</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.monthly.map(row => (
                          <tr key={row.month} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">{row.month}</td>
                            <td className="p-3 text-right text-green-600 font-mono">{fmt(row.income)}</td>
                            <td className="p-3 text-right text-red-600 font-mono">{fmt(row.expenses)}</td>
                            <td className={`p-3 text-right font-bold font-mono ${row.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(row.net)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Balance Sheet */}
            {data.type === 'balance_sheet' && (
              <>
                <div className="print:text-center print:mb-6 hidden print:block">
                  <h2 className="text-2xl font-bold">Balance Sheet</h2>
                  <p className="text-gray-500">As of {to}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: 'Assets', color: 'text-green-600', items: [
                      { label: 'Cash & Net Income', value: data.assets?.cash || 0 },
                      { label: 'Accounts Receivable', value: data.assets?.accounts_receivable || 0 },
                    ], total: data.assets?.total || 0 },
                    { title: 'Liabilities', color: 'text-red-600', items: [
                      { label: 'Accounts Payable', value: data.liabilities?.accounts_payable || 0 },
                    ], total: data.liabilities?.total || 0 },
                    { title: 'Equity', color: 'text-[#0F4C81]', items: [
                      { label: "Owner's Equity", value: data.equity?.retained_earnings || 0 },
                    ], total: data.equity?.total || 0 },
                  ].map(section => (
                    <div key={section.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 flex justify-between">
                        <h3 className="font-bold">{section.title}</h3>
                        <span className={`font-bold ${section.color}`}>{fmt(section.total)}</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-500">{item.label}</span>
                            <span className="font-medium font-mono">{fmt(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800 rounded-xl px-5 py-4 flex justify-between items-center">
                  <span className="text-white font-bold">Assets = Liabilities + Equity</span>
                  <span className={`font-bold text-sm px-3 py-1 rounded-full ${Math.abs((data.assets?.total || 0) - ((data.liabilities?.total || 0) + (data.equity?.total || 0))) < 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {Math.abs((data.assets?.total || 0) - ((data.liabilities?.total || 0) + (data.equity?.total || 0))) < 1 ? 'Balanced' : 'Check Entries'}
                  </span>
                </div>
              </>
            )}

            {/* Trial Balance */}
            {data.type === 'trial_balance' && (
              <>
                <div className="print:text-center print:mb-6 hidden print:block">
                  <h2 className="text-2xl font-bold">Trial Balance</h2>
                  <p className="text-gray-500">{from} to {to}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 uppercase">Total Debits</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1 font-mono">{fmt(data.totals?.debit || 0)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 uppercase">Total Credits</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1 font-mono">{fmt(data.totals?.credit || 0)}</p>
                  </div>
                  <div className={`p-5 rounded-xl border text-center ${data.balanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <p className={`text-xl font-bold mt-1 ${data.balanced ? 'text-green-700' : 'text-red-700'}`}>
                      {data.balanced ? 'Balanced' : 'Out of Balance'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Account Balances</h3>
                    <span className="text-xs text-gray-400">{data.rows?.length || 0} accounts with activity</span>
                  </div>
                  {!data.rows || data.rows.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-gray-400 text-sm">No journal entries for this period.</p>
                      <p className="text-gray-400 text-xs mt-1">Create journal entries to populate the trial balance.</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                        <th className="p-3 text-left">Code</th>
                        <th className="p-3 text-left">Account</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-right">Debit</th>
                        <th className="p-3 text-right">Credit</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {(data.rows || []).map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-3 font-mono text-gray-500">{row.code}</td>
                            <td className="p-3 font-medium text-gray-800">{row.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">{row.type}</span>
                            </td>
                            <td className="p-3 text-right font-mono">{row.debit > 0 ? fmt(row.debit) : '—'}</td>
                            <td className="p-3 text-right font-mono">{row.credit > 0 ? fmt(row.credit) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                        <tr>
                          <td colSpan={3} className="p-3 font-bold text-gray-700">Totals</td>
                          <td className="p-3 text-right font-bold font-mono">{fmt(data.totals?.debit || 0)}</td>
                          <td className="p-3 text-right font-bold font-mono">{fmt(data.totals?.credit || 0)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default function ReportsPage() {
  return <Suspense><ReportsInner /></Suspense>
}
