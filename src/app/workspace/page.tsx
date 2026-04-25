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

const DARK = '#0B2140'
const GOLD = '#C9A02E'

export default function WorkspaceHome() {
  const [orders, setOrders] = useState<Order[]>([])
  const [msgCount, setMsgCount] = useState(0)
  const [docCount, setDocCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, docsRes, msgsRes] = await Promise.all([
          fetch('/api/infrastructure/order'),
          fetch('/api/workspace/documents'),
          fetch('/api/workspace/messages'),
        ])
        if (ordersRes.ok) {
          const d = await ordersRes.json()
          setOrders(d.orders ?? [])
        }
        if (docsRes.ok) {
          const d = await docsRes.json()
          setDocCount(d.documents?.length ?? 0)
        }
        if (msgsRes.ok) {
          const d = await msgsRes.json()
          setMsgCount(d.messages?.length ?? 0)
        }
      } catch { /* non-blocking */ }
      setLoading(false)
    }
    load()
  }, [])

  const allAdvisors = orders.flatMap(o => (o.contractors ?? []).map(a => ({ ...a, orderId: o.id, company: o.company })))
  const totalAdvisors = allAdvisors.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#0B2140] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

      {/* Welcome banner */}
      <div className="rounded-2xl p-6 text-white" style={{ background: DARK }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: GOLD }}>Advisor Workspace</p>
        <h1 className="text-2xl font-extrabold mb-1">Your workspace is ready.</h1>
        <p className="text-sm text-white/70">
          {totalAdvisors > 0
            ? `${totalAdvisors} AI Advisor${totalAdvisors !== 1 ? 's' : ''} assigned to your team — message them, share documents, and track deliverables below.`
            : 'Build your expert AI advisor team to get started.'}
        </p>
        {totalAdvisors === 0 && (
          <Link href="/infrastructure" className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-bold text-[#0B2140] bg-[#C9A02E] hover:bg-yellow-400 transition">
            Browse AI Advisors →
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Advisors Hired', value: totalAdvisors, href: '/workspace/team', icon: '◉' },
          { label: 'Messages', value: msgCount, href: '/workspace/messages', icon: '◈' },
          { label: 'Documents', value: docCount, href: '/workspace/documents', icon: '▤' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#0B2140] hover:shadow-sm transition group">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-extrabold" style={{ color: DARK }}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 group-hover:text-[#0B2140] transition">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Your team preview */}
      {allAdvisors.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Your Advisor Team</h2>
            <Link href="/workspace/team" className="text-xs font-semibold hover:underline" style={{ color: DARK }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {allAdvisors.slice(0, 4).map(advisor => (
              <div key={advisor.id} className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(advisor.name)}&backgroundColor=0B2140`}
                  alt={advisor.name}
                  className="w-10 h-10 rounded-full border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{advisor.name}</p>
                  <p className="text-xs text-gray-400">{advisor.title} · {advisor.deptName}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/workspace/messages/${advisor.id}?name=${encodeURIComponent(advisor.name)}&title=${encodeURIComponent(advisor.title)}&order_id=${advisor.orderId}`}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white transition"
                    style={{ background: DARK }}
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {allAdvisors.length > 4 && (
            <Link href="/workspace/team" className="block text-center text-xs font-semibold mt-3 text-gray-400 hover:text-[#0B2140] transition">
              +{allAdvisors.length - 4} more advisors
            </Link>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/workspace/messages"
          className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#0B2140] hover:shadow-sm transition flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: '#EFF6FF' }}>◈</div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Send a Message</p>
            <p className="text-xs text-gray-400">Chat directly with your advisors</p>
          </div>
        </Link>
        <Link href="/workspace/documents"
          className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#0B2140] hover:shadow-sm transition flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: '#F0FDF4' }}>▤</div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Share a Document</p>
            <p className="text-xs text-gray-400">Upload files for your advisor team</p>
          </div>
        </Link>
      </div>

      {/* Upsell */}
      <div className="rounded-2xl p-5 border" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="font-bold text-sm" style={{ color: DARK }}>Ready for more?</p>
            <p className="text-xs text-gray-600 mt-0.5 max-w-sm">
              Upgrade to the Full Hub and give your advisors direct access to your accounting, cash flow, invoices, and CRM — all in one place.
            </p>
          </div>
          <Link
            href="/checkout/hub"
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-sm"
            style={{ background: GOLD }}
          >
            Upgrade to Full Hub →
          </Link>
        </div>
      </div>

    </div>
  )
}
