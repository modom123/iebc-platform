import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
const PLAN_MRR: Record<string, number> = { silver: 9, gold: 22, platinum: 42 }

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function AdminPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/auth/login')
  }
  let supabase: ReturnType<typeof createServerSupabaseClient>
  try {
    supabase = createServerSupabaseClient()
  } catch {
    redirect('/auth/login')
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/hub')

  // Use service-role client for platform-wide queries (bypasses RLS)
  const admin = getAdminClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: allUsers, count: userCount },
    { data: allSubs },
    { data: newSubs },
    { data: recentFees },
    { data: allFees },
    { data: notifications },
  ] = await Promise.all([
    admin.from('profiles').select('id, email, full_name, role, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(20),
    admin.from('subscriptions').select('plan, status, user_id, created_at, current_period_end'),
    admin.from('subscriptions').select('user_id, plan, status, created_at').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }),
    admin.from('iebc_fees').select('*').order('created_at', { ascending: false }).limit(10),
    admin.from('iebc_fees').select('iebc_fee_cents, gross_amount_cents'),
    // Notifications table — fail silently if it doesn't exist yet
    admin.from('hub_notifications').select('*').order('created_at', { ascending: false }).limit(8),
  ])

  const totalRevenue = (allFees || []).reduce((s, f) => s + f.iebc_fee_cents, 0) / 100
  const totalGross   = (allFees || []).reduce((s, f) => s + f.gross_amount_cents, 0) / 100

  const activeSubs = (allSubs || []).filter(s => ['active', 'trialing', 'past_due'].includes(s.status))
  const planCounts = { silver: 0, gold: 0, platinum: 0 }
  let platformMrr  = 0
  for (const sub of activeSubs) {
    if (sub.plan in planCounts) planCounts[sub.plan as keyof typeof planCounts]++
    platformMrr += PLAN_MRR[sub.plan] ?? 0
  }

  // Fetch profiles for new subscribers to show names
  const newSubUserIds = (newSubs || []).map(s => s.user_id).filter(Boolean)
  const { data: newSubProfiles } = newSubUserIds.length > 0
    ? await admin.from('profiles').select('id, full_name, email, business_name').in('id', newSubUserIds)
    : { data: [] }
  const newSubProfileMap: Record<string, { full_name: string | null; email: string | null; business_name: string | null }> = {}
  for (const p of newSubProfiles || []) newSubProfileMap[p.id] = p

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-[#0F4C81]">IEBC</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin/subscribers" className="bg-[#0B2140] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition">
            Subscribers →
          </Link>
          <Link href="/hub" className="text-gray-500 hover:text-[#0F4C81]">Hub</Link>
          <Link href="/accounting" className="text-gray-500 hover:text-[#0F4C81]">Accounting</Link>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">ADMIN</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Platform Overview</h1>
          {(newSubs || []).length > 0 && (
            <Link href="/admin/subscribers" className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {(newSubs || []).length} new subscriber{(newSubs || []).length !== 1 ? 's' : ''} this week
            </Link>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',        value: String(userCount || 0),   color: 'text-gray-800',   href: null },
            { label: 'Active Subscribers', value: String(activeSubs.length), color: 'text-green-600',  href: '/admin/subscribers' },
            { label: 'Platform MRR',       value: fmt(platformMrr),          color: 'text-[#0F4C81]',  href: '/admin/subscribers' },
            { label: 'Gross Volume',       value: fmt(totalGross),           color: 'text-gray-700',   href: null },
          ].map((c, i) => {
            const inner = (
              <>
                <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              </>
            )
            return c.href
              ? <Link key={i} href={c.href} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#0F4C81] hover:shadow-md transition">{inner}</Link>
              : <div   key={i}              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">{inner}</div>
          })}
        </div>

        {/* Plan breakdown — clickable, linked to filtered subscriber view */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { plan: 'Silver',   key: 'silver',   color: 'bg-gray-100 text-gray-700',     count: planCounts.silver,   mrr: planCounts.silver   * 9  },
            { plan: 'Gold',     key: 'gold',     color: 'bg-amber-50 text-amber-700',    count: planCounts.gold,     mrr: planCounts.gold     * 22 },
            { plan: 'Platinum', key: 'platinum', color: 'bg-blue-50 text-[#0F4C81]',     count: planCounts.platinum, mrr: planCounts.platinum * 42 },
          ].map(t => (
            <Link key={t.plan} href={`/admin/subscribers?plan=${t.key}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#0F4C81] hover:shadow-sm transition">
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full font-bold text-sm uppercase ${t.color}`}>{t.plan}</span>
                <span className="text-2xl font-bold text-gray-800">{t.count}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">MRR: <span className="font-semibold text-gray-700">${t.mrr}/mo</span></p>
              <p className="text-xs text-gray-400 mt-0.5">ARR: ${t.mrr * 12}/yr</p>
            </Link>
          ))}
        </div>

        {/* New subscribers this week */}
        {(newSubs || []).length > 0 && (
          <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-bold text-emerald-800">New Subscribers This Week</h2>
              </div>
              <Link href="/admin/subscribers" className="text-xs text-emerald-700 hover:underline font-medium">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(newSubs || []).map(s => {
                const p = newSubProfileMap[s.user_id]
                return (
                  <div key={s.user_id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#0B2140] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(p?.full_name ?? p?.email ?? '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{p?.full_name || '—'}</p>
                        <p className="text-xs text-gray-400 truncate">{p?.email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                        s.plan === 'gold' ? 'bg-amber-50 text-amber-700' :
                        s.plan === 'platinum' ? 'bg-blue-50 text-[#0F4C81]' :
                        'bg-gray-100 text-gray-700'
                      }`}>{s.plan}</span>
                      <span className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Notifications (hub_notifications table — shows if exists) */}
        {notifications && notifications.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Recent Notifications</h2>
              <span className="text-xs text-gray-400">{notifications.length} recent</span>
            </div>
            <div className="divide-y divide-gray-50">
              {notifications.map((n: { id: string; type: string; title: string; body: string; created_at: string; read_at: string | null }) => (
                <div key={n.id} className={`px-5 py-3.5 flex items-start gap-3 ${!n.read_at ? 'bg-blue-50/40' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    n.type === 'new_subscriber'        ? 'bg-emerald-500' :
                    n.type === 'subscription_cancelled'? 'bg-red-400' :
                    n.type === 'payment_failed'        ? 'bg-orange-400' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                  </div>
                  <span className="text-xs text-gray-300 shrink-0">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Recent Users</h2>
              <Link href="/admin/subscribers" className="text-xs text-[#0F4C81] hover:underline">View subscribers →</Link>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Joined</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {(allUsers || []).map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium">{u.full_name || '—'}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin'      ? 'bg-red-100 text-red-700' :
                        u.role === 'consultant' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{u.role}</span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Platform Fees */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Recent Platform Fees</h2>
              <span className="text-xs text-gray-500">0.76% per transaction</span>
            </div>
            {recentFees && recentFees.length > 0 ? (
              <>
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-right">Gross</th>
                    <th className="p-3 text-right">IEBC Fee</th>
                    <th className="p-3 text-left">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentFees.map(f => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-500 text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-right">{fmt(f.gross_amount_cents / 100)}</td>
                        <td className="p-3 text-right font-semibold text-green-600">{fmt(f.iebc_fee_cents / 100)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{f.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Total platform revenue</span>
                  <span className="font-bold text-green-600">{fmt(totalRevenue)}</span>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">No fees recorded yet</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
