import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

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

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/hub')

  const [
    { data: allUsers, count: userCount },
    { data: allSubs },
    { data: recentFees },
    { data: allFees },
  ] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, role, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(20),
    supabase.from('subscriptions').select('plan, status').eq('status', 'active'),
    supabase.from('iebc_fees').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('iebc_fees').select('iebc_fee_cents, gross_amount_cents'),
  ])

  const totalRevenue = (allFees || []).reduce((s, f) => s + f.iebc_fee_cents, 0) / 100
  const totalGross = (allFees || []).reduce((s, f) => s + f.gross_amount_cents, 0) / 100
  const planCounts = { silver: 0, gold: 0, platinum: 0 }
  for (const sub of allSubs || []) {
    if (sub.plan in planCounts) planCounts[sub.plan as keyof typeof planCounts]++
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-[#0F4C81]">IEBC</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Admin Panel</span>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/hub" className="text-gray-500 hover:text-[#0F4C81]">Hub</Link>
          <Link href="/accounting" className="text-gray-500 hover:text-[#0F4C81]">Accounting</Link>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">ADMIN</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Platform Overview</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: String(userCount || 0), color: 'text-gray-800' },
            { label: 'Active Subscribers', value: String((allSubs || []).length), color: 'text-green-600' },
            { label: 'Platform Revenue', value: fmt(totalRevenue), color: 'text-[#0F4C81]' },
            { label: 'Gross Volume', value: fmt(totalGross), color: 'text-gray-700' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Subscription Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { plan: 'Silver', count: planCounts.silver, color: 'bg-gray-100 text-gray-700', mrr: planCounts.silver * 9 },
            { plan: 'Gold', count: planCounts.gold, color: 'bg-yellow-100 text-yellow-700', mrr: planCounts.gold * 22 },
            { plan: 'Platinum', count: planCounts.platinum, color: 'bg-blue-100 text-[#0F4C81]', mrr: planCounts.platinum * 42 },
          ].map(t => (
            <div key={t.plan} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full font-bold text-sm uppercase ${t.color}`}>{t.plan}</span>
                <span className="text-2xl font-bold text-gray-800">{t.count}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">MRR: <span className="font-semibold text-gray-700">${t.mrr}/mo</span></p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Recent Users</h2>
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
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
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
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Recent Platform Fees</h2>
            </div>
            {recentFees && recentFees.length > 0 ? (
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
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">No fees recorded yet</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
