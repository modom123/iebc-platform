import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', session.user.id)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const userId = session.user.id

  // Auto-generate SKU if not provided
  let sku = body.sku
  if (!sku) {
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    sku = `SKU-${String((count || 0) + 1).padStart(4, '0')}`
  }

  const { data, error } = await supabase.from('inventory_items').insert({
    user_id: userId,
    sku,
    name: body.name,
    description: body.description || '',
    category: body.category || 'Supplies',
    unit: body.unit || 'each',
    cost_price: Number(body.cost_price) || 0,
    sale_price: Number(body.sale_price) || 0,
    qty_on_hand: Number(body.qty_on_hand) || 0,
    reorder_point: Number(body.reorder_point) || 5,
    reorder_qty: Number(body.reorder_qty) || 20,
    is_active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, adjust_note, ...updates } = await req.json()

  // Log adjustment if qty changed
  if (updates.qty_on_hand !== undefined && adjust_note) {
    await supabase.from('inventory_adjustments').insert({
      user_id: session.user.id,
      inventory_item_id: id,
      note: adjust_note,
      qty_change: updates.qty_on_hand,
    })
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}
