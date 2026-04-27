'use client'
import { useEffect, useRef, useState } from 'react'
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

type ShareModal = {
  invoiceId: string
  invoiceNumber: string
  link: string | null
  loading: boolean
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
  const [shareModal, setShareModal] = useState<ShareModal | null>(null)
  const [copied, setCopied]         = useState(false)
  const closeRef                    = useRef<HTMLButtonElement>(null)

  const load = async () => {
    setLoading(true)
    const params = filterStatus ? `?status=${filterStatus}` : ''
    const res = await fetch(`/api/accounting/invoices${params}`)
    const data = await res.json()
    setInvoices(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  const openShare = async (inv: Invoice) => {
    setShareModal({ invoiceId: inv.id, invoiceNumber: inv.invoice_number, link: null, loading: true })
    const res = await fetch('/api/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: inv.id, expires_days: 30 }),
    })
    const data = await res.json()
    if (res.ok && data.token) {
      const link = `${window.location.origin}/portal/${data.token.token}`
      setShareModal(p => p ? { ...p, link, loading: false } : null)
    } else {
      setShareModal(p => p ? { ...p, loading: false } : null)
    }
  }

  const copyLink = () => {
    if (shareModal?.link) {
      navigator.clipboard.writeText(shareModal.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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

      {/* Share Invoice Modal */}
      {shareModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          onKeyDown={e => { if (e.key === 'Escape') setShareModal(null) }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 id="share-modal-title" className="font-bold text-gray-800">Share Invoice {shareModal.invoiceNumber}</h3>
              <button
                ref={closeRef}
                onClick={() => setShareModal(null)}
                aria-label="Close modal"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-lg">
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Generate a secure payment link to send to your client. The link expires in 30 days and lets them view the invoice and pay online.
            </p>
            {shareModal.loading ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Generating secure link...</span>
              </div>
            ) : shareModal.link ? (
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-mono flex-1 truncate">{shareModal.link}</span>
                  <button onClick={copyLink}
                    className={`text-xs font-medium px-3 py-1 rounded-md transition ${copied ? 'bg-green-100 text-green-700' : 'bg-[#0F4C81] text-white hover:bg-blue-800'}`}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div className="flex gap-3">
                  <a href={`mailto:?subject=Invoice ${shareModal.invoiceNumber}&body=Please find your invoice here: ${shareModal.link}`}
                    className="flex-1 border border-gray-200 text-gray-700 text-sm text-center py-2 rounded-lg hover:bg-gray-50 transition">
                    📧 Email Client
                  </a>
                  <a href={shareModal.link} target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-[#0F4C81] text-white text-sm text-center py-2 rounded-lg hover:bg-blue-800 transition">
                    Preview Portal
                  </a>
                </div>
                <p className="text-xs text-gray-400 text-center">Link expires in 30 days · One-time use after payment</p>
              </div>
            ) : (
              <p className="text-sm text-red-600">Failed to generate link. Please try again.</p>
            )}
          </div>
        </div>
      )}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Invoices</h1>
        </div>
        <div className="flex gap-2">
          <a href="/api/export?type=invoices" className="btn-secondary text-sm py-2">Export CSV</a>
          <Link href="/accounting/invoices/new" className="btn-primary text-sm">+ New Invoice</Link>
        </div>
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
            <div className="p-6 space-y-3" aria-label="Loading invoices" aria-busy="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 shrink-0" />
                  <div className="h-4 bg-gray-200 rounded flex-1" />
                  <div className="h-4 bg-gray-200 rounded w-16 shrink-0" />
                  <div className="h-4 bg-gray-200 rounded w-20 shrink-0" />
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-3xl">▤</span>
              </div>
              <p className="font-semibold text-gray-700 mb-1">
                {filterStatus ? `No ${filterStatus} invoices` : 'No invoices yet'}
              </p>
              <p className="text-sm text-gray-400 mb-5">
                {filterStatus ? 'Try a different filter or create a new invoice.' : 'Create your first invoice to start collecting payments.'}
              </p>
              <Link href="/accounting/invoices/new" className="btn-primary text-sm">Create Invoice</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th scope="col" className="p-3 text-left font-semibold">Invoice #</th>
                <th scope="col" className="p-3 text-left font-semibold">Customer</th>
                <th scope="col" className="p-3 text-left font-semibold">Issued</th>
                <th scope="col" className="p-3 text-left font-semibold">Due</th>
                <th scope="col" className="p-3 text-left font-semibold">Status</th>
                <th scope="col" className="p-3 text-right font-semibold">Total</th>
                <th scope="col" className="p-3 text-center font-semibold">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-semibold text-[#0F4C81]">
                      <Link href={`/accounting/invoices/${inv.id}`} className="hover:underline">{inv.invoice_number}</Link>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{inv.customers?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{inv.customers?.email || ''}</p>
                    </td>
                    <td className="p-3 text-gray-500">{inv.issue_date}</td>
                    <td className="p-3 text-gray-500">{inv.due_date || '—'}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[inv.status] || ''}`}>{inv.status}</span></td>
                    <td className="p-3 text-right font-semibold">{fmt(inv.total)}</td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {inv.status === 'draft' && (
                          <button onClick={() => markAs(inv.id, 'sent')} aria-label={`Mark invoice ${inv.invoice_number} as sent`}
                            className="btn-action text-blue-600 bg-blue-50 hover:bg-blue-100">Sent</button>
                        )}
                        {inv.status === 'sent' && (
                          <button onClick={() => markAs(inv.id, 'paid')} aria-label={`Mark invoice ${inv.invoice_number} as paid`}
                            className="btn-action text-green-600 bg-green-50 hover:bg-green-100">Paid</button>
                        )}
                        {inv.status !== 'void' && inv.status !== 'paid' && (
                          <button onClick={() => openShare(inv)} aria-label={`Share invoice ${inv.invoice_number}`}
                            className="btn-action text-[#C8902A] bg-amber-50 hover:bg-amber-100">Share</button>
                        )}
                        {inv.status !== 'void' && inv.status !== 'paid' && (
                          <button onClick={() => markAs(inv.id, 'void')} aria-label={`Void invoice ${inv.invoice_number}`}
                            className="btn-action text-gray-500 bg-gray-100 hover:bg-gray-200">Void</button>
                        )}
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
