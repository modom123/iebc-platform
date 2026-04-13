'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type WeekForecast = {
  week: number
  label: string
  from: string
  to: string
  projected_income: number
  projected_expense: number
  net: number
  bills_due: number
  recurring_income: number
  recurring_expense: number
}

type ForecastData = {
  generated_at: string
  baseline: { avg_monthly_income: number; avg_monthly_expense: number }
  forecast: WeekForecast[]
}

const fmt = (n: number) => '$' + Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 0 })
const fmtSigned = (n: number) => (n >= 0 ? '+' : '-') + fmt(n)

export default function ForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'chart' | 'table'>('chart')

  useEffect(() => {
    fetch('/api/accounting/cash-forecast')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Building forecast...</div>
    </main>
  )

  if (!data || !data.forecast) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-red-500">Failed to load forecast</div>
    </main>
  )

  const { forecast, baseline } = data
  const maxVal = Math.max(...forecast.map(w => Math.max(w.projected_income, w.projected_expense)), 1)
  const chartH = 200
  const barW = 28
  const gap = 8
  const groupW = barW * 2 + gap + 16
  const svgW = forecast.length * groupW + 40
  const totalNetCash = forecast.reduce((s, w) => s + w.net, 0)
  const weeksPositive = forecast.filter(w => w.net >= 0).length
  const largestBillWeek = forecast.reduce((best, w) => w.bills_due > best.bills_due ? w : best, forecast[0])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">90-Day Cash Flow Forecast</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('chart')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${view === 'chart' ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200'}`}>Chart</button>
          <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${view === 'table' ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200'}`}>Table</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Projected 90-Day Net</p>
            <p className={`text-2xl font-bold mt-1 ${totalNetCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtSigned(totalNetCash)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Avg Monthly Income</p>
            <p className="text-2xl font-bold mt-1 text-gray-800">{fmt(baseline.avg_monthly_income)}</p>
            <p className="text-xs text-gray-400 mt-0.5">3-month average</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Avg Monthly Expense</p>
            <p className="text-2xl font-bold mt-1 text-gray-800">{fmt(baseline.avg_monthly_expense)}</p>
            <p className="text-xs text-gray-400 mt-0.5">3-month average</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Positive Cash Weeks</p>
            <p className="text-2xl font-bold mt-1 text-gray-800">{weeksPositive} / 13</p>
          </div>
        </div>

        {/* Insight Banner */}
        {largestBillWeek && largestBillWeek.bills_due > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex gap-3 items-center">
            <span className="text-amber-500 text-xl">⚠</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Largest bill week: {largestBillWeek.label}</p>
              <p className="text-amber-700 text-xs">{fmt(largestBillWeek.bills_due)} in bills due — cash net that week: <span className={largestBillWeek.net >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>{fmtSigned(largestBillWeek.net)}</span></p>
            </div>
          </div>
        )}

        {view === 'chart' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="font-bold text-gray-800">Weekly Projected Cash Flow</h2>
              <div className="flex gap-3 ml-auto text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span>Income</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block"></span>Expense</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>Bills</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${svgW} ${chartH + 60}`} className="w-full min-w-[700px]">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = chartH - pct * chartH
                  return (
                    <g key={i}>
                      <line x1="30" y1={y} x2={svgW - 10} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                      <text x="28" y={y + 4} fontSize="9" textAnchor="end" fill="#9ca3af">{fmt(maxVal * pct)}</text>
                    </g>
                  )
                })}
                {/* Zero line */}
                <line x1="30" y1={chartH} x2={svgW - 10} y2={chartH} stroke="#e5e7eb" strokeWidth="1" />

                {forecast.map((w, i) => {
                  const x = 35 + i * groupW
                  const incomeH = Math.round((w.projected_income / maxVal) * chartH)
                  const expenseH = Math.round((w.projected_expense / maxVal) * chartH)
                  const billsH = Math.round((w.bills_due / maxVal) * chartH)
                  const isNegative = w.net < 0

                  return (
                    <g key={i}>
                      {/* Income bar */}
                      <rect x={x} y={chartH - incomeH} width={barW} height={incomeH} fill="#22c55e" rx="2" opacity="0.85" />
                      {/* Expense bar */}
                      <rect x={x + barW + gap} y={chartH - expenseH} width={barW} height={expenseH} fill="#f87171" rx="2" opacity="0.85" />
                      {/* Bills overlay (stacked on expense) */}
                      {w.bills_due > 0 && (
                        <rect x={x + barW + gap} y={chartH - billsH} width={barW} height={billsH} fill="#3b82f6" rx="2" opacity="0.6" />
                      )}
                      {/* Net indicator dot */}
                      <circle cx={x + barW + gap / 2} cy={chartH - Math.max(incomeH, expenseH) - 8} r="4" fill={isNegative ? '#ef4444' : '#10b981'} />
                      {/* Week label */}
                      <text x={x + barW + gap / 2} y={chartH + 16} fontSize="9" textAnchor="middle" fill="#6b7280">{w.label}</text>
                      {/* Net label */}
                      <text x={x + barW + gap / 2} y={chartH + 27} fontSize="8" textAnchor="middle" fill={isNegative ? '#ef4444' : '#10b981'} fontWeight="600">
                        {fmtSigned(w.net)}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
        )}

        {view === 'table' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="p-3 text-left">Week</th>
                  <th className="p-3 text-left">Period</th>
                  <th className="p-3 text-right">Proj. Income</th>
                  <th className="p-3 text-right">Proj. Expense</th>
                  <th className="p-3 text-right">Bills Due</th>
                  <th className="p-3 text-right">Recurring In</th>
                  <th className="p-3 text-right">Recurring Out</th>
                  <th className="p-3 text-right">Net Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {forecast.map((w, i) => (
                  <tr key={i} className={`hover:bg-gray-50 ${w.net < 0 ? 'bg-red-50/30' : ''}`}>
                    <td className="p-3 font-medium text-gray-700">Wk {w.week}</td>
                    <td className="p-3 text-gray-500 text-xs">{w.from} → {w.to}</td>
                    <td className="p-3 text-right text-green-600 font-mono">{fmt(w.projected_income)}</td>
                    <td className="p-3 text-right text-red-500 font-mono">{fmt(w.projected_expense)}</td>
                    <td className="p-3 text-right text-blue-600 font-mono">{w.bills_due > 0 ? fmt(w.bills_due) : '—'}</td>
                    <td className="p-3 text-right text-green-500 font-mono text-xs">{w.recurring_income > 0 ? fmt(w.recurring_income) : '—'}</td>
                    <td className="p-3 text-right text-red-400 font-mono text-xs">{w.recurring_expense > 0 ? fmt(w.recurring_expense) : '—'}</td>
                    <td className={`p-3 text-right font-bold font-mono ${w.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtSigned(w.net)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan={2} className="p-3 font-bold text-gray-700">13-Week Total</td>
                  <td className="p-3 text-right font-bold text-green-600 font-mono">{fmt(forecast.reduce((s, w) => s + w.projected_income, 0))}</td>
                  <td className="p-3 text-right font-bold text-red-500 font-mono">{fmt(forecast.reduce((s, w) => s + w.projected_expense, 0))}</td>
                  <td className="p-3 text-right font-bold text-blue-600 font-mono">{fmt(forecast.reduce((s, w) => s + w.bills_due, 0))}</td>
                  <td colSpan={2}></td>
                  <td className={`p-3 text-right font-bold font-mono ${totalNetCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtSigned(totalNetCash)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Method note */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
          <p><strong>Forecast method:</strong> Projected income uses the higher of (a) recurring income scheduled that week or (b) your 3-month historical average divided by 4.33 weeks. Projected expenses add recurring bills, scheduled bill payments, and any historical expense baseline not covered by recurring items. Generated: {new Date(data.generated_at).toLocaleString()}</p>
        </div>
      </div>
    </main>
  )
}
