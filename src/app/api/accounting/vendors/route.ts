import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const vendorId = req.nextUrl.searchParams.get('vendor_id')
  const type = req.nextUrl.searchParams.get('type')

  if (vendorId && type === 'bills') {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('vendor_id', vendorId)
      .order('due_date', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bills: data || [] })
  }

  // Get vendors with total paid (sum of paid bills)
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*, bills(amount, status)')
    .eq('user_id', userId)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Calculate total_paid per vendor
  const enriched = (vendors || []).map(v => {
    const bills = (v.bills || []) as Array<{ amount: number; status: string }>
    const total_paid = bills
      .filter((b) => b.status === 'paid')
      .reduce((s, b) => s + Number(b.amount), 0)
    const { bills: _bills, ...rest } = v
    return { ...rest, total_paid }
  })

  return NextResponse.json({ vendors: enriched })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('vendors').insert({
    user_id: session.user.id,
    name: body.name,
    contact_name: body.contact_name || null,
    email: body.email || null,
    phone: body.phone || null,
    address: body.address || null,
    tin: body.tin || null,
    vendor_type: body.vendor_type || 'vendor',
    is_1099: body.is_1099 || false,
    notes: body.notes || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vendor: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body
  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vendor: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
