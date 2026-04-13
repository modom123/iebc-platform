import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

// GET — validate a portal token and return client data (public, no auth required)
export async function GET(req: Request) {
  const supabase = createServerSupabaseClient()
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  // Find the token
  const { data: portalToken, error } = await supabase
    .from('client_portal_tokens')
    .select(`
      id, user_id, customer_id, label, expires_at, is_active, access_count,
      customers ( id, name, email, phone, address )
    `)
    .eq('token', token)
    .eq('is_active', true)
    .single()

  if (error || !portalToken) return NextResponse.json({ error: 'Invalid or expired portal link' }, { status: 404 })
  if (portalToken.expires_at && new Date(portalToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This portal link has expired' }, { status: 410 })
  }

  // Fetch invoices for this customer
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, amount_paid, due_date, created_at, notes')
    .eq('user_id', portalToken.user_id)
    .eq('customer_id', portalToken.customer_id)
    .order('created_at', { ascending: false })

  // Fetch company info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, notification_email')
    .eq('id', portalToken.user_id)
    .single()

  // Update access count
  await supabase
    .from('client_portal_tokens')
    .update({ access_count: (portalToken.access_count || 0) + 1, last_accessed_at: new Date().toISOString() })
    .eq('id', portalToken.id)

  await logAudit(portalToken.user_id, 'portal_view', 'client_portal_tokens', portalToken.id, { token_id: portalToken.id })

  return NextResponse.json({
    customer: portalToken.customers,
    invoices: invoices || [],
    company: profile || null,
    label: portalToken.label,
  })
}
