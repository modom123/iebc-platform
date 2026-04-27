'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type Lead = {
  id: string
  business_name: string
  contact_email: string
  industry: string
  heat: string
  status: string
  est_value: number
  assigned_to: string | null
  assigned_to_name: string | null
  created_at: string
}

type Worker = {
  id: string
  full_name: string | null
  email: string | null
  role: string
}

type Totals = { total: number; unassigned: number; assigned: number }

const HEAT_STYLES: Record<string, string> = {
  hot:  'bg-red-100 text-red-600',
  warm: 'bg-yellow-100 text-yellow-700',
  cold: 'bg-blue-100 text-blue-600',
}

const STATUS_STYLES: Record<string, string> = {
  new:         'bg-gray-100 text-gray-600',
  contacted:   'bg-blue-100 text-blue-700',
  qualified:   'bg-purple-100 text-purple-700',
  closed_won:  'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-400',
}

export default function AdminLeadsPage() {
  const [leads, setLeads]       = useState<Lead[]>([])
  const [workers, setWorkers]   = useState<Worker[]>([])
  const [totals, setTotals]     = useState<Totals>({ total: 0, unassigned: 0, assigned: 0 })
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [search, setSearch]             = useState('')
  const [filterAssigned, setFilterAssigned] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [assignTarget, setAssignTarget] = useState('')
  const [assigning, setAssigning]       = useState(false)
  const [assignMsg, setAssignMsg]       = useState('')

  const workerLabel = (w: Worker) => w.full_name || w.email || w.id

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterAssigned) params.set('assigned_to', filterAssigned)
    if (filterStatus)   params.set('status', filterStatus)
    if (search)         params.set('search', search)
    const res = await fetch(`/api/admin/leads?${params}`)
    if (res.ok) {
      const d = await res.json()
      setLeads(d.leads || [])
      setWorkers(d.workers || [])
      setTotals(d.totals || { total: 0, unassigned: 0, assigned: 0 })
    }
    setSelected(new Set())
    setLoading(false)
  }, [filterAssigned, filterStatus, search])

  useEffect(() => { load() }, [load])

  const toggle = (id: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleAll = () =>
    setSelected(selected.size === leads.length ? new Set() : new Set(leads.map(l => l.id)))

  const bulkAssign = async () => {
    if (!selected.size || !assignTarget) return
    setAssigning(true)
    setAssignMsg('')
    const res = await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_ids:    [...selected],
        assigned_to: assignTarget === '__unassign__' ? null : assignTarget,
      }),
    })
    const d = await res.json()
    if (res.ok) {
      setAssignMsg(`${d.updated} lead${d.updated !== 1 ? 's' : ''} updated.`)
      load()
    } else {
      setAssignMsg(d.error || 'Assignment failed.')
    }
    setAssigning(false)
  }

  // Quick-assign a single lead inline
  const quickAssign = async (leadId: string, workerId: string) => {
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_ids: [leadId], assigned_to: workerId || null }),
    })
    load()
  }

  const unassignedPct = totals.total > 0 ? Math.round((totals.unassigned / totals.total) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Admin</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Lead Assignment</h1>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hub/leads" className="text-xs text-[#0F4C81] hover:underline">Worker CRM View →</Link>
          <Link href="/admin/subscribers" className="text-xs bg-[#0B2140] text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90">
            Subscribers →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Leads</p>
            <p className="text-3xl font-extrabold text-gray-800 mt-1">{totals.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-orange-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Unassigned</p>
            <p className="text-3xl font-extrabold text-orange-500 mt-1">{totals.unassigned}</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${unassignedPct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{unassignedPct}% of pipeline unassigned</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assigned</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">{totals.assigned}</p>
            <p className="text-xs text-gray-400 mt-1">{workers.length} worker{workers.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>

        {/* Worker breakdown */}
        {workers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Worker Load</p>
            <div className="flex flex-wrap gap-3">
              {workers.map(w => {
                const count = leads.filter(l => l.assigned_to === w.id).length
                return (
                  <button key={w.id}
                    onClick={() => setFilterAssigned(filterAssigned === w.id ? '' : w.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${filterAssigned === w.id ? 'border-[#0B2140] bg-[#0B2140]/5 font-semibold' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="w-6 h-6 rounded-full bg-[#0B2140] text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {(w.full_name || w.email || '?')[0].toUpperCase()}
                    </span>
                    <span className="text-gray-700">{workerLabel(w)}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">{count}</span>
                  </button>
                )
              })}
              <button onClick={() => setFilterAssigned(filterAssigned === 'unassigned' ? '' : 'unassigned')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${filterAssigned === 'unassigned' ? 'border-orange-400 bg-orange-50 font-semibold' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-bold">?</span>
                <span className="text-gray-700">Unassigned</span>
                <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">{totals.unassigned}</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter + bulk action bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="Search business or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-[#0F4C81]" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#0F4C81]">
            <option value="">All Status</option>
            {['new','contacted','qualified','closed_won','closed_lost'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          {(filterAssigned || filterStatus || search) && (
            <button onClick={() => { setFilterAssigned(''); setFilterStatus(''); setSearch('') }}
              className="text-xs text-gray-400 hover:text-gray-600 underline">Clear filters</button>
          )}

          {/* Bulk assign panel — appears when rows selected */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 ml-auto border-l border-gray-200 pl-4">
              <span className="text-sm font-bold text-[#0B2140]">{selected.size} selected</span>
              <select value={assignTarget} onChange={e => setAssignTarget(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#0F4C81]">
                <option value="">Choose worker...</option>
                <option value="__unassign__">— Remove assignment —</option>
                {workers.map(w => <option key={w.id} value={w.id}>{workerLabel(w)}</option>)}
              </select>
              <button onClick={bulkAssign} disabled={assigning || !assignTarget}
                className="px-4 py-1.5 bg-[#0B2140] text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-40 transition min-w-[90px]">
                {assigning ? 'Saving...' : 'Assign'}
              </button>
              {assignMsg && (
                <span className="text-sm text-green-600 font-medium">{assignMsg}</span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No leads match these filters.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                  <th className="p-3 w-10">
                    <input type="checkbox"
                      checked={selected.size === leads.length && leads.length > 0}
                      onChange={toggleAll} className="rounded cursor-pointer" />
                  </th>
                  <th className="p-3 text-left">Business</th>
                  <th className="p-3 text-left hidden md:table-cell">Industry</th>
                  <th className="p-3 text-left">Heat</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Assigned To</th>
                  <th className="p-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => (
                  <tr key={lead.id}
                    className={`transition ${selected.has(lead.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(lead.id)}
                        onChange={() => toggle(lead.id)} className="rounded cursor-pointer" />
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-gray-800">{lead.business_name}</p>
                      {lead.contact_email && (
                        <p className="text-xs text-gray-400 mt-0.5">{lead.contact_email}</p>
                      )}
                    </td>
                    <td className="p-3 text-gray-500 hidden md:table-cell">{lead.industry || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${HEAT_STYLES[lead.heat] || 'bg-gray-100 text-gray-500'}`}>
                        {lead.heat}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[lead.status] || 'bg-gray-100 text-gray-500'}`}>
                        {lead.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      {/* Inline quick-assign dropdown */}
                      <select
                        value={lead.assigned_to || ''}
                        onChange={e => quickAssign(lead.id, e.target.value)}
                        className={`text-xs rounded-lg px-2 py-1 border cursor-pointer focus:outline-none focus:border-[#0F4C81] ${
                          lead.assigned_to
                            ? 'bg-green-50 border-green-200 text-green-700 font-medium'
                            : 'bg-orange-50 border-orange-200 text-orange-600 font-medium'
                        }`}>
                        <option value="">Unassigned</option>
                        {workers.map(w => (
                          <option key={w.id} value={w.id}>{workerLabel(w)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right font-mono text-xs font-semibold text-gray-700">
                      ${Number(lead.est_value).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && leads.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
              <span>Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
              <span>{totals.unassigned} unassigned · {totals.assigned} assigned</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
