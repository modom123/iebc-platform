'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Vendor = {
  id: string
  name: string
  contact_name: string
  email: string
  phone: string
  address: string
  tin: string
  vendor_type: 'vendor' | 'contractor' | 'supplier'
  is_1099: boolean
  notes: string
  total_paid: number
}

type VendorBill = {
  id: string
  vendor_id: string
  vendor_name: string
  amount: number
  due_date: string
  status: string
  description: string
}

const fmt = (n: number) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function VendorsPage() {
  const [tab, setTab] = useState<'vendors' | '1099'>('vendors')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [selected, setSelected] = useState<Vendor | null>(null)
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([])

  const [form, setForm] = useState({
    name: '', contact_name: '', email: '', phone: '',
    address: '', tin: '', vendor_type: 'vendor' as Vendor['vendor_type'],
    is_1099: false, notes: '',
  })

  useEffect(() => { fetchVendors() }, [])

  async function fetchVendors() {
    setLoading(true)
    const res = await fetch('/api/accounting/vendors')
    const data = await res.json()
    setVendors(data.vendors || [])
    setLoading(false)
  }

  async function fetchVendorBills(vendorId: string) {
    const res = await fetch(`/api/accounting/vendors?vendor_id=${vendorId}&type=bills`)
    const data = await res.json()
    setVendorBills(data.bills || [])
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/accounting/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setMsg('Vendor added!')
      setShowAdd(false)
      setForm({ name: '', contact_name: '', email: '', phone: '', address: '', tin: '', vendor_type: 'vendor', is_1099: false, notes: '' })
      fetchVendors()
    } else {
      setMsg('Error adding vendor')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteVendor(id: string) {
    if (!confirm('Delete this vendor?')) return
    await fetch('/api/accounting/vendors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setSelected(null)
    fetchVendors()
  }

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.contact_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const needs1099 = vendors.filter(v => v.is_1099 && Number(v.total_paid) >= 600)
  const total1099Value = needs1099.reduce((s, v) => s + Number(v.total_paid), 0)

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Accounting</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Vendors & Contractors</span>
        </div>
        <button onClick={() => { setShowAdd(true); setSelected(null) }}
          className="bg-[#0F4C81] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-800 transition">
          + Add Vendor
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {msg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Vendors', value: String(vendors.length), color: 'text-[#0F4C81]' },
            { label: 'Contractors', value: String(vendors.filter(v => v.vendor_type === 'contractor').length), color: 'text-gray-700' },
            { label: '1099 Required', value: String(needs1099.length), color: needs1099.length > 0 ? 'text-orange-600' : 'text-gray-400' },
            { label: '1099 Total Paid', value: fmt(total1099Value), color: 'text-green-700' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(['vendors', '1099'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === '1099' ? '1099 Report' : 'All Vendors'}
            </button>
          ))}
        </div>

        <div className="flex gap-6">

          {/* Vendors List / 1099 */}
          <div className={`flex-1 space-y-4 ${selected ? 'max-w-md' : ''}`}>

            {/* Add Form */}
            {showAdd && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">New Vendor / Contractor</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-sm">Business/Vendor Name*</label>
                      <input className="input-field" required value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-sm">Contact Name</label>
                      <input className="input-field" value={form.contact_name}
                        onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-sm">Email</label>
                      <input className="input-field" type="email" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-sm">Phone</label>
                      <input className="input-field" type="tel" value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="label-sm">Address</label>
                      <input className="input-field" value={form.address}
                        onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-sm">Vendor Type</label>
                      <select className="input-field" value={form.vendor_type}
                        onChange={e => setForm(p => ({ ...p, vendor_type: e.target.value as Vendor['vendor_type'] }))}>
                        <option value="vendor">Vendor</option>
                        <option value="contractor">Independent Contractor</option>
                        <option value="supplier">Supplier</option>
                      </select>
                    </div>
                    <div>
                      <label className="label-sm">TIN / EIN / SSN</label>
                      <input className="input-field" placeholder="XX-XXXXXXX" value={form.tin}
                        onChange={e => setForm(p => ({ ...p, tin: e.target.value }))} />
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <input type="checkbox" id="is1099" checked={form.is_1099}
                        onChange={e => setForm(p => ({ ...p, is_1099: e.target.checked }))}
                        className="w-4 h-4 accent-[#0F4C81]" />
                      <label htmlFor="is1099" className="text-sm font-medium text-gray-700">
                        Requires 1099 (contractor paid $600+/year)
                      </label>
                    </div>
                    <div className="col-span-2">
                      <label className="label-sm">Notes</label>
                      <textarea className="input-field" rows={2} value={form.notes}
                        onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving}
                      className="bg-[#0F4C81] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                      {saving ? 'Saving...' : 'Add Vendor'}
                    </button>
                    <button type="button" onClick={() => setShowAdd(false)}
                      className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tab === 'vendors' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <input className="input-field" placeholder="Search vendors..." value={search}
                    onChange={e => setSearch(e.target.value)} />
                </div>
                {loading ? (
                  <div className="p-12 text-center text-gray-400">Loading...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-400 text-sm mb-3">No vendors yet</p>
                    <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">Add First Vendor</button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filtered.map(vendor => (
                      <button key={vendor.id} onClick={() => { setSelected(vendor); fetchVendorBills(vendor.id); setShowAdd(false) }}
                        className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 text-left transition ${selected?.id === vendor.id ? 'bg-blue-50' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-[#0F4C81] bg-opacity-10 flex items-center justify-center text-[#0F4C81] font-bold text-sm shrink-0">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{vendor.name}</p>
                          <p className="text-xs text-gray-400 truncate">{vendor.contact_name || vendor.email || vendor.vendor_type}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-700">{fmt(vendor.total_paid || 0)}</p>
                          <div className="flex gap-1 justify-end mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              vendor.vendor_type === 'contractor' ? 'bg-purple-100 text-purple-700' :
                              vendor.vendor_type === 'supplier' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{vendor.vendor_type}</span>
                            {vendor.is_1099 && <span className="px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-700">1099</span>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === '1099' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">1099 Report</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Contractors paid $600+ requiring Form 1099-NEC</p>
                </div>
                {needs1099.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-sm">No 1099-required vendors yet</div>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="p-3 text-left">Vendor / Contractor</th>
                        <th className="p-3 text-left">TIN</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-right">YTD Paid</th>
                        <th className="p-3 text-center">1099 Status</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {needs1099.map(v => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="p-3">
                              <p className="font-medium">{v.name}</p>
                              {v.contact_name && <p className="text-xs text-gray-400">{v.contact_name}</p>}
                            </td>
                            <td className="p-3 font-mono text-sm text-gray-600">{v.tin || <span className="text-red-500 text-xs">Missing TIN!</span>}</td>
                            <td className="p-3 capitalize text-gray-600">{v.vendor_type}</td>
                            <td className={`p-3 text-right font-mono font-semibold ${Number(v.total_paid) >= 600 ? 'text-orange-600' : 'text-gray-700'}`}>
                              {fmt(v.total_paid)}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                !v.tin ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {!v.tin ? 'Missing TIN' : 'Needs Filing'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td className="p-3" colSpan={3}>Total 1099 Payments</td>
                          <td className="p-3 text-right font-mono text-orange-600">{fmt(total1099Value)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                    <div className="p-4 bg-orange-50 border-t border-orange-100 text-xs text-orange-700">
                      <strong>Reminder:</strong> 1099-NEC forms must be filed by January 31 for payments made in the prior calendar year. Consult your tax advisor.
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Vendor Detail Sidebar */}
          {selected && tab === 'vendors' && (
            <div className="w-80 shrink-0 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Vendor Details</h3>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#0F4C81] bg-opacity-10 flex items-center justify-center text-[#0F4C81] font-bold text-lg mb-3">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-lg">{selected.name}</p>
                    {selected.contact_name && <p className="text-sm text-gray-500">{selected.contact_name}</p>}
                  </div>
                  <div className="space-y-2 text-sm">
                    {selected.email && <div className="flex gap-2"><span className="text-gray-400 w-16">Email</span><span>{selected.email}</span></div>}
                    {selected.phone && <div className="flex gap-2"><span className="text-gray-400 w-16">Phone</span><span>{selected.phone}</span></div>}
                    {selected.address && <div className="flex gap-2"><span className="text-gray-400 w-16">Address</span><span>{selected.address}</span></div>}
                    {selected.tin && <div className="flex gap-2"><span className="text-gray-400 w-16">TIN</span><span className="font-mono">{selected.tin}</span></div>}
                    <div className="flex gap-2"><span className="text-gray-400 w-16">Type</span>
                      <span className="capitalize">{selected.vendor_type}</span>
                    </div>
                    <div className="flex gap-2"><span className="text-gray-400 w-16">1099</span>
                      <span>{selected.is_1099 ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex gap-2"><span className="text-gray-400 w-16">Total Paid</span>
                      <span className="font-semibold">{fmt(selected.total_paid || 0)}</span>
                    </div>
                  </div>
                  {selected.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{selected.notes}</div>
                  )}
                  <button onClick={() => deleteVendor(selected.id)}
                    className="w-full text-red-500 hover:text-red-700 text-sm border border-red-200 hover:border-red-300 rounded-lg py-1.5 transition">
                    Delete Vendor
                  </button>
                </div>
              </div>

              {/* Vendor Bills */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h4 className="font-semibold text-sm text-gray-800">Bills from {selected.name}</h4>
                </div>
                {vendorBills.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">No bills recorded</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {vendorBills.map(b => (
                      <div key={b.id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{b.description}</p>
                          <p className="text-xs text-gray-400">Due {b.due_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{fmt(b.amount)}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${b.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
