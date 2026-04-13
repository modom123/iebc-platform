'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type AuditLog = {
  id: string
  action: string
  resource_type: string
  resource_id: string
  changes: Record<string, unknown> | null
  ip_address: string
  user_agent: string
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  export: 'bg-purple-100 text-purple-700',
  import: 'bg-indigo-100 text-indigo-700',
  sync: 'bg-teal-100 text-teal-700',
  bank_connect: 'bg-emerald-100 text-emerald-700',
  bank_disconnect: 'bg-orange-100 text-orange-700',
  login: 'bg-gray-100 text-gray-600',
  portal_view: 'bg-yellow-100 text-yellow-700',
  invoice_paid: 'bg-green-100 text-green-700',
  payment_received: 'bg-green-100 text-green-700',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')
  const [filterResource, setFilterResource] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterAction) params.set('action', filterAction)
    if (filterResource) params.set('resource', filterResource)
    params.set('limit', '200')
    const res = await fetch(`/api/accounting/audit?${params}`)
    const data = await res.json()
    setLogs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterAction, filterResource])

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)))
  const uniqueResources = Array.from(new Set(logs.map(l => l.resource_type)))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Audit Trail</h1>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{logs.length} events</span>
        </div>
        <a href="/api/accounting/audit?limit=1000" className="btn-secondary text-sm py-2">Export Log</a>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-4">

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterResource} onChange={e => setFilterResource(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Resources</option>
            {uniqueResources.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {(filterAction || filterResource) && (
            <button onClick={() => { setFilterAction(''); setFilterResource('') }} className="text-sm text-gray-400 hover:text-gray-600 px-2">Clear filters</button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500">No audit events recorded yet.</p>
            <p className="text-gray-400 text-sm mt-1">Events are logged automatically as you use the platform.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Resource</th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">IP</th>
                  <th className="p-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700 font-medium">{log.resource_type}</td>
                      <td className="p-3 font-mono text-xs text-gray-400">{log.resource_id ? log.resource_id.slice(0, 8) + '…' : '—'}</td>
                      <td className="p-3 font-mono text-xs text-gray-400">{log.ip_address || '—'}</td>
                      <td className="p-3">
                        {log.changes ? (
                          <button
                            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                            className="text-xs text-[#0F4C81] hover:underline"
                          >
                            {expanded === log.id ? 'Hide' : 'View'}
                          </button>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </tr>
                    {expanded === log.id && log.changes && (
                      <tr key={log.id + '-detail'}>
                        <td colSpan={6} className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
