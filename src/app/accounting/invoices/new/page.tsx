'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Customer = { id: string; name: string; email: string }
type LineItem = { description: string; quantity: number; unit_price: number }

export default function NewInvoice() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '' })
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [taxRate, setTaxRate] = useState(0)
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineItem[]>([{ description: '', quantity: 1, unit_price: 0 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/accounting/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : []))
  }, [])

  const addLine = () => setLines([...lines, { description: '', quantity: 1, unit_price: 0 }])
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: keyof LineItem, value: string | number) =>
    setLines(lines.map((l, idx) => idx === i ? { ...l, [field]: value } : l))

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })

  const handleCreateCustomer = async () => {
    const res = await fetch('/api/accounting/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    })
    const d = await res.json()
    if (d.id) {
      setCustomers([...customers, d])
      setCustomerId(d.id)
      setAddingCustomer(false)
      setNewCustomer({ name: '', email: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) { setError('Please select or create a customer'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, due_date: dueDate, tax_rate: taxRate, notes, line_items: lines }),
    })
    if (res.ok) {
      router.push('/accounting/invoices')
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to create invoice')
    }
    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting/invoices" className="text-gray-400 hover:text-gray-600 text-sm">← Invoices</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">New Invoice</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Customer */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold mb-4 text-gray-800">Bill To</h2>
          {!addingCustomer ? (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">Customer</label>
                <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => setAddingCustomer(true)} className="btn-secondary text-sm whitespace-nowrap">+ New Customer</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Name</label>
                  <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Business or person name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
                  <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="email@example.com" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateCustomer} className="btn-primary text-sm">Save Customer</button>
                <button type="button" onClick={() => setAddingCustomer(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold mb-4 text-gray-800">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.1" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold mb-4 text-gray-800">Line Items</h2>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <input type="text" placeholder="Description" value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div className="col-span-2">
                  <input type="number" min="1" step="0.5" placeholder="Qty" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <input type="number" min="0" step="0.01" placeholder="Price" value={line.unit_price} onChange={e => updateLine(i, 'unit_price', Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-1 text-right text-sm font-semibold text-gray-700">{fmt(line.quantity * line.unit_price)}</div>
                <div className="col-span-1 text-center">
                  {lines.length > 1 && <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addLine} className="mt-3 text-sm text-[#0F4C81] hover:underline">+ Add line item</button>

          {/* Totals */}
          <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
            {taxRate > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax ({taxRate}%)</span><span className="font-medium">{fmt(taxAmount)}</span></div>}
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="text-xs font-medium text-gray-600 block mb-1">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Payment terms, thank you notes..." />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Invoice'}</button>
          <Link href="/accounting/invoices" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </main>
  )
}
