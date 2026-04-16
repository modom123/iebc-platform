import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const DEFAULT_ACCOUNTS = [
  { code: '1000', name: 'Checking Account', type: 'asset', subtype: 'bank' },
  { code: '1010', name: 'Savings Account', type: 'asset', subtype: 'bank' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'receivable' },
  { code: '1200', name: 'Inventory', type: 'asset', subtype: 'inventory' },
  { code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'payable' },
  { code: '2100', name: 'Credit Card', type: 'liability', subtype: 'credit_card' },
  { code: '3000', name: 'Owner Equity', type: 'equity', subtype: 'equity' },
  { code: '3100', name: 'Retained Earnings', type: 'equity', subtype: 'equity' },
  { code: '4000', name: 'Service Revenue', type: 'revenue', subtype: 'revenue' },
  { code: '4010', name: 'Product Sales', type: 'revenue', subtype: 'revenue' },
  { code: '4020', name: 'Consulting Revenue', type: 'revenue', subtype: 'revenue' },
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', subtype: 'cogs' },
  { code: '5100', name: 'Payroll & Salaries', type: 'expense', subtype: 'payroll' },
  { code: '5200', name: 'Rent & Utilities', type: 'expense', subtype: 'facilities' },
  { code: '5300', name: 'Software & Subscriptions', type: 'expense', subtype: 'software' },
  { code: '5400', name: 'Marketing & Advertising', type: 'expense', subtype: 'marketing' },
  { code: '5500', name: 'Travel & Entertainment', type: 'expense', subtype: 'travel' },
  { code: '5600', name: 'Professional Services', type: 'expense', subtype: 'professional' },
  { code: '5700', name: 'Insurance', type: 'expense', subtype: 'insurance' },
  { code: '5800', name: 'Office Supplies', type: 'expense', subtype: 'office' },
  { code: '5900', name: 'Miscellaneous', type: 'expense', subtype: 'misc' },
]

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .order('code')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Seed default accounts if none exist
  if (!data || data.length === 0) {
    const toInsert = DEFAULT_ACCOUNTS.map(a => ({ ...a, user_id: session.user.id }))
    const { data: seeded, error: seedErr } = await supabase
      .from('accounts')
      .insert(toInsert)
      .select()
    if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 })
    return NextResponse.json(seeded)
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { code, name, type, subtype } = body

  const { data, error } = await supabase
    .from('accounts')
    .insert({ user_id: session.user.id, code, name, type, subtype })
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
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
