import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Projects 90-day cash flow using recurring transactions + historical averages
export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const today = new Date()

  // Get last 90 days of actuals for baseline
  const ninetyDaysAgo = new Date(today)
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const fromStr = ninetyDaysAgo.toISOString().split('T')[0]

  const [{ data: txs }, { data: recurring }, { data: bills }] = await Promise.all([
    supabase.from('transactions').select('date,type,amount').eq('user_id', userId).gte('date', fromStr),
    supabase.from('recurring_transactions').select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('bills').select('amount,due_date,status').eq('user_id', userId).neq('status', 'paid').neq('status', 'void'),
  ])

  // Calculate monthly averages from last 90 days
  const incomeTotal = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenseTotal = (txs || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const avgMonthlyIncome = incomeTotal / 3
  const avgMonthlyExpense = expenseTotal / 3

  // Build 90-day forecast by week
  const forecast = []
  for (let w = 0; w < 13; w++) {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() + w * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekStartStr = weekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]
    const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    // Recurring income/expense in this week
    let recurringIncome = 0
    let recurringExpense = 0

    for (const r of recurring || []) {
      const nextDate = new Date(r.next_date)
      // Check if recurring hits this week
      let hits = false
      if (r.frequency === 'daily') {
        hits = true
        const daysInWeek = Math.min(7, (weekEnd.getTime() - Math.max(nextDate.getTime(), weekStart.getTime())) / 86400000 + 1)
        const n = Math.max(0, Math.floor(daysInWeek))
        if (r.type === 'income') recurringIncome += Number(r.amount) * n
        else recurringExpense += Number(r.amount) * n
        continue
      }
      if (r.frequency === 'weekly' && nextDate >= weekStart && nextDate <= weekEnd) hits = true
      if (r.frequency === 'monthly' && nextDate.getDate() >= weekStart.getDate() && nextDate.getDate() <= weekEnd.getDate() && w < 5) hits = true
      if (hits) {
        if (r.type === 'income') recurringIncome += Number(r.amount)
        else recurringExpense += Number(r.amount)
      }
    }

    // Bills due this week
    const billsDue = (bills || [])
      .filter(b => b.due_date >= weekStartStr && b.due_date <= weekEndStr)
      .reduce((s, b) => s + Number(b.amount), 0)

    // Baseline from historical average (weekly portion)
    const baseIncome = avgMonthlyIncome / 4.33
    const baseExpense = avgMonthlyExpense / 4.33

    const projectedIncome = Math.max(recurringIncome, baseIncome)
    const projectedExpense = recurringExpense + billsDue + (baseExpense - recurringExpense > 0 ? baseExpense - recurringExpense : 0)

    forecast.push({
      week: w + 1,
      label,
      from: weekStartStr,
      to: weekEndStr,
      projected_income: Math.round(projectedIncome),
      projected_expense: Math.round(projectedExpense),
      net: Math.round(projectedIncome - projectedExpense),
      bills_due: Math.round(billsDue),
      recurring_income: Math.round(recurringIncome),
      recurring_expense: Math.round(recurringExpense),
    })
  }

  return NextResponse.json({
    generated_at: today.toISOString(),
    baseline: {
      avg_monthly_income: Math.round(avgMonthlyIncome),
      avg_monthly_expense: Math.round(avgMonthlyExpense),
    },
    forecast,
  })
}
