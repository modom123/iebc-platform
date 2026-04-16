import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

// GET: list portal tokens for a user's invoices
export async function GET(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const invoiceId = searchParams.get('invoice_id')

  let query = supabase
    .from('client_portal_tokens')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (invoiceId) query = query.eq('invoice_id', invoiceId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tokens: data || [] })
}

// POST: generate a portal token for an invoice
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { invoice_id, expires_days = 30 } = body

  if (!invoice_id) return NextResponse.json({ error: 'invoice_id required' }, { status: 400 })

  // Verify invoice belongs to user
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', invoice_id)
    .eq('user_id', session.user.id)
    .single()

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expires_days)

  const { data, error } = await supabase.from('client_portal_tokens').insert({
    user_id: session.user.id,
    invoice_id,
    token,
    expires_at: expiresAt.toISOString(),
    is_active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ token: data })
}

// PATCH: revoke a portal token
export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, is_active } = await req.json()
  const { data, error } = await supabase
    .from('client_portal_tokens')
    .update({ is_active })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ token: data })
}
