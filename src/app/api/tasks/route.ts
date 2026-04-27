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
  const status      = searchParams.get('status')
  const priority    = searchParams.get('priority')
  const assignedTo  = searchParams.get('assigned_to') // 'me' | uuid
  const withWorkers = searchParams.get('workers') === 'true'

  let query = supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false })

  if (isAdmin) {
    // Admins see all tasks; optional filter by assignee
    if (assignedTo === 'me')    query = query.eq('assigned_to', session.user.id)
    else if (assignedTo)        query = query.eq('assigned_to', assignedTo)
  } else {
    // Workers see tasks they created OR are assigned to
    query = query.or(`user_id.eq.${session.user.id},assigned_to.eq.${session.user.id}`)
    if (assignedTo === 'me')    query = query.eq('assigned_to', session.user.id)
  }

  if (status)   query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)

  const { data: tasks, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Optionally return workers list for the assignment dropdown
  if (withWorkers && isAdmin) {
    const { data: workers } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['admin', 'iebc_staff', 'consultant'])
      .order('full_name')
    return NextResponse.json({ tasks: tasks || [], workers: workers || [] })
  }

  return NextResponse.json({ tasks: tasks || [], workers: [] })
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { session } = await getSessionAndRole(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, priority, due_date, assigned_to } = body

  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id:     session.user.id,
      title,
      description: description || null,
      priority:    priority || 'medium',
      due_date:    due_date || null,
      assigned_to: assigned_to || null,
      status:      'todo',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { session, isAdmin } = await getSessionAndRole(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  let query = isAdmin
    ? supabase.from('tasks').update(updates).eq('id', id).select().single()
    : supabase.from('tasks').update(updates).eq('id', id)
        .or(`user_id.eq.${session.user.id},assigned_to.eq.${session.user.id}`)
        .select().single()

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { session, isAdmin } = await getSessionAndRole(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  let query = isAdmin
    ? supabase.from('tasks').delete().eq('id', id!)
    : supabase.from('tasks').delete().eq('id', id!).eq('user_id', session.user.id)

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
