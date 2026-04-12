'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  created_at: string
  invoice_count?: number
  total_billed?: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  const load = async () => {
    setLoading(true)
    const [custRes, invRes] = await Promise.all([
      fetch('/api/accounting/customers'),
      fetch('/api/accounting/invoices'),
    ])
    const custs = await custRes.json()
    const invs = await invRes.json()

    const enriched = (Array.isArray(custs) ? custs : []).map((c: Customer) => {
      const custInvoices = Array.isArray(invs) ? invs.filter((i: { customer_id: string; total: number }) => i.customer_id === c.id) : []
      return {
        ...c,
        invoice_count: custInvoices.length,
        total_billed: custInvoices.reduce((s: number, i: { total: number }) => s + Number(i.total), 0),
      }
    })
    setCustomers(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (c: Customer) => {
    setEditId(c.id)
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/customers', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editId ? { id: editId, ...form } : form),
    })
    if (res.ok) {
      setShowForm(false)
      setEditId(null)
      setForm({ name: '', email: '', phone: '', address: '' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer? Their invoice history will remain.')) return
    await fetch(`/api/accounting/customers?id=${id}`, { method: 'DELETE' })
    load()
  }

  const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Customers</h1>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: '', email: '', phone: '', address: '' }); setShowForm(true) }}
          className="btn-primary text-sm">+ New Customer</button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Customers', value: String(customers.length), color: 'text-gray-800' },
            { label: 'Total Billed', value: fmt(customers.reduce((s, c) => s + (c.total_billed || 0), 0)), color: 'text-[#0F4C81]' },
            { label: 'Avg. Value', value: customers.length ? fmt(customers.reduce((s, c) => s + (c.total_billed || 0), 0) / customers.length) : '$0.00', color: 'text-green-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] bg-white"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">{editId ? 'Edit Customer' : 'New Customer'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Full Name / Business Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="123 Main St, City, State" />
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editId ? 'Update Customer' : 'Save Customer'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-3">{search ? 'No customers match your search' : 'No customers yet'}</p>
              {!search && <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add First Customer</button>}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-right">Invoices</th>
                <th className="p-3 text-right">Total Billed</th>
                <th className="p-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-semibold text-gray-800">{c.name}</p>
                      {c.address && <p className="text-xs text-gray-400">{c.address}</p>}
                    </td>
                    <td className="p-3">
                      {c.email && <p className="text-gray-600">{c.email}</p>}
                      {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{c.invoice_count || 0}</span>
                    </td>
                    <td className="p-3 text-right font-semibold">{fmt(c.total_billed || 0)}</td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Link href={`/accounting/invoices?customer=${c.id}`} className="text-xs text-[#0F4C81] hover:underline">Invoices</Link>
                        <button onClick={() => openEdit(c)} className="text-xs text-gray-500 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
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
