'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Payment = { id: string; amount: number; method: string; paid_at: string }

const METHOD_LABELS: Record<string, string> = {
  check: 'Check', ach: 'ACH / Bank Transfer', credit_card: 'Credit Card',
  cash: 'Cash', stripe: 'Stripe / Online', other: 'Other',
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

type Props = {
  invoiceId: string
  invoiceNumber: string
  status: string
  total: number
  amountPaid: number
  customerEmail?: string | null
  payments: Payment[]
  historyOnly?: boolean
}

export default function InvoiceActions({ invoiceId, invoiceNumber, status, total, amountPaid, customerEmail, payments: initialPayments, historyOnly }: Props) {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [showModal, setShowModal] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('check')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [actioning, setActioning] = useState(false)

  const balance = total - amountPaid
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0)

  const openModal = () => {
    setPayAmount((balance).toFixed(2))
    setPayDate(new Date().toISOString().split('T')[0])
    setError('')
    setShowModal(true)
  }

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/invoices/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, amount: parseFloat(payAmount), method: payMethod, paid_at: payDate }),
    })
    const data = await res.json()
    if (res.ok) {
      setPayments(prev => [data, ...prev])
      setShowModal(false)
      router.refresh()
    } else {
      setError(data.error || 'Failed to record payment')
    }
    setSaving(false)
  }

  const deletePayment = async (pid: string) => {
    if (!confirm('Remove this payment record? This will reduce the amount paid on the invoice.')) return
    await fetch(`/api/accounting/invoices/payments?id=${pid}`, { method: 'DELETE' })
    setPayments(prev => prev.filter(p => p.id !== pid))
    router.refresh()
  }

  const markAs = async (newStatus: string) => {
    if (newStatus === 'void' && !confirm('Void this invoice? This cannot be undone.')) return
    setActioning(true)
    await fetch('/api/accounting/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: invoiceId, status: newStatus }),
    })
    setActioning(false)
    router.refresh()
  }

  return (
    <>
      {/* ── Action bar ── */}
      {!historyOnly && <div className="flex gap-2 flex-wrap">
        {status !== 'paid' && status !== 'void' && balance > 0 && (
          <button onClick={openModal}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
            + Record Payment
          </button>
        )}
        {status === 'draft' && (
          <button onClick={() => markAs('sent')} disabled={actioning}
            className="btn-primary text-sm">
            Mark as Sent
          </button>
        )}
        {status === 'sent' && (
          <button onClick={() => markAs('overdue')} disabled={actioning}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            Mark Overdue
          </button>
        )}
        {customerEmail && status !== 'void' && (
          <a href={`mailto:${customerEmail}?subject=Invoice ${invoiceNumber}`}
            className="btn-secondary text-sm py-2">
            Email Client
          </a>
        )}
        {status !== 'void' && status !== 'paid' && (
          <button onClick={() => markAs('void')} disabled={actioning}
            className="px-3 py-2 text-sm text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg transition">
            Void
          </button>
        )}
      </div>}

      {/* ── Payment history (shown inline under totals) ── */}
      {payments.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment History</p>
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm group">
                <div>
                  <span className="font-medium text-gray-700">{METHOD_LABELS[p.method] || p.method}</span>
                  <span className="text-gray-400 text-xs ml-2">
                    {new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-green-600">{fmt(p.amount)}</span>
                  <button onClick={() => deletePayment(p.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-xs">
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold">
              <span className="text-gray-600">Total Received</span>
              <span className="text-green-600">{fmt(totalPaid)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Record Payment Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Record Payment</h3>
                <p className="text-xs text-gray-500 mt-0.5">{invoiceNumber} · Balance due: <span className="font-semibold text-gray-700">{fmt(balance)}</span></p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-0.5">×</button>
            </div>
            <form onSubmit={recordPayment} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Payment Amount ($) *</label>
                <input
                  type="number" required min="0.01" step="0.01"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-lg"
                  autoFocus
                />
                {parseFloat(payAmount) < balance && parseFloat(payAmount) > 0 && (
                  <p className="text-xs text-amber-600 mt-1">Partial payment — {fmt(balance - parseFloat(payAmount))} will remain outstanding</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Payment Method</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {Object.entries(METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Date Received</label>
                  <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition">
                  {saving ? 'Recording...' : 'Record Payment'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
