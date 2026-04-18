'use client'

import { useState, useEffect, useCallback } from 'react'

type Advisor = { name: string; title: string; deptName?: string; rate?: number; negotiatedRate?: number }
type Order = {
  id: string
  clientId?: string
  createdAt: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  type?: string
  plan?: string
  name?: string
  email?: string
  phone?: string
  company?: string
  business_name?: string
  notes?: string
  advisors?: Advisor[]
  contractors?: Advisor[]
  duration?: number
  total?: number
  monthlyTotal?: number
  monthly?: number
  build?: number
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800 border border-yellow-200',
  active:    'bg-green-100 text-green-800 border border-green-200',
  completed: 'bg-blue-100 text-blue-800 border border-blue-200',
  cancelled: 'bg-gray-100 text-gray-600 border border-gray-200',
}

const TYPE_ICONS: Record<string, string> = {
  infrastructure: '🏗️',
  bundle:         '📦',
  website:        '🌐',
  ii:             '🤝',
}

function OrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: Order['status']) => void }) {
  const [expanded, setExpanded] = useState(false)
  const team = (order.advisors?.length ? order.advisors : order.contractors) ?? []
  const hasOffers = team.some(a => a.negotiatedRate != null)
  const typeIcon = TYPE_ICONS[order.type ?? ''] ?? '📋'
  const clientName = order.company || order.business_name || order.name || '—'

  return (
    <div className={`bg-white rounded-xl border ${order.status === 'pending' ? 'border-yellow-200 shadow-yellow-50' : 'border-gray-200'} shadow-sm overflow-hidden`}>
      {/* Card header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-lg shrink-0">
          {typeIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[14px] text-gray-900 truncate">{clientName}</span>
            {order.clientId && (
              <span className="text-[10px] font-mono bg-[#0F4C81]/10 text-[#0F4C81] px-1.5 py-0.5 rounded font-bold">{order.clientId}</span>
            )}
            {hasOffers && (
              <span className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-200 px-1.5 py-0.5 rounded font-bold">⚡ Offer</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 flex-wrap">
            <span>{new Date(order.createdAt).toLocaleString()}</span>
            {order.type && <span className="capitalize">· {order.type}{order.plan ? ` / ${order.plan}` : ''}</span>}
            {team.length > 0 && <span>· {team.length} advisor{team.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {order.total && (
            <span className="text-[13px] font-bold text-[#0F4C81]">${Number(order.total).toLocaleString()}</span>
          )}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}`}>
            {order.status}
          </span>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50/50">
          {/* Client info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-[13px]">
            {order.name && <div><span className="text-gray-400">Contact</span><p className="font-medium text-gray-900">{order.name}</p></div>}
            {order.email && <div><span className="text-gray-400">Email</span><p className="font-medium"><a href={`mailto:${order.email}`} className="text-[#0F4C81] hover:underline">{order.email}</a></p></div>}
            {order.phone && <div><span className="text-gray-400">Phone</span><p className="font-medium text-gray-900">{order.phone}</p></div>}
            {order.duration && <div><span className="text-gray-400">Duration</span><p className="font-medium text-gray-900">{order.duration} mo</p></div>}
            {order.monthlyTotal && <div><span className="text-gray-400">Monthly</span><p className="font-medium text-gray-900">${Number(order.monthlyTotal).toLocaleString()}/mo</p></div>}
            {order.build && <div><span className="text-gray-400">Website Build</span><p className="font-medium text-gray-900">${Number(order.build).toLocaleString()}</p></div>}
          </div>
          {order.notes && (
            <div className="text-[13px]">
              <span className="text-gray-400">Notes</span>
              <p className="text-gray-700 mt-0.5">{order.notes}</p>
            </div>
          )}

          {/* Advisors table */}
          {team.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Advisors Requested</p>
              <div className="space-y-1">
                {team.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 text-[13px] border border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-[#0F4C81] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {a.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{a.name}</p>
                      <p className="text-gray-400 text-[11px] truncate">{a.title}{a.deptName ? ` · ${a.deptName}` : ''}</p>
                    </div>
                    {a.negotiatedRate ? (
                      <div className="text-right shrink-0">
                        <p className="font-bold text-yellow-700">${a.negotiatedRate.toLocaleString()}/mo</p>
                        {a.rate && <p className="text-[10px] text-gray-400 line-through">${a.rate.toLocaleString()}/mo</p>}
                      </div>
                    ) : a.rate ? (
                      <p className="font-semibold text-gray-900 shrink-0">${a.rate.toLocaleString()}/mo</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status actions */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[12px] text-gray-400 mr-1">Update status:</span>
            {(['pending', 'active', 'completed', 'cancelled'] as Order['status'][]).map(s => (
              <button key={s}
                onClick={() => onStatusChange(order.id, s)}
                disabled={order.status === s}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize transition ${
                  order.status === s
                    ? `${STATUS_COLORS[s]} opacity-70 cursor-default`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {s}
              </button>
            ))}
            <a href={`mailto:${order.email}`}
              className="ml-auto text-[11px] bg-[#0F4C81] text-white px-3 py-1 rounded-full font-semibold hover:bg-[#0d4070] transition">
              Reply to Client
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Order['status']>('all')
  const [search, setSearch] = useState('')

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/infrastructure/order')
      if (!res.ok) return
      const data = await res.json()
      setOrders((data.orders as Order[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch { /* non-blocking */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const id = setInterval(fetchOrders, 30_000)
    return () => clearInterval(id)
  }, [fetchOrders])

  async function handleStatusChange(orderId: string, newStatus: Order['status']) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    try {
      await fetch('/api/infrastructure/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
    } catch { /* in-memory fallback already applied */ }
  }

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        o.name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.company?.toLowerCase().includes(q) ||
        o.business_name?.toLowerCase().includes(q) ||
        o.clientId?.toLowerCase().includes(q) ||
        false
      )
    }
    return true
  })

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    active:    orders.filter(o => o.status === 'active').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Orders Inbox</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">All incoming advisor, bundle, and website orders</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Pending', count: counts.pending, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
          { label: 'Active',  count: counts.active,  color: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Total',   count: counts.all,     color: 'text-[#0F4C81] bg-blue-50 border-blue-200' },
          { label: 'Done',    count: counts.completed, color: 'text-gray-600 bg-gray-50 border-gray-200' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border px-4 py-3 ${color}`}>
            <p className="text-2xl font-black">{count}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'pending', 'active', 'completed', 'cancelled'] as const).map(s => (
            <button key={s}
              onClick={() => setFilter(s)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md capitalize transition ${
                filter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {s}{s !== 'all' && counts[s] > 0 ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, company, ID…"
          className="flex-1 min-w-[180px] text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
        />
        <button onClick={fetchOrders} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition text-[13px]">
          ↻
        </button>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-[13px]">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold text-[14px]">{orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}</p>
          <p className="text-[12px] mt-1">Orders from the infrastructure and bundle pages appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}
