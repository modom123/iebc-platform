'use client'

import { useState, useEffect } from 'react'

type Item = {
  id: string
  sku: string
  name: string
  description: string
  category: string
  unit: string
  cost_price: number
  sale_price: number
  qty_on_hand: number
  reorder_point: number
  reorder_qty: number
  is_active: boolean
  created_at: string
}

const fmt = (n: number) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const CATEGORIES = ['All', 'Parts', 'Supplies', 'Equipment', 'Finished Goods', 'Raw Materials', 'Services']
const UNITS = ['each', 'box', 'case', 'kg', 'lb', 'oz', 'liter', 'meter', 'sq ft', 'hr']

const EMPTY_FORM = {
  sku: '',
  name: '',
  description: '',
  category: 'Supplies',
  unit: 'each',
  cost_price: 0,
  sale_price: 0,
  qty_on_hand: 0,
  reorder_point: 5,
  reorder_qty: 20,
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [adjustItem, setAdjustItem] = useState<Item | null>(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    setLoading(true)
    const res = await fetch('/api/accounting/inventory')
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  function openNew() {
    setEditItem(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  function openEdit(item: Item) {
    setEditItem(item)
    setForm({
      sku: item.sku,
      name: item.name,
      description: item.description,
      category: item.category,
      unit: item.unit,
      cost_price: item.cost_price,
      sale_price: item.sale_price,
      qty_on_hand: item.qty_on_hand,
      reorder_point: item.reorder_point,
      reorder_qty: item.reorder_qty,
    })
    setShowForm(true)
  }

  async function handleSubmit() {
    if (!form.name || !form.sku) { setMsg('SKU and name are required'); return }
    setSaving(true)
    const method = editItem ? 'PATCH' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    const res = await fetch('/api/accounting/inventory', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setMsg(editItem ? 'Item updated' : 'Item added')
      setShowForm(false)
      fetchItems()
    } else {
      const d = await res.json()
      setMsg(d.error || 'Error saving item')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleAdjust() {
    if (!adjustItem) return
    const res = await fetch('/api/accounting/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: adjustItem.id,
        qty_on_hand: adjustItem.qty_on_hand + adjustQty,
        adjust_note: adjustNote,
      }),
    })
    if (res.ok) {
      setMsg('Stock adjusted')
      setAdjustItem(null)
      setAdjustQty(0)
      setAdjustNote('')
      fetchItems()
    }
    setTimeout(() => setMsg(''), 3000)
  }

  async function toggleActive(item: Item) {
    await fetch('/api/accounting/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
    })
    fetchItems()
  }

  const filtered = items.filter(item => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false
    if (showLowStock && item.qty_on_hand > item.reorder_point) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.sku.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalValue = items.reduce((s, i) => s + i.qty_on_hand * i.cost_price, 0)
  const lowStockCount = items.filter(i => i.qty_on_hand <= i.reorder_point && i.is_active).length
  const activeCount = items.filter(i => i.is_active).length
  const margin = items.length > 0
    ? items.reduce((s, i) => s + (i.sale_price - i.cost_price), 0) / items.length
    : 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory &amp; Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track stock levels, costs, and reorder points</p>
        </div>
        <button onClick={openNew}
          className="bg-[#0F4C81] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-800 transition font-medium">
          + Add Item
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Inventory Value', value: fmt(totalValue), sub: `${activeCount} active SKUs`, color: 'blue' },
          { label: 'Low Stock Alerts', value: String(lowStockCount), sub: 'Items at or below reorder point', color: lowStockCount > 0 ? 'red' : 'green' },
          { label: 'Total SKUs', value: String(items.length), sub: 'Across all categories', color: 'blue' },
          { label: 'Avg. Margin', value: fmt(margin), sub: 'Avg sale minus cost price', color: 'gold' },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl border p-4 ${card.color === 'red' && lowStockCount > 0 ? 'border-red-200' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color === 'red' && lowStockCount > 0 ? 'text-red-600' : card.color === 'gold' ? 'text-[#C9A02E]' : 'text-[#0F4C81]'}`}>
              {card.value}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {msg && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${msg.includes('Error') || msg.includes('required') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {msg}
        </div>
      )}

      {/* New / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">{editItem ? 'Edit Item' : 'New Inventory Item'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-sm">SKU*</label>
                <input className="input-field font-mono" placeholder="e.g. PART-001" value={form.sku}
                  onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label-sm">Item Name*</label>
                <input className="input-field" placeholder="e.g. Blue Ballpoint Pens (Box of 12)" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="md:col-span-3">
                <label className="label-sm">Description</label>
                <input className="input-field" placeholder="Optional description" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="label-sm">Category</label>
                <select className="input-field" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label-sm">Unit</label>
                <select className="input-field" value={form.unit}
                  onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="label-sm">Qty on Hand</label>
                <input type="number" min="0" className="input-field" value={form.qty_on_hand}
                  onChange={e => setForm(p => ({ ...p, qty_on_hand: Number(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="label-sm">Cost Price</label>
                <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.cost_price || ''}
                  onChange={e => setForm(p => ({ ...p, cost_price: Number(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="label-sm">Sale Price</label>
                <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.sale_price || ''}
                  onChange={e => setForm(p => ({ ...p, sale_price: Number(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="label-sm">Margin</label>
                <div className="input-field bg-gray-50 text-gray-500 cursor-default">
                  {form.sale_price > 0 ? (((form.sale_price - form.cost_price) / form.sale_price) * 100).toFixed(1) + '%' : '—'}
                </div>
              </div>
              <div>
                <label className="label-sm">Reorder Point</label>
                <input type="number" min="0" className="input-field" value={form.reorder_point}
                  onChange={e => setForm(p => ({ ...p, reorder_point: Number(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="label-sm">Reorder Qty</label>
                <input type="number" min="0" className="input-field" value={form.reorder_qty}
                  onChange={e => setForm(p => ({ ...p, reorder_qty: Number(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSubmit} disabled={saving}
                className="bg-[#0F4C81] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-40">
                {saving ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-sm hover:text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Adjust Stock</h3>
              <button onClick={() => setAdjustItem(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <p className="text-sm text-gray-600">{adjustItem.name} <span className="text-gray-400">({adjustItem.sku})</span></p>
            <p className="text-sm">Current qty: <strong>{adjustItem.qty_on_hand} {adjustItem.unit}</strong></p>
            <div>
              <label className="label-sm">Adjustment (+/-)</label>
              <input type="number" className="input-field" placeholder="+10 or -3" value={adjustQty || ''}
                onChange={e => setAdjustQty(Number(e.target.value) || 0)} />
              <p className="text-xs text-gray-400 mt-1">New qty: <strong>{adjustItem.qty_on_hand + adjustQty}</strong></p>
            </div>
            <div>
              <label className="label-sm">Reason / Note</label>
              <input className="input-field" placeholder="e.g. Physical count, damaged goods..." value={adjustNote}
                onChange={e => setAdjustNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdjust} className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
                Apply Adjustment
              </button>
              <button onClick={() => setAdjustItem(null)} className="text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${categoryFilter === c ? 'bg-[#0F4C81] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <input className="input-field w-48 text-sm" placeholder="Search SKU or name..." value={search}
              onChange={e => setSearch(e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showLowStock} onChange={e => setShowLowStock(e.target.checked)}
                className="rounded" />
              Low Stock Only
            </label>
          </div>
        </div>

        {/* Items Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm mb-3">{items.length === 0 ? 'No items yet' : 'No items match your filter'}</p>
            {items.length === 0 && (
              <button onClick={openNew} className="bg-[#0F4C81] text-white text-sm px-4 py-2 rounded-lg">Add First Item</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Item Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Reorder</th>
                  <th className="p-3 text-right">Cost</th>
                  <th className="p-3 text-right">Sale Price</th>
                  <th className="p-3 text-right">Stock Value</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => {
                  const isLow = item.qty_on_hand <= item.reorder_point
                  const stockValue = item.qty_on_hand * item.cost_price
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition ${!item.is_active ? 'opacity-50' : ''}`}>
                      <td className="p-3 font-mono text-xs text-gray-500">{item.sku}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        {item.description && <div className="text-xs text-gray-400">{item.description}</div>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.category}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-semibold font-mono ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.qty_on_hand}
                        </span>
                        {isLow && <span className="ml-1 text-xs text-red-500">▼</span>}
                        <div className="text-xs text-gray-400">{item.unit}</div>
                      </td>
                      <td className="p-3 text-right text-xs text-gray-500 font-mono">{item.reorder_point}</td>
                      <td className="p-3 text-right font-mono text-gray-700">{fmt(item.cost_price)}</td>
                      <td className="p-3 text-right font-mono text-gray-700">{fmt(item.sale_price)}</td>
                      <td className="p-3 text-right font-mono font-semibold text-[#0F4C81]">{fmt(stockValue)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setAdjustItem(item)}
                            className="text-xs text-[#0F4C81] hover:underline font-medium">Adjust</button>
                          <button onClick={() => openEdit(item)}
                            className="text-xs text-gray-500 hover:text-gray-700">Edit</button>
                          <button onClick={() => toggleActive(item)}
                            className="text-xs text-gray-400 hover:text-red-500">
                            {item.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-sm">
                  <td className="p-3 text-gray-500" colSpan={7}>Total Inventory Value</td>
                  <td className="p-3 text-right font-mono text-[#0F4C81]">{fmt(filtered.reduce((s, i) => s + i.qty_on_hand * i.cost_price, 0))}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Alert Panel */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-600 font-semibold text-sm">⚠ {lowStockCount} item{lowStockCount > 1 ? 's' : ''} need reordering</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.filter(i => i.qty_on_hand <= i.reorder_point && i.is_active).map(item => (
              <div key={item.id} className="bg-white rounded-lg border border-amber-100 p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.sku} · {item.qty_on_hand} / {item.reorder_point} {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Reorder</p>
                  <p className="text-sm font-semibold text-amber-700">{item.reorder_qty} {item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
