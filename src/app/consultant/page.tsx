'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Lead = {
  id: string
  business_name: string
  contact_email: string
  heat: 'hot' | 'warm' | 'cold'
  status: 'new' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost'
  est_value: number
  created_at: string
}

const HEAT_DOT: Record<string, string> = {
  hot:  'bg-red-500',
  warm: 'bg-yellow-400',
  cold: 'bg-blue-400',
}
const STATUS_LABEL: Record<string, string> = {
  new:         'New',
  contacted:   'Contacted',
  qualified:   'Qualified',
  closed_won:  'Won',
  closed_lost: 'Lost',
}
const STATUS_COLOR: Record<string, string> = {
  new:         'bg-gray-100 text-gray-600',
  contacted:   'bg-blue-100 text-blue-700',
  qualified:   'bg-purple-100 text-purple-700',
  closed_won:  'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-400',
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US')

export default function ConsultantDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const hot       = leads.filter(l => l.heat === 'hot')
  const newLeads  = leads.filter(l => l.status === 'new')
  const contacted = leads.filter(l => l.status === 'contacted')
  const qualified = leads.filter(l => l.status === 'qualified')
  const won       = leads.filter(l => l.status === 'closed_won')
  const pipeline  = leads.filter(l => !['closed_won','closed_lost'].includes(l.status))
  const pipelineValue = pipeline.reduce((s, l) => s + Number(l.est_value), 0)
  const wonValue      = won.reduce((s, l) => s + Number(l.est_value), 0)

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const hotLeads = [...hot]
    .sort((a, b) => Number(b.est_value) - Number(a.est_value))
    .slice(0, 5)

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Your sales activity at a glance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pipeline',    value: fmt(pipelineValue), sub: `${pipeline.length} deals`,      color: 'text-[#1a3a5c]',  bg: 'bg-blue-50  border-blue-100' },
          { label: 'Hot Leads',   value: String(hot.length), sub: 'need action now',               color: 'text-red-600',    bg: 'bg-red-50   border-red-100'  },
          { label: 'Qualified',   value: String(qualified.length), sub: 'ready to close',          color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100' },
          { label: 'Closed Won',  value: fmt(wonValue),      sub: `${won.length} deals`,           color: 'text-green-700',  bg: 'bg-green-50 border-green-100' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className={`rounded-xl border px-4 py-3 ${bg}`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[12px] font-semibold text-gray-700 mt-0.5">{label}</p>
            <p className="text-[10px] text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline funnel + Hot leads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Pipeline stages */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[14px] text-gray-900">Pipeline Stages</h2>
            <Link href="/consultant/pipeline" className="text-[11px] text-[#1a3a5c] hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {[
              { label: 'New',       count: newLeads.length,  total: leads.length, color: 'bg-gray-300' },
              { label: 'Contacted', count: contacted.length, total: leads.length, color: 'bg-blue-400' },
              { label: 'Qualified', count: qualified.length, total: leads.length, color: 'bg-purple-400' },
              { label: 'Won',       count: won.length,       total: leads.length, color: 'bg-green-400' },
            ].map(({ label, count, total, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-800">{count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot leads */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[14px] text-gray-900">🔥 Hot Leads</h2>
            <Link href="/consultant/leads" className="text-[11px] text-[#1a3a5c] hover:underline">All leads →</Link>
          </div>
          {loading ? (
            <p className="text-[13px] text-gray-400">Loading…</p>
          ) : hotLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <p className="text-[13px]">No hot leads yet</p>
              <Link href="/consultant/leads" className="mt-2 text-[12px] text-[#1a3a5c] hover:underline">Add a lead →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {hotLeads.map(l => (
                <div key={l.id} className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${HEAT_DOT[l.heat]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{l.business_name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{l.contact_email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-bold text-[#1a3a5c]">{fmt(l.est_value)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[l.status]}`}>
                      {STATUS_LABEL[l.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/consultant/leads',    icon: '◆', label: 'Add Lead',       desc: 'Log a new prospect' },
          { href: '/consultant/outreach', icon: '✉', label: 'Send Outreach',  desc: 'Email a lead now'   },
          { href: '/consultant/tasks',    icon: '☑', label: 'My Tasks',       desc: 'See what\'s due'    },
          { href: '/consultant/playbook', icon: '▤', label: 'Sales Playbook', desc: 'Scripts & resources'},
        ].map(({ href, icon, label, desc }) => (
          <Link key={label} href={href}
            className="bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-[#1a3a5c]/30 hover:shadow-sm transition group">
            <span className="text-xl">{icon}</span>
            <p className="font-semibold text-[13px] text-gray-900 mt-1.5 group-hover:text-[#1a3a5c]">{label}</p>
            <p className="text-[11px] text-gray-400">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent leads table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-[14px] text-gray-900">Recent Leads</h2>
          <Link href="/consultant/leads" className="text-[11px] text-[#1a3a5c] hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-400 text-[13px]">Loading leads…</div>
        ) : recentLeads.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            <p className="text-[13px]">No leads yet — start building your pipeline</p>
            <Link href="/consultant/leads" className="mt-2 inline-block text-[12px] bg-[#1a3a5c] text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-[#0d2e4a] transition">
              + Add First Lead
            </Link>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wide">Company</th>
                <th className="text-left px-4 py-2.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wide hidden sm:table-cell">Heat</th>
                <th className="text-left px-4 py-2.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wide hidden md:table-cell">Value</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(l => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-gray-900">{l.business_name}</p>
                    <p className="text-[11px] text-gray-400">{l.contact_email}</p>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${HEAT_DOT[l.heat]}`} />
                      <span className="capitalize text-gray-600">{l.heat}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[l.status]}`}>
                      {STATUS_LABEL[l.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell font-semibold text-gray-700">{fmt(l.est_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
