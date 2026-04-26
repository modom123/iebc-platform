'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Advisor = {
  id: string
  name: string
  title: string
  rate: number
  deptName: string
}

type Order = {
  id: string
  company: string
  contractors: Advisor[]
  duration: number
  total: number
  monthlyTotal: number
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706',
  active: '#059669',
  completed: '#6B7280',
}

const DARK = '#0B2140'
const GOLD = '#C9A02E'

export default function WorkspaceTeamPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/infrastructure/order')
        if (res.ok) {
          const d = await res.json()
          setOrders(d.orders ?? [])
        }
      } catch { /* non-blocking */ }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#0B2140] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const allAdvisors = orders.flatMap(o =>
    (o.contractors ?? []).map(a => ({ ...a, orderId: o.id, orderStatus: o.status, company: o.company }))
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Advisor Team</h1>
          <p className="text-sm text-gray-400 mt-0.5">{allAdvisors.length} AI Advisor{allAdvisors.length !== 1 ? 's' : ''} contracted</p>
        </div>
        <Link
          href="/infrastructure"
          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition shadow-sm"
          style={{ background: DARK }}
        >
          + Add Advisors
        </Link>
      </div>

      {allAdvisors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">◉</div>
          <h2 className="font-bold text-gray-800 mb-1">No advisors yet</h2>
          <p className="text-sm text-gray-500 mb-5">Browse IEBC AI Advisors and assemble your expert team.</p>
          <Link href="/infrastructure" className="inline-block px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: GOLD }}>
            Browse AI Advisors →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            order.contractors?.length > 0 && (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-900">{order.company || 'Your Team'}</p>
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize"
                      style={{
                        background: `${STATUS_COLORS[order.status] ?? '#6B7280'}18`,
                        color: STATUS_COLORS[order.status] ?? '#6B7280',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{order.duration}-month · ${(order.monthlyTotal ?? 0).toLocaleString()}/mo</p>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.contractors.map(advisor => (
                    <div key={advisor.id} className="border border-gray-100 rounded-xl p-4 hover:border-[#0B2140] hover:shadow-sm transition">
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(advisor.name)}&backgroundColor=0B2140`}
                          alt={advisor.name}
                          className="w-12 h-12 rounded-full border-2 border-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">{advisor.name}</p>
                          <p className="text-xs text-gray-500">{advisor.title}</p>
                          <p className="text-[10px] text-gray-400">{advisor.deptName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            <span className="text-[10px] text-green-600 font-semibold">Active</span>
                            <span className="text-[10px] text-gray-400 ml-1">${advisor.rate.toLocaleString()}/mo</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/workspace/messages/${advisor.id}?name=${encodeURIComponent(advisor.name)}&title=${encodeURIComponent(advisor.title)}&order_id=${order.id}`}
                          className="flex-1 text-center py-1.5 rounded-lg text-xs font-bold text-white transition"
                          style={{ background: DARK }}
                        >
                          Message
                        </Link>
                        <Link
                          href={`/workspace/documents?order_id=${order.id}&advisor_id=${advisor.id}&advisor_name=${encodeURIComponent(advisor.name)}`}
                          className="flex-1 text-center py-1.5 rounded-lg text-xs font-bold border transition hover:bg-gray-50"
                          style={{ borderColor: DARK, color: DARK }}
                        >
                          Documents
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Upsell */}
      <div className="rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 justify-between" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
        <div>
          <p className="font-bold text-sm" style={{ color: DARK }}>Give your team full visibility</p>
          <p className="text-xs text-gray-600 mt-0.5">Connect accounting &amp; CRM so advisors see the numbers behind the decisions.</p>
        </div>
        <Link href="/checkout/hub" className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition" style={{ background: GOLD }}>
          Upgrade to Full Hub →
        </Link>
      </div>
    </div>
  )
}
