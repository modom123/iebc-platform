'use client'

import { useState, useEffect } from 'react'

type PO = {
  id: string
  po_number: string
  vendor_name: string
  vendor_id: string
  order_date: string
  expected_date: string
  status: 'draft' | 'sent' | 'received' | 'billed' | 'cancelled'
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string
  items: POItem[]
}

type POItem = {
  description: string
  qty: number
  unit: string
  unit_price: number
  total: number
}

type Vendor = { id: string; name: string }

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  received: 'bg-green-100 text-green-700',
  billed: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-600',
}

const STATUS_NEXT: Record<string, string> = {
  draft: 'sent',
  sent: 'received',
  received: 'billed',
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const EMPTY_ITEM: POItem = { description: '', qty: 1, unit: 'each', unit_price: 0, total: 0 }

export default function PurchaseOrdersPage() {
  const [pos, setPOs] = useState<PO[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<PO | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [form, setForm] = useState({
    vendor_id: '', vendor_name: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    tax_rate: '0',
    notes: '',
    items: [{ ...EMPTY_ITEM }] as POItem[],
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [posRes, vendorsRes] = await Promise.all([
      fetch('/api/accounting/purchaseorders'),
      fetch('/api/accounting/vendors'),
    ])
    const [posData, vendorsData] = await Promise.all([posRes.json(), vendorsRes.json()])
    setPOs(posData.pos || [])
    setVendors(vendorsData.vendors || [])
    setLoading(false)
  }

  function updateItem(i: number, field: keyof POItem, value: string | number) {
    setForm(p => {
      const items = [...p.items]
      items[i] = { ...items[i], [field]: field === 'description' || field === 'unit' ? value : Number(value) || 0 }
      items[i].total = items[i].qty * items[i].unit_price
      return { ...p, items }
    })
  }

  const subtotal = form.items.reduce((s, i) => s + i.total, 0)
  const taxAmt = subtotal * (Number(form.tax_rate) / 100)
  const total = subtotal + taxAmt

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vendor_name) { setMsg('Vendor is required'); return }
    setSaving(true)
    const res = await fetch('/api/accounting/purchaseorders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, subtotal, tax_amount: taxAmt, total }),
    })
    if (res.ok) {
      setMsg('Purchase order created!')
      setShowNew(false)
      setForm({ vendor_id: '', vendor_name: '', order_date: new Date().toISOString().split('T')[0], expected_date: '', tax_rate: '0', notes: '', items: [{ ...EMPTY_ITEM }] })
      fetchData()
    } else {
      const d = await res.json()
      setMsg(d.error || 'Error creating PO')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function advanceStatus(id: string, currentStatus: string) {
    const next = STATUS_NEXT[currentStatus]
    if (!next) return
    await fetch('/api/accounting/purchaseorders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    })
    fetchData()
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: next as PO['status'] } : null)
  }

  async function cancelPO(id: string) {
    if (!confirm('Cancel this purchase order?')) return
    await fetch('/api/accounting/purchaseorders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'cancelled' }),
    })
    fetchData()
    setSelected(null)
  }

  const filtered = pos.filter(p => filterStatus === 'all' || p.status === filterStatus)
  const totalPending = pos.filter(p => p.status === 'sent' || p.status === 'received').reduce((s, p) => s + Number(p.total), 0)
  const totalDraft = pos.filter(p => p.status === 'draft').length
  const totalReceived = pos.filter(p => p.status === 'received').reduce((s, p) => s + Number(p.total), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage vendor orders from request through receipt and billing</p>
        </div>
        <button onClick={() => { setShowNew(true); setSelected(null) }}
          className="bg-[#0F4C81] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-800 transition font-medium">
          + Create PO
        </button>
      </div>

      {msg && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${msg.includes('Error') || msg.includes('required') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total POs', value: String(pos.length), color: 'text-gray-800' },
          { label: 'Draft', value: String(totalDraft), color: 'text-gray-600' },
          { label: 'Open Value', value: fmt(totalPending), color: 'text-[#0F4C81]' },
          { label: 'Received (Unbilled)', value: fmt(totalReceived), color: 'text-green-700' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* New PO Form */}
      {showNew && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">New Purchase Order</h3>
            <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="label-sm">Vendor*</label>
                <input list="vendor-list" className="input-field" required placeholder="Select or type vendor"
                  value={form.vendor_name}
                  onChange={e => {
                    const v = vendors.find(v => v.name === e.target.value)
                    setForm(p => ({ ...p, vendor_name: e.target.value, vendor_id: v?.id || '' }))
                  }} />
                <datalist id="vendor-list">
                  {vendors.map(v => <option key={v.id} value={v.name} />)}
                </datalist>
              </div>
              <div>
                <label className="label-sm">Order Date*</label>
                <input className="input-field" type="date" value={form.order_date}
                  onChange={e => setForm(p => ({ ...p, order_date: e.target.value }))} />
              </div>
              <div>
                <label className="label-sm">Expected Delivery</label>
                <input className="input-field" type="date" value={form.expected_date}
                  onChange={e => setForm(p => ({ ...p, expected_date: e.target.value }))} />
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Line Items</div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                  <th className="p-2.5 text-left">Description</th>
                  <th className="p-2.5 text-center w-16">Qty</th>
                  <th className="p-2.5 text-center w-20 hidden md:table-cell">Unit</th>
                  <th className="p-2.5 text-right w-28">Unit Price</th>
                  <th className="p-2.5 text-right w-28">Total</th>
                  <th className="p-2.5 w-8"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {form.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        <input className="input-field text-sm" placeholder="Item or service description" value={item.description}
                          onChange={e => updateItem(i, 'description', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="number" min="1" className="input-field text-center text-sm" value={item.qty}
                          onChange={e => updateItem(i, 'qty', e.target.value)} />
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        <input className="input-field text-sm" value={item.unit}
                          onChange={e => updateItem(i, 'unit', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="number" min="0" step="0.01" className="input-field text-right font-mono text-sm" value={item.unit_price || ''}
                          onChange={e => updateItem(i, 'unit_price', e.target.value)} />
                      </td>
                      <td className="p-2 text-right font-mono text-sm font-semibold pr-4">{fmt(item.total)}</td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => setForm(p => ({ ...p, items: p.items.filter((_, j) => j !== i) }))}
                          className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 flex justify-between items-center border-t border-gray-100">
                <button type="button" onClick={() => setForm(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }))}
                  className="text-sm text-[#0F4C81] hover:underline">+ Add Item</button>
                <div className="text-right space-y-1">
                  <div className="flex gap-8 text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-mono font-semibold">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex gap-8 text-sm items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Tax</span>
                      <input type="number" min="0" max="100" step="0.1" className="w-14 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-center" value={form.tax_rate}
                        onChange={e => setForm(p => ({ ...p, tax_rate: e.target.value }))} />
                      <span className="text-gray-500 text-xs">%</span>
                    </div>
                    <span className="font-mono">{fmt(taxAmt)}</span>
                  </div>
                  <div className="flex gap-8 text-sm font-bold border-t border-gray-100 pt-1">
                    <span>Total</span>
                    <span className="font-mono text-[#0F4C81]">{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="label-sm">Notes / Terms</label>
              <textarea className="input-field" rows={2} value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-[#0F4C81] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Purchase Order'}
              </button>
              <button type="button" onClick={() => setShowNew(false)}
                className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-6">
        {/* PO List */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Status Filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            {['all', 'draft', 'sent', 'received', 'billed', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition capitalize ${filterStatus === s ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-sm mb-3">No purchase orders</p>
                <button onClick={() => setShowNew(true)} className="bg-[#0F4C81] text-white text-sm px-4 py-2 rounded-lg">Create First PO</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(po => (
                  <button key={po.id} onClick={() => setSelected(selected?.id === po.id ? null : po)}
                    className={`w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition ${selected?.id === po.id ? 'bg-blue-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-gray-500">{po.po_number}</span>
                        <span className="font-semibold text-sm text-gray-800">{po.vendor_name}</span>
                      </div>
                      <div className="flex gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                        <span>Ordered: {po.order_date}</span>
                        {po.expected_date && <span>Expected: {po.expected_date}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-semibold text-sm">{fmt(po.total)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[po.status] || 'bg-gray-100 text-gray-600'}`}>
                        {po.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-mono text-xs text-gray-500">{selected.po_number}</p>
                  <p className="font-bold text-gray-800">{selected.vendor_name}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Order Date</span><span>{selected.order_date}</span></div>
                {selected.expected_date && <div className="flex justify-between"><span className="text-gray-500">Expected</span><span>{selected.expected_date}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-mono">{fmt(selected.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="font-mono">{fmt(selected.tax_amount)}</span></div>
                <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span className="font-mono text-[#0F4C81]">{fmt(selected.total)}</span></div>

                {selected.items && selected.items.length > 0 && (
                  <div className="border-t pt-3 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Items</p>
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-600 truncate max-w-[140px]">{item.description} ×{item.qty}</span>
                        <span className="font-mono">{fmt(item.total)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selected.notes && (
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Notes</p>
                    <p className="text-xs text-gray-600">{selected.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-3 space-y-2">
                  {STATUS_NEXT[selected.status] && (
                    <button onClick={() => advanceStatus(selected.id, selected.status)}
                      className="w-full bg-[#0F4C81] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition capitalize">
                      Mark as {STATUS_NEXT[selected.status]}
                    </button>
                  )}
                  {selected.status !== 'cancelled' && selected.status !== 'billed' && (
                    <button onClick={() => cancelPO(selected.id)}
                      className="w-full border border-red-200 text-red-500 py-1.5 rounded-lg text-sm hover:bg-red-50 transition">
                      Cancel PO
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
