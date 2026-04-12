'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Invoice = {
  id: string
  invoice_number: string
  status: string
  issue_date: string
  due_date: string
  total: number
  amount_paid: number
  customers: { name: string; email: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-400',
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  const load = async () => {
    setLoading(true)
    const params = filterStatus ? `?status=${filterStatus}` : ''
    const res = await fetch(`/api/accounting/invoices${params}`)
    const data = await res.json()
    setInvoices(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  const markAs = async (id: string, status: string) => {
    await fetch('/api/accounting/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, ...(status === 'paid' ? { amount_paid: invoices.find(i => i.id === id)?.total } : {}) }),
    })
    load()
  }

  const totalOutstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'void').reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Invoices</h1>
        </div>
        <Link href="/accounting/invoices/new" className="btn-primary text-sm">+ New Invoice</Link>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Outstanding', value: fmt(totalOutstanding), color: 'text-orange-600' },
            { label: 'Collected', value: fmt(totalPaid), color: 'text-green-600' },
            { label: 'Total Invoices', value: String(invoices.length), color: 'text-gray-800' },
            { label: 'Overdue', value: String(invoices.filter(i => i.status === 'overdue').length), color: 'text-red-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['', 'draft', 'sent', 'paid', 'overdue', 'void'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterStatus === s ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 hover:border-[#0F4C81]'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-3">No invoices yet</p>
              <Link href="/accounting/invoices/new" className="btn-primary text-sm">Create First Invoice</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Invoice #</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Issued</th>
                <th className="p-3 text-left">Due</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-semibold text-[#0F4C81]">{inv.invoice_number}</td>
                    <td className="p-3">
                      <p className="font-medium">{inv.customers?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{inv.customers?.email || ''}</p>
                    </td>
                    <td className="p-3 text-gray-500">{inv.issue_date}</td>
                    <td className="p-3 text-gray-500">{inv.due_date || '—'}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[inv.status] || ''}`}>{inv.status}</span></td>
                    <td className="p-3 text-right font-semibold">{fmt(inv.total)}</td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center">
                        {inv.status === 'draft' && <button onClick={() => markAs(inv.id, 'sent')} className="text-xs text-blue-600 hover:underline">Mark Sent</button>}
                        {inv.status === 'sent' && <button onClick={() => markAs(inv.id, 'paid')} className="text-xs text-green-600 hover:underline">Mark Paid</button>}
                        {inv.status !== 'void' && inv.status !== 'paid' && <button onClick={() => markAs(inv.id, 'void')} className="text-xs text-gray-400 hover:underline ml-1">Void</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
