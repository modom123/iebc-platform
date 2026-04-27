'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type MileageEntry = { id: string; date: string; purpose: string; from_location: string; to_location: string; miles: number; deduction_amount: number; created_at: string }
type TimeEntry = { id: string; date: string; client: string; project: string; description: string; hours: number; rate: number; billable: boolean; created_at: string }
type Customer = { id: string; name: string; email: string }

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
const IRS_RATE = 0.67

export default function TrackerPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'mileage' | 'time'>('mileage')
  const [mileage, setMileage] = useState<MileageEntry[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Invoice conversion state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoiceCustomerId, setInvoiceCustomerId] = useState('')
  const [invoiceDueDate, setInvoiceDueDate] = useState('')
  const [invoiceNotes, setInvoiceNotes] = useState('')
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [invoiceError, setInvoiceError] = useState('')

  const [mileForm, setMileForm] = useState({ date: new Date().toISOString().split('T')[0], purpose: '', from_location: '', to_location: '', miles: '' })
  const [timeForm, setTimeForm] = useState({ date: new Date().toISOString().split('T')[0], client: '', project: '', description: '', hours: '', rate: '', billable: true })

  const load = async () => {
    setLoading(true)
    const [mRes, tRes] = await Promise.all([
      fetch('/api/accounting/tracker?table=mileage'),
      fetch('/api/accounting/tracker?table=time'),
    ])
    const [mData, tData] = await Promise.all([mRes.json(), tRes.json()])
    setMileage(Array.isArray(mData.data) ? mData.data : [])
    setTimeEntries(Array.isArray(tData.data) ? tData.data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveMileage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'mileage', ...mileForm, miles: parseFloat(mileForm.miles) }),
    })
    if (res.ok) {
      setShowForm(false)
      setMileForm({ date: new Date().toISOString().split('T')[0], purpose: '', from_location: '', to_location: '', miles: '' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const saveTime = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'time', ...timeForm, hours: parseFloat(timeForm.hours), rate: parseFloat(timeForm.rate || '0') }),
    })
    if (res.ok) {
      setShowForm(false)
      setTimeForm({ date: new Date().toISOString().split('T')[0], client: '', project: '', description: '', hours: '', rate: '', billable: true })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const deleteEntry = async (id: string, table: string) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/accounting/tracker?id=${id}&table=${table}`, { method: 'DELETE' })
    load()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const openInvoiceModal = async () => {
    setInvoiceError('')
    const res = await fetch('/api/accounting/customers')
    const data = await res.json()
    setCustomers(Array.isArray(data) ? data : [])
    setInvoiceCustomerId('')
    setInvoiceDueDate('')
    setInvoiceNotes('')
    setShowInvoiceModal(true)
  }

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingInvoice(true)
    setInvoiceError('')
    const selected = timeEntries.filter(t => selectedIds.has(t.id))
    const line_items = selected.map(t => ({
      description: [t.client, t.project, t.description].filter(Boolean).join(' — '),
      quantity: Number(t.hours),
      unit_price: Number(t.rate),
    }))
    const res = await fetch('/api/accounting/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: invoiceCustomerId || null,
        due_date: invoiceDueDate || null,
        notes: invoiceNotes || null,
        line_items,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setShowInvoiceModal(false)
      setSelectedIds(new Set())
      router.push(`/accounting/invoices/${data.id}`)
    } else {
      setInvoiceError(data.error || 'Failed to create invoice')
    }
    setCreatingInvoice(false)
  }

  const totalMiles = mileage.reduce((s, m) => s + Number(m.miles), 0)
  const totalDeduction = mileage.reduce((s, m) => s + Number(m.deduction_amount), 0)
  const totalHours = timeEntries.reduce((s, t) => s + Number(t.hours), 0)
  const billableValue = timeEntries.filter(t => t.billable).reduce((s, t) => s + Number(t.hours) * Number(t.rate), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Mileage &amp; Time Tracker</h1>
        </div>
        <button onClick={() => { setShowForm(true); setError('') }} className="btn-primary text-sm">+ Add Entry</button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(['mileage', 'time'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setShowForm(false) }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'mileage' ? '🚗 Mileage' : '⏱️ Time'}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === 'mileage' ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">Total Miles</p>
              <p className="text-2xl font-bold text-[#0F4C81] mt-1">{totalMiles.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">Tax Deduction</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{fmt(totalDeduction)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">IRS Rate 2024</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">${IRS_RATE}/mi</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">Total Hours</p>
              <p className="text-2xl font-bold text-[#0F4C81] mt-1">{totalHours.toFixed(1)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">Billable Value</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{fmt(billableValue)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">Entries</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{timeEntries.length}</p>
            </div>
          </div>
        )}

        {/* Add Form */}
        {showForm && tab === 'mileage' && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold text-[#0F4C81] mb-4">Log Mileage</h3>
            <form onSubmit={saveMileage} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                <input type="date" required value={mileForm.date} onChange={e => setMileForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Business Purpose *</label>
                <input type="text" required value={mileForm.purpose} onChange={e => setMileForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="e.g. Client meeting at Acme Corp" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">From</label>
                <input type="text" value={mileForm.from_location} onChange={e => setMileForm(f => ({ ...f, from_location: e.target.value }))}
                  placeholder="Starting location" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">To</label>
                <input type="text" value={mileForm.to_location} onChange={e => setMileForm(f => ({ ...f, to_location: e.target.value }))}
                  placeholder="Destination" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Miles *</label>
                <input type="number" min="0.1" step="0.1" required value={mileForm.miles} onChange={e => setMileForm(f => ({ ...f, miles: e.target.value }))}
                  placeholder="12.5" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                {mileForm.miles && <p className="text-xs text-green-600 mt-0.5">Deduction: {fmt(parseFloat(mileForm.miles) * IRS_RATE)}</p>}
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Log Mileage'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {showForm && tab === 'time' && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold text-[#0F4C81] mb-4">Log Time</h3>
            <form onSubmit={saveTime} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                <input type="date" required value={timeForm.date} onChange={e => setTimeForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Client</label>
                <input type="text" value={timeForm.client} onChange={e => setTimeForm(f => ({ ...f, client: e.target.value }))}
                  placeholder="Client name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Project</label>
                <input type="text" value={timeForm.project} onChange={e => setTimeForm(f => ({ ...f, project: e.target.value }))}
                  placeholder="Project name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-medium text-gray-600 block mb-1">Description *</label>
                <input type="text" required value={timeForm.description} onChange={e => setTimeForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What did you work on?" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Hours *</label>
                <input type="number" min="0.1" step="0.25" required value={timeForm.hours} onChange={e => setTimeForm(f => ({ ...f, hours: e.target.value }))}
                  placeholder="2.5" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Hourly Rate ($)</label>
                <input type="number" min="0" step="5" value={timeForm.rate} onChange={e => setTimeForm(f => ({ ...f, rate: e.target.value }))}
                  placeholder="150" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={timeForm.billable} onChange={e => setTimeForm(f => ({ ...f, billable: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#0F4C81]" />
                  <span className="font-medium text-gray-700">Billable</span>
                </label>
              </div>
              {timeForm.hours && timeForm.rate && (
                <p className="col-span-full text-sm text-green-600 font-medium">
                  Billable value: {fmt(parseFloat(timeForm.hours) * parseFloat(timeForm.rate))}
                </p>
              )}
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Log Time'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Data Tables */}
        {tab === 'mileage' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? <div className="p-8 text-center text-gray-400">Loading...</div>
            : mileage.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">🚗</p>
                <p className="font-medium text-gray-600 mb-1">No mileage logged yet</p>
                <p className="text-sm text-gray-400 mb-4">Track business miles and calculate your IRS deduction automatically.</p>
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Log First Trip</button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Purpose</th>
                  <th className="p-3 text-left">Route</th>
                  <th className="p-3 text-right">Miles</th>
                  <th className="p-3 text-right">Deduction</th>
                  <th className="p-3 text-center">Del</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {mileage.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{m.date}</td>
                      <td className="p-3 font-medium">{m.purpose}</td>
                      <td className="p-3 text-gray-500 text-xs">{m.from_location && m.to_location ? `${m.from_location} → ${m.to_location}` : '—'}</td>
                      <td className="p-3 text-right font-mono">{Number(m.miles).toFixed(1)}</td>
                      <td className="p-3 text-right font-semibold text-green-600">{fmt(m.deduction_amount)}</td>
                      <td className="p-3 text-center"><button onClick={() => deleteEntry(m.id, 'mileage')} className="text-xs text-red-400 hover:text-red-600">✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="p-3 text-xs font-bold text-gray-600 text-right">TOTAL</td>
                    <td className="p-3 text-right font-bold font-mono">{totalMiles.toFixed(1)}</td>
                    <td className="p-3 text-right font-bold text-green-600">{fmt(totalDeduction)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {tab === 'time' && (
          <>
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between bg-[#0F4C81] text-white rounded-xl px-5 py-3">
                <span className="text-sm font-medium">{selectedIds.size} entr{selectedIds.size === 1 ? 'y' : 'ies'} selected
                  {' '}· {fmt(timeEntries.filter(t => selectedIds.has(t.id)).reduce((s, t) => s + Number(t.hours) * Number(t.rate), 0))} billable
                </span>
                <div className="flex gap-2">
                  <button onClick={openInvoiceModal}
                    className="bg-white text-[#0F4C81] font-bold text-sm px-4 py-1.5 rounded-lg hover:bg-blue-50 transition">
                    Create Invoice
                  </button>
                  <button onClick={() => setSelectedIds(new Set())}
                    className="text-blue-200 hover:text-white text-sm px-3 py-1.5">
                    Clear
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? <div className="p-8 text-center text-gray-400">Loading...</div>
              : timeEntries.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-4xl mb-3">⏱️</p>
                  <p className="font-medium text-gray-600 mb-1">No time entries yet</p>
                  <p className="text-sm text-gray-400 mb-4">Track billable hours by client and project.</p>
                  <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Log First Entry</button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                    <th className="p-3 w-8"></th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Client / Project</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-right">Hours</th>
                    <th className="p-3 text-right">Value</th>
                    <th className="p-3 text-center">Del</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {timeEntries.map(t => (
                      <tr key={t.id} className={`hover:bg-gray-50 cursor-pointer ${selectedIds.has(t.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => t.billable && t.rate > 0 && toggleSelect(t.id)}>
                        <td className="p-3">
                          {t.billable && t.rate > 0 && (
                            <input type="checkbox" checked={selectedIds.has(t.id)}
                              onChange={() => toggleSelect(t.id)}
                              onClick={e => e.stopPropagation()}
                              className="h-4 w-4 rounded border-gray-300 text-[#0F4C81]" />
                          )}
                        </td>
                        <td className="p-3 text-gray-500">{t.date}</td>
                        <td className="p-3">
                          <p className="font-medium">{t.client || '—'}</p>
                          {t.project && <p className="text-xs text-gray-400">{t.project}</p>}
                        </td>
                        <td className="p-3 text-gray-600">{t.description}</td>
                        <td className="p-3 text-right font-mono font-semibold">{Number(t.hours).toFixed(2)}</td>
                        <td className="p-3 text-right">
                          {t.billable && t.rate > 0
                            ? <span className="font-semibold text-green-600">{fmt(t.hours * t.rate)}</span>
                            : <span className="text-gray-400 text-xs">non-billable</span>
                          }
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={e => { e.stopPropagation(); deleteEntry(t.id, 'time') }}
                            className="text-xs text-red-400 hover:text-red-600">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={4} className="p-3 text-xs font-bold text-gray-600 text-right">TOTAL</td>
                      <td className="p-3 text-right font-bold font-mono">{totalHours.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-green-600">{fmt(billableValue)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </>
        )}

        {/* Create Invoice Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false) }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Create Invoice from Time</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedIds.size} entries · {fmt(timeEntries.filter(t => selectedIds.has(t.id)).reduce((s, t) => s + Number(t.hours) * Number(t.rate), 0))}</p>
                </div>
                <button onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              <form onSubmit={createInvoice} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Customer</label>
                  <select value={invoiceCustomerId} onChange={e => setInvoiceCustomerId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
                    <option value="">No customer (add later)</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Due Date</label>
                  <input type="date" value={invoiceDueDate} onChange={e => setInvoiceDueDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Notes</label>
                  <textarea value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} rows={2}
                    placeholder="Optional invoice notes..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] resize-none" />
                </div>
                {invoiceError && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{invoiceError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={creatingInvoice}
                    className="flex-1 bg-[#0F4C81] hover:bg-[#0a3a63] disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition">
                    {creatingInvoice ? 'Creating...' : 'Create Draft Invoice'}
                  </button>
                  <button type="button" onClick={() => setShowInvoiceModal(false)}
                    className="px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
