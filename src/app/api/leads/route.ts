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
  const heat = searchParams.get('heat')

  let query = supabase
    .from('leads')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (heat) query = query.eq('heat', heat)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { business_name, contact_email, industry, heat, est_value, status } = body

  if (!business_name) return NextResponse.json({ error: 'business_name is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id: session.user.id,
      business_name,
      contact_email,
      industry,
      heat: heat || 'warm',
      est_value: parseFloat(est_value) || 0,
      status: status || 'new',
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
    .from('leads')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id!)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
