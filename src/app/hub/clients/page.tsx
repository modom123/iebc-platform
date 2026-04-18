'use client'

import { useState, useEffect, useCallback } from 'react'

type Client = {
  id: string
  clientId: string
  name?: string
  email?: string
  phone?: string
  company?: string
  business_name?: string
  type?: string
  plan?: string
  status: string
  createdAt: string
  total?: number
  advisors?: { name: string; title: string }[]
  contractors?: { name: string; title: string }[]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/infrastructure/order')
      if (!res.ok) return
      const data = await res.json()
      // Deduplicate by clientId — latest order per client
      const map = new Map<string, Client>()
      for (const o of (data.orders as Client[])) {
        if (!map.has(o.clientId) || new Date(o.createdAt) > new Date(map.get(o.clientId)!.createdAt)) {
          map.set(o.clientId, o)
        }
      }
      setClients([...map.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch { /* non-blocking */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const filtered = clients.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.business_name?.toLowerCase().includes(q) ||
      c.clientId?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Client Directory</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">All clients who have placed orders — one record per IEBC client ID</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, company, or client ID…"
          className="w-full max-w-sm text-[13px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-[13px]">Loading clients…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="text-4xl mb-3">◯</div>
          <p className="font-semibold text-[14px]">{clients.length === 0 ? 'No clients yet' : 'No clients match your search'}</p>
          <p className="text-[12px] mt-1">Clients appear here once they place an order</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-semibold text-[11px] text-gray-400 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] text-gray-400 uppercase tracking-wide hidden sm:table-cell">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] text-gray-400 uppercase tracking-wide hidden md:table-cell">Plan / Type</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] text-gray-400 uppercase tracking-wide hidden sm:table-cell">Advisors</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] text-gray-400 uppercase tracking-wide hidden lg:table-cell">Since</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const displayName = c.company || c.business_name || c.name || '—'
                const team = (c.advisors?.length ? c.advisors : c.contractors) ?? []
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{displayName}</p>
                      {c.email && <a href={`mailto:${c.email}`} className="text-[11px] text-[#0F4C81] hover:underline">{c.email}</a>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-[11px] bg-[#0F4C81]/10 text-[#0F4C81] px-1.5 py-0.5 rounded">{c.clientId}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell capitalize text-gray-600">
                      {c.type || '—'}{c.plan ? ` / ${c.plan}` : ''}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                      {team.length > 0 ? `${team.length} advisor${team.length !== 1 ? 's' : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        c.status === 'active' ? 'bg-green-100 text-green-700' :
                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        c.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
