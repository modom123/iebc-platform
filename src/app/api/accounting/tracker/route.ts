import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// IRS standard mileage rate 2024
const IRS_MILEAGE_RATE = 0.67

export async function GET(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const table = searchParams.get('table') || 'mileage'

  const { data, error } = await supabase
    .from(table === 'time' ? 'time_entries' : 'mileage_log')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, irs_rate: IRS_MILEAGE_RATE })
}

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { table, ...fields } = body

  if (table === 'time') {
    const { data, error } = await supabase
      .from('time_entries')
      .insert({ user_id: session.user.id, ...fields })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  // Mileage: compute deduction
  const miles = parseFloat(fields.miles || 0)
  const deduction = parseFloat((miles * IRS_MILEAGE_RATE).toFixed(2))

  const { data, error } = await supabase
    .from('mileage_log')
    .insert({ user_id: session.user.id, ...fields, miles, deduction_amount: deduction })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const table = searchParams.get('table') || 'mileage'

  const { error } = await supabase
    .from(table === 'time' ? 'time_entries' : 'mileage_log')
    .delete()
    .eq('id', id!)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
