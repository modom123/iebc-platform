import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { client_name, client_email, items, tax_rate, due_date, notes } = body

  if (!client_name || !items || items.length === 0) {
    return NextResponse.json({ error: 'client_name and items are required' }, { status: 400 })
  }

  // Generate invoice number
  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const invoiceNumber = `INV-${String((count ?? 0) + 1).padStart(4, '0')}`

  const subtotal = items.reduce((sum: number, item: { qty: number; rate: number }) =>
    sum + (item.qty * item.rate), 0)
  const taxAmount = subtotal * ((tax_rate ?? 0) / 100)
  const total_amount = subtotal + taxAmount

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      user_id: session.user.id,
      invoice_number: invoiceNumber,
      client_name,
      client_email: client_email ?? null,
      items,
      subtotal,
      tax_rate: tax_rate ?? 0,
      total_amount,
      status: 'draft',
      due_date: due_date ?? null,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
