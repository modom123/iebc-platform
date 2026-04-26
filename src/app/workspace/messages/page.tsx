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
}

type Message = {
  advisor_id: string
  advisor_name: string
  content: string
  sender_role: string
  created_at: string
}

const DARK = '#0B2140'

export default function WorkspaceMessagesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, msgsRes] = await Promise.all([
          fetch('/api/infrastructure/order'),
          fetch('/api/workspace/messages'),
        ])
        if (ordersRes.ok) {
          const d = await ordersRes.json()
          setOrders(d.orders ?? [])
        }
        if (msgsRes.ok) {
          const d = await msgsRes.json()
          setMessages(d.messages ?? [])
        }
      } catch { /* non-blocking */ }
      setLoading(false)
    }
    load()
  }, [])

  // Build per-advisor thread summaries
  const advisors = orders.flatMap(o =>
    (o.contractors ?? []).map(a => ({ ...a, orderId: o.id, company: o.company }))
  )

  function lastMessageFor(advisorId: string): Message | undefined {
    return [...messages]
      .filter(m => m.advisor_id === advisorId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  }

  function unreadCount(_advisorId: string): number { return 0 }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#0B2140] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-400 mt-0.5">Direct threads with your AI Advisor team</p>
      </div>

      {advisors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">◈</p>
          <p className="font-bold text-gray-800 mb-1">No advisors yet</p>
          <p className="text-sm text-gray-500 mb-5">Hire AI Advisors to unlock messaging.</p>
          <Link href="/infrastructure" className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: DARK }}>
            Browse Advisors →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {advisors.map(advisor => {
            const lastMsg = lastMessageFor(advisor.id)
            const unread = unreadCount(advisor.id)
            return (
              <Link
                key={advisor.id}
                href={`/workspace/messages/${advisor.id}?name=${encodeURIComponent(advisor.name)}&title=${encodeURIComponent(advisor.title)}&order_id=${advisor.orderId}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
              >
                <img
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(advisor.name)}&backgroundColor=0B2140`}
                  alt={advisor.name}
                  className="w-11 h-11 rounded-full border-2 border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{advisor.name}</p>
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: DARK }}>
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{advisor.title} · {advisor.deptName}</p>
                  {lastMsg && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {lastMsg.sender_role === 'client' ? 'You: ' : ''}{lastMsg.content}
                    </p>
                  )}
                  {!lastMsg && (
                    <p className="text-xs text-gray-400 mt-0.5 italic">No messages yet — say hello</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {lastMsg && (
                    <p className="text-[10px] text-gray-400">
                      {new Date(lastMsg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
