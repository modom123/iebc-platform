import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',')
  const body = rows.map(r =>
    columns.map(col => {
      const val = r[col] ?? ''
      const str = String(val).replace(/"/g, '""')
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
    }).join(',')
  ).join('\n')
  return header + '\n' + body
}

export async function GET(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'transactions'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let csv = ''
  let filename = ''

  if (type === 'transactions') {
    let query = supabase
      .from('transactions')
      .select('date,description,type,category,vendor,amount,reference')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })

    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    csv = toCSV(data as Record<string, unknown>[], ['date', 'description', 'type', 'category', 'vendor', 'amount', 'reference'])
    filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`
  }

  else if (type === 'invoices') {
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number,status,issue_date,due_date,subtotal,tax_amount,total,amount_paid,customers(name,email)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const rows = (data || []).map(inv => ({
      invoice_number: inv.invoice_number,
      status: inv.status,
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      customer_name: (inv.customers as unknown as { name: string; email: string } | null)?.name || '',
      customer_email: (inv.customers as unknown as { name: string; email: string } | null)?.email || '',
      subtotal: inv.subtotal,
      tax_amount: inv.tax_amount,
      total: inv.total,
      amount_paid: inv.amount_paid,
    }))
    csv = toCSV(rows, ['invoice_number', 'status', 'issue_date', 'due_date', 'customer_name', 'customer_email', 'subtotal', 'tax_amount', 'total', 'amount_paid'])
    filename = `invoices-${new Date().toISOString().split('T')[0]}.csv`
  }

  else if (type === 'leads') {
    const { data, error } = await supabase
      .from('leads')
      .select('business_name,contact_email,industry,heat,status,est_value,created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    csv = toCSV(data as Record<string, unknown>[], ['business_name', 'contact_email', 'industry', 'heat', 'status', 'est_value', 'created_at'])
    filename = `leads-${new Date().toISOString().split('T')[0]}.csv`
  }

  else if (type === 'customers') {
    const { data, error } = await supabase
      .from('customers')
      .select('name,email,phone,address,created_at')
      .eq('user_id', session.user.id)
      .order('name')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    csv = toCSV(data as Record<string, unknown>[], ['name', 'email', 'phone', 'address', 'created_at'])
    filename = `customers-${new Date().toISOString().split('T')[0]}.csv`
  }

  else {
    return NextResponse.json({ error: 'Invalid type. Use: transactions, invoices, leads, customers' }, { status: 400 })
  }

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
