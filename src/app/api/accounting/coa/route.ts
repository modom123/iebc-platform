import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const DEFAULT_ACCOUNTS = [
  { code: '1000', name: 'Cash and Cash Equivalents', account_type: 'Asset', sub_type: 'Current Asset' },
  { code: '1100', name: 'Accounts Receivable', account_type: 'Asset', sub_type: 'Current Asset' },
  { code: '1200', name: 'Inventory', account_type: 'Asset', sub_type: 'Current Asset' },
  { code: '1300', name: 'Prepaid Expenses', account_type: 'Asset', sub_type: 'Current Asset' },
  { code: '1500', name: 'Equipment', account_type: 'Asset', sub_type: 'Fixed Asset' },
  { code: '1510', name: 'Accumulated Depreciation', account_type: 'Asset', sub_type: 'Fixed Asset' },
  { code: '2000', name: 'Accounts Payable', account_type: 'Liability', sub_type: 'Current Liability' },
  { code: '2100', name: 'Accrued Liabilities', account_type: 'Liability', sub_type: 'Current Liability' },
  { code: '2200', name: 'Payroll Liabilities', account_type: 'Liability', sub_type: 'Current Liability' },
  { code: '2300', name: 'Sales Tax Payable', account_type: 'Liability', sub_type: 'Current Liability' },
  { code: '2500', name: 'Long-term Debt', account_type: 'Liability', sub_type: 'Long-term Liability' },
  { code: '3000', name: "Owner's Equity", account_type: 'Equity', sub_type: "Owner's Equity" },
  { code: '3100', name: 'Retained Earnings', account_type: 'Equity', sub_type: 'Retained Earnings' },
  { code: '4000', name: 'Revenue', account_type: 'Revenue', sub_type: 'Operating Revenue' },
  { code: '4100', name: 'Service Revenue', account_type: 'Revenue', sub_type: 'Operating Revenue' },
  { code: '4200', name: 'Product Sales', account_type: 'Revenue', sub_type: 'Operating Revenue' },
  { code: '4900', name: 'Other Revenue', account_type: 'Revenue', sub_type: 'Other Revenue' },
  { code: '5000', name: 'Cost of Goods Sold', account_type: 'Cost of Goods Sold', sub_type: 'COGS' },
  { code: '6000', name: 'Payroll & Wages', account_type: 'Expense', sub_type: 'Payroll' },
  { code: '6100', name: 'Rent & Occupancy', account_type: 'Expense', sub_type: 'Rent' },
  { code: '6200', name: 'Utilities', account_type: 'Expense', sub_type: 'Utilities' },
  { code: '6300', name: 'Marketing & Advertising', account_type: 'Expense', sub_type: 'Marketing' },
  { code: '6400', name: 'Office Supplies', account_type: 'Expense', sub_type: 'Operating Expense' },
  { code: '6500', name: 'Professional Services', account_type: 'Expense', sub_type: 'Professional Services' },
  { code: '6600', name: 'Insurance', account_type: 'Expense', sub_type: 'Insurance' },
  { code: '6700', name: 'Depreciation Expense', account_type: 'Expense', sub_type: 'Depreciation' },
  { code: '6800', name: 'Software & Subscriptions', account_type: 'Expense', sub_type: 'Operating Expense' },
  { code: '6900', name: 'Travel & Entertainment', account_type: 'Expense', sub_type: 'Operating Expense' },
  { code: '7000', name: 'Interest Expense', account_type: 'Expense', sub_type: 'Other Expense' },
  { code: '8000', name: 'Other Expense', account_type: 'Expense', sub_type: 'Other Expense' },
]

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .order('code')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Compute balances from transactions (simplified: match category to account name)
  const { data: txs } = await supabase
    .from('transactions')
    .select('type, amount, category')
    .eq('user_id', session.user.id)

  const accounts = (data || []).map(acct => {
    let balance = 0
    if (acct.account_type === 'Revenue') {
      balance = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    } else if (acct.account_type === 'Expense') {
      const catBalance = (txs || [])
        .filter(t => t.type === 'expense' && (t.category || '').toLowerCase().includes(acct.name.toLowerCase().split(' ')[0]))
        .reduce((s, t) => s + Number(t.amount), 0)
      balance = catBalance
    }
    return { ...acct, balance }
  })

  return NextResponse.json({ accounts })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Seed default accounts
  if (body.action === 'seed') {
    const rows = DEFAULT_ACCOUNTS.map(a => ({ ...a, user_id: session.user.id, is_active: true, description: '' }))
    const { error } = await supabase
      .from('chart_of_accounts')
      .upsert(rows, { onConflict: 'user_id,code' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, seeded: rows.length })
  }

  const { data, error } = await supabase.from('chart_of_accounts').insert({
    user_id: session.user.id,
    code: body.code,
    name: body.name,
    account_type: body.account_type,
    sub_type: body.sub_type || '',
    description: body.description || '',
    is_active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ account: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...updates } = await req.json()
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ account: data })
}
