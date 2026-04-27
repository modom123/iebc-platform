import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const fmt      = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })
const fmtShort = (n: number) => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return '$' + (n / 1_000).toFixed(1) + 'K'
  return fmt(n)
}

const PLAN_MRR: Record<string, number> = { silver: 9, gold: 22, platinum: 42 }

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export const dynamic = 'force-dynamic'

export default async function RevenuePage() {
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

  const userId = session.user.id
  const now    = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  // Per-user financial data (RLS-scoped — user sees their own)
  const [
    { data: profile },
    { data: incomeAll },
    { data: expensesAll },
    { data: incomeMonth },
    { data: invoices },
    { data: userSub },
  ] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', userId).single(),
    supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'income'),
    supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'expense'),
    supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'income').gte('date', firstOfMonth),
    supabase.from('invoices').select('status, total, amount_paid').eq('user_id', userId).neq('status', 'void'),
    supabase.from('subscriptions').select('plan, status').eq('user_id', userId).single(),
  ])

  const isAdmin = profile?.role === 'admin'

  const totalIncome   = (incomeAll   || []).reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = (expensesAll || []).reduce((s, t) => s + Number(t.amount), 0)
  const monthIncome   = (incomeMonth || []).reduce((s, t) => s + Number(t.amount), 0)
  const outstanding   = (invoices || []).filter(i => i.status !== 'paid').reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0)
  const invoiceCount  = (invoices || []).length

  // Platform-wide subscriber MRR — only available via service role (admins only)
  let platformMrr     = 0
  let platformArr     = 0
  let planCounts      = { silver: 0, gold: 0, platinum: 0 }
  let totalSubCount   = 0

  if (isAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = getAdminClient()
    const { data: allSubs } = await admin
      .from('subscriptions')
      .select('plan, status')
      .in('status', ['active', 'trialing', 'past_due'])

    for (const s of allSubs || []) {
      platformMrr += PLAN_MRR[s.plan] ?? 0
      totalSubCount++
      if (s.plan in planCounts) planCounts[s.plan as keyof typeof planCounts]++
    }
    platformArr = platformMrr * 12
  }

  // User's own plan MRR (for non-admin: show their subscription cost)
  const userMrr = PLAN_MRR[userSub?.plan ?? ''] ?? 0

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Revenue & MRR</h1>
          {isAdmin && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">ADMIN VIEW</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin/subscribers" className="text-xs bg-[#0B2140] text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90 transition">
              Subscriber CRM →
            </Link>
          )}
          <Link href="/accounting/reports" className="text-sm text-[#0F4C81] hover:underline">Full Reports →</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Admin: Platform-wide subscriber MRR */}
        {isAdmin && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Platform Subscribers (All Users)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Subscribers', value: String(totalSubCount),  color: 'text-gray-800'   },
                { label: 'Platform MRR',       value: fmtShort(platformMrr), color: 'text-[#0F4C81]'  },
                { label: 'Platform ARR',       value: fmtShort(platformArr), color: 'text-purple-600' },
                { label: 'Silver / Gold / Plat',
                  value: `${planCounts.silver} / ${planCounts.gold} / ${planCounts.platinum}`,
                  color: 'text-gray-700' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
                  <p className={`text-xl font-extrabold ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User's own financial metrics */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Financials</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'MRR',             value: fmt(userMrr),                 sub: userSub?.plan ? `${userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1)} plan` : 'No active plan', color: 'text-green-600' },
              { label: 'ARR',             value: fmt(userMrr * 12),            sub: 'Annual run rate',     color: 'text-blue-600' },
              { label: 'Total Income',    value: fmt(totalIncome),             sub: 'All time',            color: 'text-gray-800' },
              { label: 'Total Expenses',  value: fmt(totalExpenses),           sub: 'All time',            color: 'text-red-600'  },
              { label: 'Net Profit',      value: fmt(totalIncome - totalExpenses), sub: 'Income minus expenses', color: totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600' },
              { label: 'Outstanding A/R', value: fmt(outstanding),             sub: `Across ${invoiceCount} invoices`, color: 'text-yellow-600' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
                <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-700 mb-4">Quick Actions</p>
            <div className="space-y-2">
              {[
                { href: '/accounting/invoices',      label: 'View & send invoices',      icon: '▤' },
                { href: '/accounting/transactions',  label: 'Log income / expenses',     icon: '⇄' },
                { href: '/accounting/reports',       label: 'P&L and financial reports', icon: '▦' },
                { href: '/accounting/forecast',      label: 'Cash flow forecast',        icon: '▲' },
                { href: '/accounting/tax',           label: 'Tax center & estimates',    icon: '◈' },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-[#0F4C81] text-gray-600 text-sm transition">
                  <span className="text-base w-5 text-center text-gray-400">{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-700 mb-4">Efficient Plans</p>
            <div className="space-y-3">
              {[
                { plan: 'Silver',   price: '$9/mo',  mrr: 9,  color: 'bg-slate-100 text-slate-600',              current: userSub?.plan === 'silver' },
                { plan: 'Gold',     price: '$22/mo', mrr: 22, color: 'bg-amber-50 text-amber-700 border border-amber-200', current: userSub?.plan === 'gold' },
                { plan: 'Platinum', price: '$42/mo', mrr: 42, color: 'bg-blue-50 text-blue-700 border border-blue-200',   current: userSub?.plan === 'platinum' },
              ].map(p => (
                <div key={p.plan} className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${p.current ? 'bg-[#0B2140]/5 border border-[#0B2140]/20' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${p.color}`}>{p.plan}</span>
                    {p.current && <span className="text-xs text-[#0B2140] font-semibold">← Your plan</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-700">{p.price}</span>
                    {isAdmin && (
                      <p className="text-xs text-gray-400">{planCounts[p.plan.toLowerCase() as keyof typeof planCounts]} subscribers</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {userSub?.plan !== 'platinum' && (
              <Link href="/accounting/checkout" className="block text-center mt-4 text-xs text-[#0F4C81] hover:underline font-medium">
                Upgrade plan →
              </Link>
            )}
          </div>
        </div>

        {/* This month summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 mb-3">This Month</p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Income</p>
              <p className="text-xl font-bold text-green-600">{fmtShort(monthIncome)}</p>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Net Change</p>
              <p className={`text-xl font-bold ${monthIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {fmtShort(monthIncome)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
