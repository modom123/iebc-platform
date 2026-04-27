import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const invoice_id = searchParams.get('invoice_id')
  if (!invoice_id) return NextResponse.json({ error: 'invoice_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('invoice_payments')
    .select('*')
    .eq('invoice_id', invoice_id)
    .eq('user_id', session.user.id)
    .order('paid_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { invoice_id, amount, method, paid_at } = body

  if (!invoice_id || !amount) {
    return NextResponse.json({ error: 'invoice_id and amount are required' }, { status: 400 })
  }

  // Fetch current invoice totals
  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .select('total, amount_paid, status')
    .eq('id', invoice_id)
    .eq('user_id', session.user.id)
    .single()

  if (invErr || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (invoice.status === 'void') return NextResponse.json({ error: 'Cannot record payment on a voided invoice' }, { status: 400 })

  // Insert payment record
  const { data: payment, error: payErr } = await supabase
    .from('invoice_payments')
    .insert({
      user_id: session.user.id,
      invoice_id,
      amount: Number(amount),
      method: method || 'other',
      paid_at: paid_at ? new Date(paid_at).toISOString() : new Date().toISOString(),
    })
    .select()
    .single()

  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 })

  // Update invoice amount_paid and status
  const newAmountPaid = Number(invoice.amount_paid) + Number(amount)
  const newStatus = newAmountPaid >= Number(invoice.total) ? 'paid' : 'sent'

  await supabase
    .from('invoices')
    .update({ amount_paid: newAmountPaid, status: newStatus })
    .eq('id', invoice_id)
    .eq('user_id', session.user.id)

  return NextResponse.json(payment, { status: 201 })
}

export async function DELETE(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Get payment to reverse amount_paid
  const { data: payment } = await supabase
    .from('invoice_payments')
    .select('invoice_id, amount')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (payment) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('total, amount_paid')
      .eq('id', payment.invoice_id)
      .single()

    if (invoice) {
      const newAmountPaid = Math.max(0, Number(invoice.amount_paid) - Number(payment.amount))
      const newStatus = newAmountPaid >= Number(invoice.total) ? 'paid' : newAmountPaid > 0 ? 'sent' : 'sent'
      await supabase
        .from('invoices')
        .update({ amount_paid: newAmountPaid, status: newStatus })
        .eq('id', payment.invoice_id)
    }
  }

  const { error } = await supabase
    .from('invoice_payments')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
