import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = req.nextUrl.searchParams.get('type')
  const userId = session.user.id

  if (type === 'employees') {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ employees: data || [] })
  }

  if (type === 'runs') {
    const { data, error } = await supabase
      .from('pay_runs')
      .select('*')
      .eq('user_id', userId)
      .order('pay_date', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ runs: data || [] })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const userId = session.user.id

  if (body.action === 'add_employee') {
    const { data, error } = await supabase.from('employees').insert({
      user_id: userId,
      name: body.name,
      email: body.email || null,
      title: body.title || null,
      pay_type: body.pay_type,
      pay_rate: body.pay_rate,
      filing_status: body.filing_status || 'single',
      allowances: body.allowances || 1,
      status: 'active',
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ employee: data })
  }

  if (body.action === 'run_payroll') {
    const { stubs, period_start, period_end, pay_date } = body
    const total_gross = stubs.reduce((s: number, r: any) => s + r.gross_pay, 0)
    const total_taxes = stubs.reduce((s: number, r: any) => s + r.federal_tax + r.state_tax + r.social_security + r.medicare, 0)
    const total_net = stubs.reduce((s: number, r: any) => s + r.net_pay, 0)

    // Insert pay run
    const { data: run, error: runErr } = await supabase.from('pay_runs').insert({
      user_id: userId,
      period_start,
      period_end,
      pay_date,
      total_gross,
      total_taxes,
      total_net,
      employee_count: stubs.length,
      status: 'processed',
    }).select().single()
    if (runErr) return NextResponse.json({ error: runErr.message }, { status: 500 })

    // Insert pay stubs
    const stubRows = stubs.map((s: any) => ({
      user_id: userId,
      pay_run_id: run.id,
      employee_id: s.employee_id,
      employee_name: s.employee_name,
      gross_pay: s.gross_pay,
      federal_tax: s.federal_tax,
      state_tax: s.state_tax,
      social_security: s.social_security,
      medicare: s.medicare,
      net_pay: s.net_pay,
      hours: s.hours || null,
    }))
    await supabase.from('pay_stubs').insert(stubRows)

    // Auto-record as expense transactions
    const txRows = stubs.map((s: any) => ({
      user_id: userId,
      date: pay_date,
      description: `Payroll — ${s.employee_name}`,
      amount: s.gross_pay,
      type: 'expense',
      category: 'Payroll',
      notes: `Pay period: ${period_start} – ${period_end}`,
    }))
    await supabase.from('transactions').insert(txRows)

    return NextResponse.json({ run })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('employees')
    .update({ status: body.status })
    .eq('id', body.id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ employee: data })
}
