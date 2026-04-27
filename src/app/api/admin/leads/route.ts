import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verifyAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (profile?.role !== 'admin') return null
    return session
  } catch { return null }
}

// GET: all leads with assignee name enrichment + worker list
export async function GET(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const assignedFilter = searchParams.get('assigned_to') // 'unassigned' | uuid | ''
  const statusFilter   = searchParams.get('status') || ''
  const search         = searchParams.get('search') || ''

  const admin = getAdminClient()

  let query = admin.from('leads').select('*').order('created_at', { ascending: false })
  if (assignedFilter === 'unassigned') query = query.is('assigned_to', null)
  else if (assignedFilter)             query = query.eq('assigned_to', assignedFilter)
  if (statusFilter) query = query.eq('status', statusFilter)

  const { data: leads, error: leadsErr } = await query
  if (leadsErr) return NextResponse.json({ error: leadsErr.message }, { status: 500 })

  // Workers = admin + iebc_staff roles
  const { data: workers } = await admin
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['admin', 'iebc_staff'])
    .order('full_name')

  // Cross-field search in JS
  let result = leads || []
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(l =>
      l.business_name?.toLowerCase().includes(q) ||
      l.contact_email?.toLowerCase().includes(q)
    )
  }

  // Build name lookup
  const workerMap: Record<string, string> = {}
  for (const w of workers || []) workerMap[w.id] = w.full_name || w.email || w.id

  const enriched = result.map(l => ({
    ...l,
    assigned_to_name: l.assigned_to ? (workerMap[l.assigned_to] ?? 'Unknown') : null,
  }))

  return NextResponse.json({
    leads: enriched,
    workers: workers || [],
    totals: {
      total:       result.length,
      unassigned:  result.filter(l => !l.assigned_to).length,
      assigned:    result.filter(l =>  !!l.assigned_to).length,
    },
  })
}

// PATCH: bulk assign / unassign leads
export async function PATCH(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json() as { lead_ids: string[]; assigned_to: string | null }
  if (!Array.isArray(body.lead_ids) || body.lead_ids.length === 0) {
    return NextResponse.json({ error: 'lead_ids array required' }, { status: 400 })
  }

  const admin = getAdminClient()
  const { error } = await admin
    .from('leads')
    .update({ assigned_to: body.assigned_to ?? null })
    .in('id', body.lead_ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ updated: body.lead_ids.length })
}
