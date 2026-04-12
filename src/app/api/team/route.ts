import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET — list team members for the authenticated owner
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — invite a new team member by email
export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { invited_email, role } = body

  if (!invited_email) return NextResponse.json({ error: 'invited_email is required' }, { status: 400 })

  // Check subscription tier for seat limits
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', session.user.id)
    .single()

  const maxSeats: Record<string, number> = { silver: 1, gold: 5, platinum: 10 }
  const limit = sub?.plan ? (maxSeats[sub.plan] ?? 1) : 1

  const { count } = await supabase
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', session.user.id)
    .neq('status', 'revoked')

  if ((count ?? 0) >= limit - 1) {
    return NextResponse.json(
      { error: `Your ${sub?.plan ?? 'Silver'} plan supports ${limit} user${limit > 1 ? 's' : ''} total (including you). Upgrade to add more.` },
      { status: 403 }
    )
  }

  // Look up if the invited user already has an account
  const { data: invitedProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', invited_email.toLowerCase())
    .single()

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      owner_id: session.user.id,
      member_id: invitedProfile?.id ?? null,
      invited_email: invited_email.toLowerCase(),
      role: role || 'viewer',
      status: invitedProfile ? 'active' : 'pending',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This email is already on your team.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

// PATCH — update a team member's role
export async function PATCH(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, role } = await req.json()
  if (!id || !role) return NextResponse.json({ error: 'id and role required' }, { status: 400 })

  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', id)
    .eq('owner_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — remove a team member (set status to revoked)
export async function DELETE(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)
    .eq('owner_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
