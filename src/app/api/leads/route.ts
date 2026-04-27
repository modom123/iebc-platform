import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

async function getSessionAndRole(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { session: null, isAdmin: false }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'iebc_staff'
  return { session, isAdmin }
}

export async function GET(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { session, isAdmin } = await getSessionAndRole(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const heat = searchParams.get('heat')

  const assignedFilter = searchParams.get('assigned_to') // 'me' | uuid | 'unassigned' | ''

  let query = supabase.from('leads').select('*').order('created_at', { ascending: false })

  if (isAdmin) {
    // Admins/iebc_staff see everything unless they ask for a specific assignment
    if (assignedFilter === 'me')           query = query.eq('assigned_to', session.user.id)
    else if (assignedFilter === 'unassigned') query = query.is('assigned_to', null)
    else if (assignedFilter)               query = query.eq('assigned_to', assignedFilter)
  } else {
    // Regular workers see leads they own OR leads assigned to them
    query = query.or(`user_id.eq.${session.user.id},assigned_to.eq.${session.user.id}`)
    if (assignedFilter === 'me')           query = query.eq('assigned_to', session.user.id)
  }

  if (status) query = query.eq('status', status)
  if (heat)   query = query.eq('heat', heat)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { session } = await getSessionAndRole(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { business_name, contact_email, industry, heat, est_value, status } = body

  if (!business_name) return NextResponse.json({ error: 'business_name is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id: session.user.id,
      business_name,
      contact_email,
      industry,
      heat: heat || 'warm',
      est_value: parseFloat(est_value) || 0,
      status: status || 'new',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: Request) {
  const supabase = createServerSupabaseClient()
  const { session, isAdmin } = await getSessionAndRole(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  // Admins can update anything; workers can update leads they own or are assigned to
  let query = isAdmin
    ? supabase.from('leads').update(updates).eq('id', id).select().single()
    : supabase.from('leads').update(updates).eq('id', id)
        .or(`user_id.eq.${session.user.id},assigned_to.eq.${session.user.id}`)
        .select().single()

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const supabase = createServerSupabaseClient()
  const { session, isAdmin } = await getSessionAndRole(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  let query = supabase.from('leads').delete().eq('id', id!)
  if (!isAdmin) query = query.eq('user_id', session.user.id)

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
