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
  const status = searchParams.get('status')

  let query = supabase
    .from('invoices')
    .select(`*, customers(name, email), invoice_line_items(*)`)
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
  const { customer_id, due_date, tax_rate = 0, notes, line_items = [] } = body

  // Calculate totals
  const subtotal = line_items.reduce((sum: number, item: { quantity: number; unit_price: number }) =>
    sum + item.quantity * item.unit_price, 0)
  const tax_amount = subtotal * (tax_rate / 100)
  const total = subtotal + tax_amount

  // Get next invoice number
  const { data: numData } = await supabase.rpc('next_invoice_number', { uid: session.user.id })
  const invoice_number = numData || `INV-${Date.now()}`

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      user_id: session.user.id,
      customer_id,
      invoice_number,
      due_date,
      tax_rate,
      tax_amount,
      subtotal,
      total,
      notes,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert line items
  if (line_items.length > 0) {
    const items = line_items.map((item: { description: string; quantity: number; unit_price: number }) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
    }))
    await supabase.from('invoice_line_items').insert(items)
  }

  return NextResponse.json(invoice, { status: 201 })
}

export async function PATCH(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
