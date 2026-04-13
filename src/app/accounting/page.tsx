import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MonthlyBarChart, DonutChart } from '@/components/Charts'

const DONUT_COLORS = ['#0F4C81','#2563eb','#7c3aed','#db2777','#ea580c','#16a34a']

export default async function Accounting() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const userId = session.user.id
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]

  const [
    { data: txAll },
    { data: txMonth },
    { data: txChart },
    { data: invoices },
    { data: sub },
    { data: recentTx },
    { data: bills },
    { data: taxes },
  ] = await Promise.all([
    supabase.from('transactions').select('type,amount').eq('user_id', userId),
    supabase.from('transactions').select('type,amount').eq('user_id', userId).gte('date', firstOfMonth),
    supabase.from('transactions').select('date,type,amount,category').eq('user_id', userId).gte('date', sixMonthsAgo),
    supabase.from('invoices').select('status,total,amount_paid').eq('user_id', userId),
    supabase.from('subscriptions').select('plan,status').eq('user_id', userId).single(),
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(8),
    supabase.from('bills').select('amount,due_date,status').eq('user_id', userId).eq('status', 'unpaid'),
    supabase.from('tax_obligations').select('amount,due_date,status').eq('user_id', userId).neq('status', 'paid'),
  ])

  const totalIncome = (txAll || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = (txAll || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const netProfit = totalIncome - totalExpenses
  const monthIncome = (txMonth || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpenses = (txMonth || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const outstanding = (invoices || [])
    .filter(i => i.status !== 'paid' && i.status !== 'void')
    .reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0)
  const overdueCount = (invoices || []).filter(i => i.status === 'overdue').length

  // Build last 6 months chart data
  const monthlyMap: Record<string, { income: number; expenses: number }> = {}
  for (const t of txChart || []) {
    const m = t.date.substring(0, 7)
    if (!monthlyMap[m]) monthlyMap[m] = { income: 0, expenses: 0 }
    if (t.type === 'income') monthlyMap[m].income += Number(t.amount)
    if (t.type === 'expense') monthlyMap[m].expenses += Number(t.amount)
  }
  const monthlyChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const key = d.toISOString().substring(0, 7)
    return { label: d.toLocaleDateString('en-US', { month: 'short' }), ...(monthlyMap[key] || { income: 0, expenses: 0 }) }
  })

  // Expense by category for donut
  const catMap: Record<string, number> = {}
  for (const t of txChart || []) {
    if (t.type === 'expense') {
      const cat = t.category || 'Other'
      catMap[cat] = (catMap[cat] || 0) + Number(t.amount)
    }
  }
  const donutData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({ label, value, color: DONUT_COLORS[i] }))

  // Alerts
  const today = now.toISOString().split('T')[0]
  const billsOverdue = (bills || []).filter(b => b.due_date < today)
  const taxesOverdue = (taxes || []).filter(t => t.due_date < today)

  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-[#0F4C81]">IEBC</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Efficient Accounting</span>
        </div>
        <div className="flex gap-3 text-sm items-center flex-wrap">
          <Link href="/accounting/transactions" className="hover:text-[#0F4C81] text-gray-600">Transactions</Link>
          <Link href="/accounting/invoices" className="hover:text-[#0F4C81] text-gray-600">Invoices</Link>
          <Link href="/accounting/estimates" className="hover:text-[#0F4C81] text-gray-600">Estimates</Link>
          <Link href="/accounting/scanner" className="hover:text-[#0F4C81] text-gray-600 font-medium">🤖 AI Scan</Link>
          <Link href="/accounting/customers" className="hover:text-[#0F4C81] text-gray-600">Customers</Link>
          <Link href="/accounting/bills" className="hover:text-[#0F4C81] text-gray-600">Bills</Link>
          <Link href="/accounting/budgets" className="hover:text-[#0F4C81] text-gray-600">Budgets</Link>
          <Link href="/accounting/tracker" className="hover:text-[#0F4C81] text-gray-600">Tracker</Link>
          <Link href="/accounting/forecast" className="hover:text-[#0F4C81] text-gray-600">Forecast</Link>
          <Link href="/accounting/reports" className="hover:text-[#0F4C81] text-gray-600">Reports</Link>
          <Link href="/accounting/journal" className="hover:text-[#0F4C81] text-gray-600">Journal</Link>
          <Link href="/hub" className="hover:text-[#0F4C81] text-gray-600">Hub</Link>
          <Link href="/settings" className="hover:text-[#0F4C81] text-gray-600">Settings</Link>
          {!sub && <Link href="/accounting/checkout" className="bg-[#0F4C81] text-white px-3 py-1 rounded-lg">Upgrade</Link>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Alerts */}
        {(billsOverdue.length > 0 || taxesOverdue.length > 0 || overdueCount > 0) && (
          <div className="space-y-2">
            {overdueCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex justify-between items-center">
                <span>⚠️ <strong>{overdueCount}</strong> invoice{overdueCount > 1 ? 's are' : ' is'} overdue</span>
                <Link href="/accounting/invoices?status=overdue" className="font-semibold hover:underline">Review →</Link>
              </div>
            )}
            {billsOverdue.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 flex justify-between items-center">
                <span>⚠️ <strong>{billsOverdue.length}</strong> bill{billsOverdue.length > 1 ? 's are' : ' is'} past due</span>
                <Link href="/accounting/bills" className="font-semibold hover:underline">Pay Now →</Link>
              </div>
            )}
            {taxesOverdue.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex justify-between items-center">
                <span>🚨 <strong>{taxesOverdue.length}</strong> tax obligation{taxesOverdue.length > 1 ? 's are' : ' is'} overdue</span>
                <Link href="/accounting/tax" className="font-semibold hover:underline">File Now →</Link>
              </div>
            )}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: fmt(totalIncome), sub: `${fmt(monthIncome)} this month`, color: 'text-green-700' },
            { label: 'Total Expenses', value: fmt(totalExpenses), sub: `${fmt(monthExpenses)} this month`, color: 'text-red-600' },
            { label: 'Net Profit', value: fmt(netProfit), sub: netProfit >= 0 ? 'Profitable' : 'Net loss', color: netProfit >= 0 ? 'text-green-700' : 'text-red-600' },
            { label: 'Outstanding AR', value: fmt(outstanding), sub: overdueCount > 0 ? `${overdueCount} overdue` : 'No overdue', color: outstanding > 0 ? 'text-orange-600' : 'text-gray-700' },
          ].map((card, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Revenue vs Expenses</h2>
              <span className="text-xs text-gray-400">Last 6 months</span>
            </div>
            <MonthlyBarChart data={monthlyChartData} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Expense Breakdown</h2>
              <span className="text-xs text-gray-400">6 months</span>
            </div>
            {donutData.length > 0 ? (
              <div className="flex flex-col items-center gap-3">
                <DonutChart data={donutData} size={130} />
                <div className="w-full space-y-1.5">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                        <span className="text-gray-600 truncate max-w-[120px]">{d.label}</span>
                      </div>
                      <span className="font-medium text-gray-700">${d.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No expense data</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { href: '/accounting/transactions', icon: '💰', label: 'Add Transaction' },
            { href: '/accounting/invoices/new', icon: '📄', label: 'New Invoice' },
            { href: '/accounting/estimates', icon: '📋', label: 'Estimates' },
            { href: '/accounting/scanner', icon: '🤖', label: 'AI Scanner' },
            { href: '/accounting/bills', icon: '🧾', label: 'Pay a Bill' },
            { href: '/accounting/tracker', icon: '🚗', label: 'Mileage & Time' },
            { href: '/accounting/recurring', icon: '🔁', label: 'Recurring' },
            { href: '/accounting/projects', icon: '🏗️', label: 'Projects' },
            { href: '/accounting/reconcile', icon: '🏦', label: 'Reconcile' },
            { href: '/accounting/budgets', icon: '🎯', label: 'Budgets' },
            { href: '/accounting/reports', icon: '📊', label: 'Reports' },
            { href: '/accounting/tax', icon: '💸', label: 'Tax Center' },
            { href: '/accounting/rules', icon: '⚡', label: 'Auto Rules' },
            { href: '/accounting/customers', icon: '👥', label: 'Customers' },
            { href: '/accounting/forecast', icon: '📈', label: 'Cash Forecast' },
            { href: '/accounting/accounts', icon: '📒', label: 'Chart of Accounts' },
            { href: '/accounting/aged-receivables', icon: '⏱️', label: 'Aged AR' },
            { href: '/accounting/journal', icon: '📝', label: 'Journal' },
            { href: '/api/export?type=transactions', icon: '⬇️', label: 'Export CSV' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2 hover:border-[#0F4C81] hover:shadow-sm transition text-sm">
              <span className="text-lg">{icon}</span>
              <span className="font-medium text-gray-700 leading-tight">{label}</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Recent Transactions</h2>
              <Link href="/accounting/transactions" className="text-sm text-[#0F4C81] hover:underline">View all</Link>
            </div>
            {recentTx && recentTx.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Amount</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {recentTx.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{t.date}</td>
                      <td className="p-3 font-medium">{t.description}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{t.category || 'Uncategorized'}</span></td>
                      <td className={`p-3 text-right font-mono font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(Number(t.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm mb-3">No transactions yet</p>
                <Link href="/accounting/transactions" className="btn-primary text-sm">Add First Transaction</Link>
              </div>
            )}
          </div>

          {/* Right Panel: Invoices + Bills */}
          <div className="space-y-4">
            {/* Invoice Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-800">Invoices</h2>
                <Link href="/accounting/invoices" className="text-sm text-[#0F4C81] hover:underline">View all</Link>
              </div>
              <div className="p-5 space-y-2">
                {[
                  { label: 'Draft', status: 'draft', color: 'bg-gray-100 text-gray-600' },
                  { label: 'Sent', status: 'sent', color: 'bg-blue-100 text-blue-700' },
                  { label: 'Paid', status: 'paid', color: 'bg-green-100 text-green-700' },
                  { label: 'Overdue', status: 'overdue', color: 'bg-red-100 text-red-700' },
                ].map(({ label, status, color }) => {
                  const count = (invoices || []).filter(i => i.status === status).length
                  const total = (invoices || []).filter(i => i.status === status).reduce((s, i) => s + Number(i.total), 0)
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
                        <span className="text-xs text-gray-400">{count}</span>
                      </div>
                      <span className="text-sm font-semibold">{fmt(total)}</span>
                    </div>
                  )
                })}
                <Link href="/accounting/invoices/new" className="block text-center btn-primary text-sm mt-3">+ New Invoice</Link>
              </div>
            </div>

            {/* Upcoming Bills */}
            {bills && bills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800">Unpaid Bills</h2>
                  <Link href="/accounting/bills" className="text-sm text-[#0F4C81] hover:underline">Manage</Link>
                </div>
                <div className="p-4 space-y-2">
                  {bills.slice(0, 4).map((b, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className={`text-gray-600 ${b.due_date < today ? 'text-red-500' : ''}`}>{b.due_date}</span>
                      <span className="font-semibold text-red-600">{fmt(b.amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold">
                    <span>Total Due</span>
                    <span className="text-red-600">{fmt(bills.reduce((s, b) => s + Number(b.amount), 0))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
