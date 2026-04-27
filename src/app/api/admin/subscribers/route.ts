import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const PLAN_MRR: Record<string, number> = { silver: 9, gold: 22, platinum: 42 }

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: Request) {
  // Verify caller is an admin
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch {
    return NextResponse.json({ error: 'Auth error' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const planFilter   = searchParams.get('plan')   || ''
  const statusFilter = searchParams.get('status') || ''
  const search       = searchParams.get('search') || ''

  const admin = getAdminClient()

  // Fetch all subscriptions (service role bypasses RLS — sees every row)
  let query = admin.from('subscriptions').select('*').order('created_at', { ascending: false })
  if (planFilter)   query = query.eq('plan', planFilter)
  if (statusFilter) query = query.eq('status', statusFilter)

  const { data: subs, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!subs || subs.length === 0) return NextResponse.json({ subscribers: [], totals: { count: 0, mrr: 0, arr: 0 } })

  // Bulk-fetch matching profiles
  const userIds = [...new Set(subs.map(s => s.user_id).filter(Boolean))]
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email, phone, business_name, created_at')
    .in('id', userIds)

  const profileMap: Record<string, { id: string; full_name: string | null; email: string | null; phone: string | null; business_name: string | null; created_at: string }> = {}
  for (const p of profiles || []) profileMap[p.id] = p

  let subscribers = subs.map(s => ({
    ...s,
    mrr: PLAN_MRR[s.plan] ?? 0,
    profile: profileMap[s.user_id] ?? null,
  }))

  // Cross-table search applied in JS
  if (search) {
    const q = search.toLowerCase()
    subscribers = subscribers.filter(s =>
      s.profile?.full_name?.toLowerCase().includes(q) ||
      s.profile?.email?.toLowerCase().includes(q) ||
      s.profile?.business_name?.toLowerCase().includes(q)
    )
  }

  const activeSubs = subscribers.filter(s => ['active', 'trialing', 'past_due'].includes(s.status))
  const mrr = activeSubs.reduce((sum, s) => sum + s.mrr, 0)

  return NextResponse.json({
    subscribers,
    totals: {
      count: subscribers.length,
      active: activeSubs.length,
      mrr,
      arr: mrr * 12,
    },
  })
}
