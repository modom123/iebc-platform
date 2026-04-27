'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

const PLAN_MRR: Record<string, number> = { silver: 9, gold: 22, platinum: 42 }

const PLAN_STYLE: Record<string, string> = {
  silver:   'bg-gray-100 text-gray-700',
  gold:     'bg-amber-50 text-amber-700 border border-amber-200',
  platinum: 'bg-blue-50 text-[#0F4C81] border border-blue-200',
}

const STATUS_STYLE: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  trialing:  'bg-blue-100 text-blue-700',
  past_due:  'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-600',
}

type Subscriber = {
  user_id: string
  plan: string
  status: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_end: string | null
  created_at: string
  mrr: number
  profile: {
    full_name: string | null
    email: string | null
    phone: string | null
    business_name: string | null
    created_at: string
  } | null
}

type Totals = { count: number; active: number; mrr: number; arr: number }

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const isNew = (s: string) => Date.now() - new Date(s).getTime() < 7 * 24 * 60 * 60 * 1000

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [totals, setTotals]           = useState<Totals>({ count: 0, active: 0, mrr: 0, arr: 0 })
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [planTab, setPlanTab]         = useState('all')
  const [statusTab, setStatusTab]     = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (planTab   !== 'all') params.set('plan',   planTab)
    if (statusTab !== 'all') params.set('status', statusTab)
    if (search)              params.set('search', search)
    try {
      const res  = await fetch(`/api/admin/subscribers?${params}`)
      const data = await res.json()
      if (res.ok) { setSubscribers(data.subscribers || []); setTotals(data.totals || { count: 0, active: 0, mrr: 0, arr: 0 }) }
    } finally {
      setLoading(false)
    }
  }, [planTab, statusTab, search])

  useEffect(() => { load() }, [load])

  // CSV export
  function exportCSV() {
    const rows = [
      ['Name', 'Email', 'Business', 'Plan', 'Status', 'MRR', 'Joined', 'Renewal'],
      ...subscribers.map(s => [
        s.profile?.full_name  ?? '',
        s.profile?.email      ?? '',
        s.profile?.business_name ?? '',
        s.plan,
        s.status,
        `$${PLAN_MRR[s.plan] ?? 0}`,
        fmtDate(s.profile?.created_at ?? null),
        fmtDate(s.current_period_end),
      ]),
    ]
    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'subscribers.csv' })
    a.click(); URL.revokeObjectURL(url)
  }

  const newThisWeek = subscribers.filter(s => isNew(s.created_at)).length

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Admin</Link>
            <span className="text-gray-300">|</span>
            <h1 className="font-bold text-gray-800">Subscribers</h1>
            {newThisWeek > 0 && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                +{newThisWeek} this week
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">ADMIN</span>
            <button onClick={exportCSV} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-medium transition">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Subscribers', value: String(totals.count),   color: 'text-gray-800'   },
            { label: 'Active / Trialing',  value: String(totals.active),  color: 'text-green-600'  },
            { label: 'MRR',               value: fmt(totals.mrr),        color: 'text-[#0F4C81]'  },
            { label: 'ARR',               value: fmt(totals.arr),        color: 'text-purple-600' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
              <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Plan breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {(['silver', 'gold', 'platinum'] as const).map(plan => {
            const count   = subscribers.filter(s => s.plan === plan).length
            const planMrr = count * PLAN_MRR[plan]
            return (
              <button key={plan} onClick={() => setPlanTab(planTab === plan ? 'all' : plan)}
                className={`bg-white rounded-xl border p-4 text-left transition hover:shadow-sm ${planTab === plan ? 'border-[#0F4C81] ring-2 ring-[#0F4C81]/20' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${PLAN_STYLE[plan]}`}>{plan}</span>
                  <span className="text-xl font-extrabold text-gray-800">{count}</span>
                </div>
                <p className="text-xs text-gray-400">MRR: <span className="font-semibold text-gray-600">${planMrr}/mo</span></p>
                <p className="text-xs text-gray-400">ARR: <span className="font-semibold text-gray-600">${planMrr * 12}/yr</span></p>
              </button>
            )
          })}
        </div>

        {/* Filters + search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status tabs */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            {['all', 'active', 'trialing', 'past_due', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusTab(s)}
                className={`px-3 py-1.5 text-xs font-semibold transition ${statusTab === s ? 'bg-[#0B2140] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, business…"
            className="flex-1 min-w-[200px] text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2140]/20"
          />
          {(planTab !== 'all' || statusTab !== 'all' || search) && (
            <button onClick={() => { setPlanTab('all'); setStatusTab('all'); setSearch('') }}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading subscribers…</div>
          ) : subscribers.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 text-sm">No subscribers found.</p>
              {(planTab !== 'all' || statusTab !== 'all' || search) && (
                <button onClick={() => { setPlanTab('all'); setStatusTab('all'); setSearch('') }}
                  className="mt-2 text-xs text-[#0F4C81] hover:underline">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-semibold">Subscriber</th>
                    <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Business</th>
                    <th className="px-5 py-3 text-left font-semibold">Plan</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">MRR</th>
                    <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Joined</th>
                    <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Renews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subscribers.map(s => (
                    <tr key={s.user_id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0B2140] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(s.profile?.full_name ?? s.profile?.email ?? '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-gray-800 truncate">{s.profile?.full_name || '—'}</p>
                              {isNew(s.created_at) && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold shrink-0">NEW</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{s.profile?.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-gray-600 text-sm">{s.profile?.business_name || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${PLAN_STYLE[s.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                          {s.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {s.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-mono font-semibold text-green-700">${s.mrr}/mo</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-gray-400 text-xs">
                        {fmtDate(s.profile?.created_at ?? null)}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-gray-400 text-xs">
                        {fmtDate(s.current_period_end)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-100 flex justify-between text-xs text-gray-400 bg-gray-50">
                <span>{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</span>
                <span>MRR: <strong className="text-gray-700">{fmt(totals.mrr)}</strong> · ARR: <strong className="text-gray-700">{fmt(totals.arr)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
