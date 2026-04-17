import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

// POST — generate a portal access token for a customer
export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { customer_id, label, expires_days } = await req.json()
  if (!customer_id) return NextResponse.json({ error: 'customer_id is required' }, { status: 400 })

  // Verify customer belongs to this user
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, email')
    .eq('id', customer_id)
    .eq('user_id', session.user.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  const expires_at = expires_days
    ? new Date(Date.now() + parseInt(expires_days) * 86400000).toISOString()
    : null

  const { data, error } = await supabase
    .from('client_portal_tokens')
    .insert({
      user_id: session.user.id,
      customer_id,
      label: label || `Portal for ${customer.name}`,
      expires_at,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(session.user.id, 'portal_generate', 'client_portal_tokens', data.id, { customer_id, customer_name: customer.name }, req)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebc-platform.vercel.app'
  return NextResponse.json({
    ...data,
    portal_url: `${baseUrl}/portal/${data.token}`,
  }, { status: 201 })
}

// GET — list portal tokens for the current user
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('client_portal_tokens')
    .select(`id, token, label, expires_at, last_accessed_at, access_count, is_active, created_at, customers ( name, email )`)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebc-platform.vercel.app'
  return NextResponse.json((data || []).map(t => ({ ...t, portal_url: `${baseUrl}/portal/${t.token}` })))
}

// DELETE — revoke a portal token
export async function DELETE(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('client_portal_tokens')
    .update({ is_active: false })
    .eq('id', id!)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
