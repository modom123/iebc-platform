import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('estimates')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { client_name, client_email, items, tax_rate, valid_until, notes } = body

  if (!client_name || !items || items.length === 0) {
    return NextResponse.json({ error: 'client_name and items are required' }, { status: 400 })
  }

  const { count } = await supabase
    .from('estimates')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const estimateNumber = `EST-${String((count ?? 0) + 1).padStart(4, '0')}`
  const subtotal = items.reduce((s: number, i: { qty: number; rate: number }) => s + i.qty * i.rate, 0)
  const taxAmount = subtotal * ((tax_rate ?? 0) / 100)
  const total = subtotal + taxAmount

  const { data, error } = await supabase
    .from('estimates')
    .insert({
      user_id: session.user.id,
      estimate_number: estimateNumber,
      client_name,
      client_email: client_email ?? null,
      items,
      subtotal,
      tax_rate: tax_rate ?? 0,
      tax_amount: taxAmount,
      total,
      status: 'draft',
      valid_until: valid_until ?? null,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('estimates')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Convert estimate to invoice
export async function PUT(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  const { data: est, error: estError } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (estError || !est) return NextResponse.json({ error: 'Estimate not found' }, { status: 404 })

  // Generate invoice number
  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const invoiceNumber = `INV-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .insert({
      user_id: session.user.id,
      invoice_number: invoiceNumber,
      client_name: est.client_name,
      client_email: est.client_email,
      items: est.items,
      subtotal: est.subtotal,
      tax_rate: est.tax_rate,
      tax_amount: est.tax_amount,
      total: est.total,
      status: 'draft',
      notes: est.notes,
    })
    .select()
    .single()

  if (invError) return NextResponse.json({ error: invError.message }, { status: 500 })

  // Mark estimate as accepted/converted
  await supabase.from('estimates').update({ status: 'accepted', converted_invoice_id: invoice.id }).eq('id', id)

  return NextResponse.json({ invoice })
}

export async function DELETE(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('id', id!)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
