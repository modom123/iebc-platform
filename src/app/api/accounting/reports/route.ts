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
  const report = searchParams.get('type') || 'pnl'
  const from = searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0]

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('date', from)
    .lte('date', to)
    .order('date')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const income = transactions?.filter(t => t.type === 'income') || []
  const expenses = transactions?.filter(t => t.type === 'expense') || []

  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const netProfit = totalIncome - totalExpenses

  // Group by category
  const incomeByCategory = groupByCategory(income)
  const expensesByCategory = groupByCategory(expenses)

  // Monthly breakdown
  const monthlyData = buildMonthlyBreakdown(transactions || [], from, to)

  if (report === 'pnl') {
    return NextResponse.json({
      type: 'profit_and_loss',
      period: { from, to },
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0,
      },
      income: { total: totalIncome, by_category: incomeByCategory },
      expenses: { total: totalExpenses, by_category: expensesByCategory },
      monthly: monthlyData,
    })
  }

  if (report === 'cashflow') {
    const cashIn = totalIncome
    const cashOut = totalExpenses
    return NextResponse.json({
      type: 'cash_flow',
      period: { from, to },
      summary: {
        cash_in: cashIn,
        cash_out: cashOut,
        net_cash: cashIn - cashOut,
      },
      monthly: monthlyData,
    })
  }

  if (report === 'balance_sheet') {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, amount_paid, status')
      .eq('user_id', session.user.id)

    const ar = (invoices || [])
      .filter(i => i.status !== 'paid' && i.status !== 'void')
      .reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0)

    const { data: bills } = await supabase
      .from('bills')
      .select('amount, status')
      .eq('user_id', session.user.id)

    const ap = (bills || [])
      .filter(b => b.status !== 'paid' && b.status !== 'void')
      .reduce((s, b) => s + Number(b.amount), 0)

    const cashBalance = totalIncome - totalExpenses
    const totalAssets = ar + cashBalance
    const totalEquity = totalAssets - ap

    return NextResponse.json({
      type: 'balance_sheet',
      as_of: to,
      assets: {
        accounts_receivable: ar,
        cash: cashBalance,
        total: totalAssets,
      },
      liabilities: { accounts_payable: ap, total: ap },
      equity: { retained_earnings: totalEquity, total: totalEquity },
    })
  }

  if (report === 'trial_balance') {
    const { data: accounts } = await supabase
      .from('chart_of_accounts')
      .select('id, code, name, type')
      .eq('user_id', session.user.id)
      .order('code')

    const { data: lines } = await supabase
      .from('journal_entry_lines')
      .select('account_id, debit, credit, journal_entries!inner(user_id, date)')
      .eq('journal_entries.user_id', session.user.id)
      .gte('journal_entries.date', from)
      .lte('journal_entries.date', to)

    const balanceMap: Record<string, { debit: number; credit: number }> = {}
    for (const line of lines || []) {
      if (!balanceMap[line.account_id]) balanceMap[line.account_id] = { debit: 0, credit: 0 }
      balanceMap[line.account_id].debit += Number(line.debit || 0)
      balanceMap[line.account_id].credit += Number(line.credit || 0)
    }

    const rows = (accounts || []).map(acct => ({
      code: acct.code,
      name: acct.name,
      type: acct.type,
      debit: balanceMap[acct.id]?.debit || 0,
      credit: balanceMap[acct.id]?.credit || 0,
    })).filter(r => r.debit > 0 || r.credit > 0)

    const totalDebits = rows.reduce((s, r) => s + r.debit, 0)
    const totalCredits = rows.reduce((s, r) => s + r.credit, 0)

    return NextResponse.json({
      type: 'trial_balance',
      period: { from, to },
      rows,
      totals: { debit: totalDebits, credit: totalCredits },
      balanced: Math.abs(totalDebits - totalCredits) < 0.01,
    })
  }

  return NextResponse.json({ error: 'Invalid report type. Use: pnl, cashflow, balance_sheet, trial_balance' }, { status: 400 })
}

function groupByCategory(transactions: { category: string | null; amount: number }[]) {
  const map: Record<string, number> = {}
  for (const t of transactions) {
    const cat = t.category || 'Uncategorized'
    map[cat] = (map[cat] || 0) + Number(t.amount)
  }
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

function buildMonthlyBreakdown(transactions: { date: string; type: string; amount: number }[], from: string, to: string) {
  const months: Record<string, { income: number; expenses: number; net: number }> = {}
  for (const t of transactions) {
    const month = t.date.substring(0, 7)
    if (!months[month]) months[month] = { income: 0, expenses: 0, net: 0 }
    if (t.type === 'income') months[month].income += Number(t.amount)
    if (t.type === 'expense') months[month].expenses += Number(t.amount)
    months[month].net = months[month].income - months[month].expenses
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }))
}
