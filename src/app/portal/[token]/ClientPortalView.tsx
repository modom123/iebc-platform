'use client'

import { useState } from 'react'

type LineItem = {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

type Invoice = {
  id: string
  invoice_number: string
  due_date: string
  status: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string
  invoice_line_items: LineItem[]
  customers: {
    name: string
    email: string
  }
}

const fmt = (n: number) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function ClientPortalView({ invoice, token }: { invoice: Invoice; token: string }) {
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(invoice.status === 'paid')
  const [payMethod, setPayMethod] = useState<'card' | 'ach' | null>(null)
  const [msg, setMsg] = useState('')
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [achForm, setAchForm] = useState({ name: '', routing: '', account: '' })

  const isPastDue = !paid && invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()

  async function handlePayment() {
    setPaying(true)
    const res = await fetch('/api/portal/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        invoice_id: invoice.id,
        method: payMethod,
        amount: invoice.total,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setPaid(true)
      setMsg('Payment received! Thank you.')
      setPayMethod(null)
    } else {
      setMsg(data.error || 'Payment failed. Please try again.')
    }
    setPaying(false)
    setTimeout(() => setMsg(''), 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F4C81] via-blue-700 to-blue-800 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl space-y-4">

        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-xs text-blue-200 uppercase tracking-wider font-medium">Secure Payment Portal</p>
            <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-medium backdrop-blur-sm">
            🔒 SSL Secured
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Status Banner */}
          {paid ? (
            <div className="bg-green-500 text-white text-center py-3 font-semibold">
              ✓ Payment Complete — Thank You!
            </div>
          ) : isPastDue ? (
            <div className="bg-red-500 text-white text-center py-3 font-semibold text-sm">
              ⚠ This invoice is past due (Due: {invoice.due_date})
            </div>
          ) : (
            <div className="bg-[#0F4C81] text-white text-center py-3 font-semibold text-sm">
              Due: {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          )}

          {/* Invoice Details */}
          <div className="p-6 md:p-8 space-y-6">

            {/* Bill To */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Bill To</p>
              <p className="font-semibold text-gray-800">{invoice.customers?.name || 'Client'}</p>
              {invoice.customers?.email && <p className="text-sm text-gray-500">{invoice.customers.email}</p>}
            </div>

            {/* Line Items */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase">
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(invoice.invoice_line_items || []).map((line, i) => (
                    <tr key={line.id || i}>
                      <td className="px-4 py-3 text-gray-700">{line.description}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{line.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-500 font-mono">{fmt(line.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">{fmt(line.quantity * line.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-1">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span className="font-mono">{fmt(invoice.subtotal)}</span>
                </div>
                {invoice.tax_rate > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax ({invoice.tax_rate}%)</span>
                    <span className="font-mono">{fmt(invoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-1 border-t border-gray-200 mt-1">
                  <span>Total Due</span>
                  <span className="font-mono text-[#0F4C81]">{fmt(invoice.total)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1 text-xs uppercase tracking-wide">Notes</p>
                {invoice.notes}
              </div>
            )}

            {/* Message */}
            {msg && (
              <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.includes('Thank') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {msg}
              </div>
            )}

            {/* Payment Section */}
            {!paid && (
              <div className="space-y-4">
                <p className="font-semibold text-gray-800 text-sm">Select Payment Method</p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPayMethod(payMethod === 'card' ? null : 'card')}
                    className={`border-2 rounded-xl p-4 text-center transition ${payMethod === 'card' ? 'border-[#0F4C81] bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="text-2xl mb-1">💳</div>
                    <div className="text-sm font-semibold text-gray-700">Credit / Debit Card</div>
                    <div className="text-xs text-gray-400">Visa, MC, Amex</div>
                  </button>
                  <button
                    onClick={() => setPayMethod(payMethod === 'ach' ? null : 'ach')}
                    className={`border-2 rounded-xl p-4 text-center transition ${payMethod === 'ach' ? 'border-[#0F4C81] bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="text-2xl mb-1">🏦</div>
                    <div className="text-sm font-semibold text-gray-700">Bank Transfer (ACH)</div>
                    <div className="text-xs text-gray-400">Free · 1-3 business days</div>
                  </button>
                </div>

                {/* Card Form */}
                {payMethod === 'card' && (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div>
                      <label className="label-sm">Cardholder Name</label>
                      <input className="input-field" placeholder="Jane Smith" value={cardForm.name}
                        onChange={e => setCardForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-sm">Card Number</label>
                      <input className="input-field font-mono" placeholder="4242 4242 4242 4242" maxLength={19} value={cardForm.number}
                        onChange={e => setCardForm(p => ({ ...p, number: e.target.value.replace(/[^0-9\s]/g, '') }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-sm">Expiry</label>
                        <input className="input-field font-mono" placeholder="MM/YY" maxLength={5} value={cardForm.expiry}
                          onChange={e => setCardForm(p => ({ ...p, expiry: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label-sm">CVV</label>
                        <input className="input-field font-mono" placeholder="123" maxLength={4} value={cardForm.cvv}
                          onChange={e => setCardForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ACH Form */}
                {payMethod === 'ach' && (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div>
                      <label className="label-sm">Account Holder Name</label>
                      <input className="input-field" placeholder="Jane Smith" value={achForm.name}
                        onChange={e => setAchForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-sm">Routing Number</label>
                      <input className="input-field font-mono" placeholder="021000021" maxLength={9} value={achForm.routing}
                        onChange={e => setAchForm(p => ({ ...p, routing: e.target.value.replace(/\D/g, '') }))} />
                    </div>
                    <div>
                      <label className="label-sm">Account Number</label>
                      <input className="input-field font-mono" placeholder="Account number" value={achForm.account}
                        onChange={e => setAchForm(p => ({ ...p, account: e.target.value.replace(/\D/g, '') }))} />
                    </div>
                  </div>
                )}

                {payMethod && (
                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full bg-[#0F4C81] text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-800 disabled:opacity-50 transition shadow-md">
                    {paying ? 'Processing...' : `Pay ${fmt(invoice.total)} Securely`}
                  </button>
                )}

                <p className="text-center text-xs text-gray-400">
                  🔒 Payments are encrypted and processed securely. Your financial info is never stored.
                </p>
              </div>
            )}

            {paid && (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-xl font-bold text-gray-800">Payment Confirmed</h2>
                <p className="text-gray-500 text-sm mt-1">A receipt will be sent to {invoice.customers?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 text-xs">
          Powered by IEBC Platform · Secure Invoice Portal
        </p>
      </div>
    </div>
  )
}
