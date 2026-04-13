import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, purchase_order_lines(*)')
    .eq('user_id', session.user.id)
    .order('order_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const pos = (data || []).map(po => ({
    ...po,
    items: po.purchase_order_lines || [],
  }))

  return NextResponse.json({ pos })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const userId = session.user.id

  const { count } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  const poNumber = `PO-${String((count || 0) + 1).padStart(4, '0')}`

  const { data: po, error: poErr } = await supabase.from('purchase_orders').insert({
    user_id: userId,
    po_number: poNumber,
    vendor_id: body.vendor_id || null,
    vendor_name: body.vendor_name,
    order_date: body.order_date,
    expected_date: body.expected_date || null,
    subtotal: body.subtotal || 0,
    tax_rate: Number(body.tax_rate) || 0,
    tax_amount: body.tax_amount || 0,
    total: body.total || 0,
    notes: body.notes || null,
    status: 'draft',
  }).select().single()

  if (poErr) return NextResponse.json({ error: poErr.message }, { status: 500 })

  const lineRows = (body.items || [])
    .filter((i: any) => i.description)
    .map((i: any) => ({
      purchase_order_id: po.id,
      user_id: userId,
      description: i.description,
      qty: Number(i.qty) || 1,
      unit: i.unit || 'each',
      unit_price: Number(i.unit_price) || 0,
      total: Number(i.total) || 0,
    }))

  if (lineRows.length > 0) {
    await supabase.from('purchase_order_lines').insert(lineRows)
  }

  return NextResponse.json({ po })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...updates } = await req.json()
  const { data, error } = await supabase
    .from('purchase_orders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ po: data })
}
