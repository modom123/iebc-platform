import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [{ data: sub }, { data: assignments }] = await Promise.all([
    supabase.from('subscriptions').select('plan, status').eq('user_id', userId).single(),
    supabase.from('consultant_assignments').select('department').eq('user_id', userId),
  ])

  return NextResponse.json({
    plan: sub?.plan ?? null,
    status: sub?.status ?? null,
    assignments: assignments ?? [],
  })
}
