'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Order = { id: string; business_name?: string; name?: string; status: string; type?: string; plan?: string; notes?: string; createdAt?: string; created_at?: string }

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-100 text-green-700 border border-green-200',
  pending:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  completed: 'bg-blue-100 text-blue-700 border border-blue-200',
  cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
}

const STAGES = [
  { key: 'discovery',    label: 'Discovery Call',      icon: '📞' },
  { key: 'proposal',     label: 'Proposal Sent',        icon: '📄' },
  { key: 'onboarding',   label: 'Onboarding',           icon: '🚀' },
  { key: 'in_progress',  label: 'Build In Progress',    icon: '🛠️' },
  { key: 'review',       label: 'Client Review',        icon: '👁️' },
  { key: 'delivered',    label: 'Delivered',            icon: '✅' },
]

export default function BuildsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('hub_prospects')
      .select('*')
      .in('stage', ['demo', 'proposal', 'closed_won'])
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

  const active = orders.filter(o => o.status === 'active' || !o.status)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Active Builds</h1>
          {active.length > 0 && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">{active.length} active</span>
          )}
        </div>
        <Link href="/hub/orders" className="text-sm text-[#0F4C81] hover:underline">All Orders →</Link>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Build pipeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Build Pipeline</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {STAGES.map((s, i) => (
              <div key={s.key} className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 text-lg ${i < 3 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  {s.icon}
                </div>
                <p className="text-[10px] text-gray-500 font-medium leading-tight">{s.label}</p>
                {i < STAGES.length - 1 && (
                  <div className="hidden md:block absolute" />
                )}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading builds...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center space-y-4">
            <div className="text-5xl">🛠️</div>
            <h3 className="font-bold text-gray-700">No active builds</h3>
            <p className="text-gray-400 text-sm">When prospects move to proposal or closed stage, their builds appear here.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/hub/intakes" className="bg-[#0F4C81] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#082D4F] transition">
                New Intake
              </Link>
              <Link href="/hub/leads" className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                View CRM
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{o.business_name || o.name || 'Unnamed Client'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.type || o.plan || 'Build'} · {o.notes?.substring(0, 60) || '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] || STATUS_COLORS.active}`}>
                    {o.status || 'active'}
                  </span>
                  <Link href="/hub/orders" className="text-xs text-[#0F4C81] hover:underline font-medium">Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
