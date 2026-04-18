'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Lead = {
  id: string
  business_name: string
  contact_email: string
  industry: string
  heat: 'hot' | 'warm' | 'cold'
  status: 'new' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost'
  est_value: number
  created_at: string
}

const STAGES: { key: Lead['status']; label: string; color: string; bg: string }[] = [
  { key: 'new',         label: 'New',       color: 'text-gray-600',   bg: 'bg-gray-100'   },
  { key: 'contacted',   label: 'Contacted', color: 'text-blue-700',   bg: 'bg-blue-50'    },
  { key: 'qualified',   label: 'Qualified', color: 'text-purple-700', bg: 'bg-purple-50'  },
  { key: 'closed_won',  label: 'Won ✓',     color: 'text-green-700',  bg: 'bg-green-50'   },
  { key: 'closed_lost', label: 'Lost',      color: 'text-gray-400',   bg: 'bg-gray-50'    },
]

const HEAT_DOT: Record<string, string> = { hot: 'bg-red-500', warm: 'bg-yellow-400', cold: 'bg-blue-400' }
const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US')

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function moveToStage(leadId: string, status: Lead['status']) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
    await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, status }),
    })
  }

  function onDrop(e: React.DragEvent, status: Lead['status']) {
    e.preventDefault()
    if (dragging) moveToStage(dragging, status)
    setDragging(null)
  }

  const totalPipeline = leads
    .filter(l => !['closed_won', 'closed_lost'].includes(l.status))
    .reduce((s, l) => s + Number(l.est_value), 0)

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Pipeline</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {leads.filter(l => !['closed_won','closed_lost'].includes(l.status)).length} active deals · {fmt(totalPipeline)} total value
          </p>
        </div>
        <Link href="/consultant/leads"
          className="text-[13px] bg-[#1a3a5c] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0d2e4a] transition">
          + Add Lead
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-[13px]">Loading pipeline…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-start">
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.status === stage.key)
            const stageValue = stageLeads.reduce((s, l) => s + Number(l.est_value), 0)
            return (
              <div key={stage.key}
                onDragOver={e => e.preventDefault()}
                onDrop={e => onDrop(e, stage.key)}
                className="min-h-[120px]">
                {/* Column header */}
                <div className={`rounded-lg px-3 py-2 mb-2 ${stage.bg}`}>
                  <p className={`font-bold text-[12px] ${stage.color}`}>{stage.label}</p>
                  <p className="text-[11px] text-gray-500">{stageLeads.length} · {fmt(stageValue)}</p>
                </div>
                {/* Cards */}
                <div className="space-y-2">
                  {stageLeads.map(l => (
                    <div key={l.id}
                      draggable
                      onDragStart={() => setDragging(l.id)}
                      onDragEnd={() => setDragging(null)}
                      className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing transition ${dragging === l.id ? 'opacity-50' : 'hover:shadow-md'}`}>
                      <div className="flex items-start gap-1.5 mb-1.5">
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${HEAT_DOT[l.heat]}`} />
                        <p className="font-semibold text-[12px] text-gray-900 leading-tight">{l.business_name}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mb-2">{l.contact_email}</p>
                      <p className="text-[12px] font-bold text-[#1a3a5c]">{fmt(l.est_value)}</p>
                      {/* Quick stage buttons */}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {STAGES.filter(s => s.key !== stage.key && s.key !== 'closed_lost').slice(0, 2).map(s => (
                          <button key={s.key} onClick={() => moveToStage(l.id, s.key)}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-[#1a3a5c] hover:text-white transition">
                            → {s.label}
                          </button>
                        ))}
                        {stage.key !== 'closed_lost' && (
                          <button onClick={() => moveToStage(l.id, 'closed_lost')}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition">
                            ✕ Lost
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center text-[11px] text-gray-300">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
