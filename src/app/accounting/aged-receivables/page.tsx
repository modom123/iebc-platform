'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Invoice = {
  id: string
  invoice_number: string
  status: string
  total: number
  due_date: string
  created_at: string
  customer_id: string
  customers?: { name: string; email: string }
}

type AgedBucket = { label: string; from: number; to: number; invoices: Invoice[]; total: number }

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

function daysPastDue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  return Math.floor((today.getTime() - due.getTime()) / 86400000)
}

export default function AgedReceivablesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState('')

  useEffect(() => {
    fetch('/api/accounting/invoices?status=sent')
      .then(r => r.json())
      .then(d => {
        const all = Array.isArray(d) ? d : []
        // Include sent + overdue invoices (not paid/void)
        setInvoices(all.filter((inv: Invoice) => inv.status === 'sent' || inv.status === 'overdue'))
        setLoading(false)
      })
  }, [])

  const today = new Date()
  const buckets: AgedBucket[] = [
    { label: 'Current (not yet due)', from: -9999, to: 0, invoices: [], total: 0 },
    { label: '1–30 Days', from: 1, to: 30, invoices: [], total: 0 },
    { label: '31–60 Days', from: 31, to: 60, invoices: [], total: 0 },
    { label: '61–90 Days', from: 61, to: 90, invoices: [], total: 0 },
    { label: '91+ Days', from: 91, to: 9999, invoices: [], total: 0 },
  ]

  const filtered = selectedCustomer
    ? invoices.filter(inv => inv.customers?.name === selectedCustomer)
    : invoices

  filtered.forEach(inv => {
    const dpd = daysPastDue(inv.due_date)
    const bucket = buckets.find(b => dpd >= b.from && dpd <= b.to)
    if (bucket) {
      bucket.invoices.push(inv)
      bucket.total += Number(inv.total)
    }
  })

  const grandTotal = filtered.reduce((s, inv) => s + Number(inv.total), 0)
  const criticalTotal = buckets.slice(3).reduce((s, b) => s + b.total, 0) // 61+ days

  // Unique customers for filter
  const customers = Array.from(new Set(invoices.map(inv => inv.customers?.name).filter(Boolean))) as string[]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Aged Receivables</h1>
        </div>
        <div className="flex gap-2">
          <a href="/api/export?type=invoices" className="btn-secondary text-sm py-2">Export CSV</a>
          <Link href="/accounting/invoices/new" className="btn-primary text-sm">+ New Invoice</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Total Outstanding</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{fmt(grandTotal)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Open Invoices</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">61+ Days Overdue</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{fmt(criticalTotal)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Avg Days Outstanding</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {filtered.length > 0
                ? Math.round(filtered.reduce((s, inv) => s + Math.max(0, daysPastDue(inv.due_date)), 0) / filtered.length)
                : 0}
            </p>
          </div>
        </div>

        {/* Critical alert */}
        {criticalTotal > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex gap-3 items-center">
            <span className="text-red-500 text-xl">!</span>
            <div>
              <p className="font-semibold text-red-800 text-sm">{fmt(criticalTotal)} is 61+ days past due</p>
              <p className="text-red-600 text-xs">Consider sending collection notices or writing off bad debt for these invoices.</p>
            </div>
          </div>
        )}

        {/* Customer filter */}
        {customers.length > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Filter by customer:</span>
            <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
              <option value="">All Customers</option>
              {customers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Aged Buckets */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">✓</p>
            <p className="font-semibold text-gray-700">No outstanding invoices</p>
            <p className="text-gray-400 text-sm mt-1">All invoices have been collected. Great work!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {buckets.map((bucket, bi) => {
              if (bucket.invoices.length === 0) return null
              const isOverdue = bi >= 1
              const isCritical = bi >= 3
              return (
                <div key={bi} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isCritical ? 'border-red-200' : isOverdue ? 'border-yellow-200' : 'border-gray-200'}`}>
                  <div className={`px-5 py-3 border-b flex items-center justify-between ${isCritical ? 'bg-red-50 border-red-100' : isOverdue ? 'bg-yellow-50 border-yellow-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <h3 className={`font-bold text-sm ${isCritical ? 'text-red-700' : isOverdue ? 'text-yellow-700' : 'text-gray-700'}`}>{bucket.label}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCritical ? 'bg-red-100 text-red-700' : isOverdue ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                        {bucket.invoices.length} invoice{bucket.invoices.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className={`font-bold ${isCritical ? 'text-red-700' : isOverdue ? 'text-yellow-700' : 'text-gray-700'}`}>{fmt(bucket.total)}</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                        <th className="px-5 py-2 text-left">Invoice</th>
                        <th className="px-5 py-2 text-left">Customer</th>
                        <th className="px-5 py-2 text-left">Due Date</th>
                        <th className="px-5 py-2 text-right">Days Past Due</th>
                        <th className="px-5 py-2 text-right">Amount</th>
                        <th className="px-5 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bucket.invoices.map(inv => {
                        const dpd = daysPastDue(inv.due_date)
                        return (
                          <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3">
                              <Link href={`/accounting/invoices/${inv.id}`} className="font-medium text-[#0F4C81] hover:underline">
                                {inv.invoice_number}
                              </Link>
                            </td>
                            <td className="px-5 py-3 text-gray-700">{inv.customers?.name || '—'}</td>
                            <td className="px-5 py-3 text-gray-500">{inv.due_date}</td>
                            <td className={`px-5 py-3 text-right font-medium ${dpd > 60 ? 'text-red-600' : dpd > 30 ? 'text-yellow-600' : dpd > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                              {dpd <= 0 ? 'Not due' : `${dpd} days`}
                            </td>
                            <td className="px-5 py-3 text-right font-mono font-semibold text-gray-800">{fmt(inv.total)}</td>
                            <td className="px-5 py-3 text-right">
                              <Link href={`/accounting/invoices/${inv.id}`} className="text-xs text-[#0F4C81] hover:underline">View</Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="border-t border-gray-100 bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-5 py-2 text-sm font-semibold text-gray-600">Subtotal</td>
                        <td className="px-5 py-2 text-right font-bold font-mono text-gray-800">{fmt(bucket.total)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            })}

            {/* Grand Total Row */}
            <div className="bg-gray-800 rounded-xl px-5 py-4 flex justify-between items-center">
              <span className="text-white font-bold">Total Accounts Receivable</span>
              <span className="text-white font-bold text-xl">{fmt(grandTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
