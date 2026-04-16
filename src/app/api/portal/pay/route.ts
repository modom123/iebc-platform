import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Public payment endpoint — no session required
export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  let supabase: ReturnType<typeof createServerSupabaseClient>
  try {
    supabase = createServerSupabaseClient()
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { token, invoice_id, method, amount } = await req.json()

  if (!token || !invoice_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate token
  const { data: portalToken } = await supabase
    .from('client_portal_tokens')
    .select('*, invoices(*)')
    .eq('token', token)
    .eq('invoice_id', invoice_id)
    .eq('is_active', true)
    .single()

  if (!portalToken) return NextResponse.json({ error: 'Invalid or expired payment link' }, { status: 403 })

  if (portalToken.expires_at && new Date(portalToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Payment link has expired' }, { status: 403 })
  }

  const invoice = portalToken.invoices
  if (invoice.status === 'paid') {
    return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
  }

  // In production, integrate Stripe here:
  // const paymentIntent = await stripe.paymentIntents.create({ amount: amount * 100, currency: 'usd', ... })

  // Mark invoice as paid
  const { error: updateErr } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: method,
    })
    .eq('id', invoice_id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // Log payment record
  await supabase.from('invoice_payments').insert({
    user_id: portalToken.user_id,
    invoice_id,
    amount: Number(amount),
    method,
    portal_token_id: portalToken.id,
    paid_at: new Date().toISOString(),
  })

  // Deactivate the token after use
  await supabase
    .from('client_portal_tokens')
    .update({ is_active: false })
    .eq('id', portalToken.id)

  return NextResponse.json({ success: true, message: 'Payment recorded' })
}
