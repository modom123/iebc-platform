'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Advisor = {
  id: string
  name: string
  title: string
  rate: number
  deptName: string
  avatarSeed?: string
}

type Order = {
  id: string
  createdAt: string
  status: string
  name: string
  email: string
  company: string
  contractors: Advisor[]
  duration: number
  total: number
  monthlyTotal: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706',
  active: '#059669',
  completed: '#6B7280',
}

export default function WorkforcePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    async function load() {
      // Load from API
      try {
        const res = await fetch('/api/infrastructure/order')
        if (res.ok) {
          const data = await res.json()
          if (data.orders?.length) {
            setOrders(data.orders)
            setLoading(false)
            return
          }
        }
      } catch { /* fall through */ }

      // Fall back to sessionStorage (just placed order)
      const raw = sessionStorage.getItem('infra_cart')
      if (raw) {
        const cart = JSON.parse(raw)
        setOrders([{
          id: 'local_draft',
          createdAt: new Date().toISOString(),
          status: 'pending',
          name: '',
          email: '',
          company: '',
          ...cart,
        }])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Advisor Workforce</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your contracted IEBC AI Advisor teams</p>
        </div>
        <Link
          href="/infrastructure"
          className="px-4 py-2 text-sm font-bold bg-[#0B2140] hover:bg-[#082D4F] text-white rounded-xl transition shadow-sm"
        >
          + Build a Team
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🏗️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No AI Advisor teams yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Build your expert workforce by browsing departments and selecting the IEBC AI Advisors your business needs.
          </p>
          <Link
            href="/infrastructure"
            className="inline-block px-6 py-3 bg-[#C9A02E] hover:bg-yellow-600 text-white font-bold rounded-xl transition shadow-sm"
          >
            Browse AI Advisors →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Order header */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">
                      {order.company || 'Your Team'} — {order.contractors?.length ?? 0} AI Advisor{(order.contractors?.length ?? 0) !== 1 ? 's' : ''}
                    </h3>
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
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.duration}-month contract · ${(order.monthlyTotal ?? 0).toLocaleString()}/mo · Ordered {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-extrabold text-gray-900">${(order.total ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">total contract value</p>
                </div>
              </div>

              {/* Advisor grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(order.contractors ?? []).map(advisor => (
                    <div
                      key={advisor.id}
                      className="border border-gray-100 rounded-xl p-4 flex items-start gap-3 hover:border-[#0B2140] hover:shadow-sm transition cursor-pointer"
                      onClick={() => setSelected(order)}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(advisor.name)}&backgroundColor=0B2140`}
                        alt={advisor.name}
                        className="w-12 h-12 rounded-full shrink-0 border-2 border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{advisor.name}</p>
                        <p className="text-xs text-gray-500 truncate">{advisor.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{advisor.deptName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-[#0B2140]">${advisor.rate.toLocaleString()}/mo</span>
                          <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Access callout */}
                <div className="mt-5 rounded-xl p-4 flex flex-wrap items-center gap-4 justify-between" style={{ background: '#F0F4FF', border: '1px solid #C7D7FF' }}>
                  <div>
                    <p className="text-sm font-bold text-[#0B2140]">Portal Access Included</p>
                    <p className="text-xs text-gray-500 mt-0.5">Your team has access to Accounting, Hub, and Workforce tools through the IEBC portal.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href="/accounting" className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0B2140] text-white hover:bg-[#082D4F] transition">Accounting</Link>
                    <Link href="/hub" className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#0B2140] text-[#0B2140] hover:bg-blue-50 transition">Hub</Link>
                    <Link href="/infrastructure" className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Add Advisors</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-lg text-gray-900">Team Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-400 mb-1">Company</p><p className="font-semibold text-gray-800">{selected.company || '—'}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Contact</p><p className="font-semibold text-gray-800">{selected.name || '—'}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Email</p><p className="font-semibold text-gray-800">{selected.email || '—'}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Duration</p><p className="font-semibold text-gray-800">{selected.duration} months</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Monthly Cost</p><p className="font-semibold text-gray-800">${(selected.monthlyTotal ?? 0).toLocaleString()}/mo</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Total Value</p><p className="font-semibold text-gray-800">${(selected.total ?? 0).toLocaleString()}</p></div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">AI Advisors</p>
                <div className="space-y-3">
                  {(selected.contractors ?? []).map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                      <img
                        src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(a.name)}&backgroundColor=0B2140`}
                        alt={a.name}
                        className="w-10 h-10 rounded-full border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.title} · {a.deptName}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-700 shrink-0">${a.rate.toLocaleString()}/mo</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
