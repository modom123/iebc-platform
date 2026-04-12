import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Accounting() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const userId = session.user.id
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const today = now.toISOString().split('T')[0]

  const [
    { data: txAll },
    { data: txMonth },
    { data: invoices },
    { data: sub },
    { data: recentTx },
  ] = await Promise.all([
    supabase.from('transactions').select('type,amount').eq('user_id', userId),
    supabase.from('transactions').select('type,amount').eq('user_id', userId).gte('date', firstOfMonth),
    supabase.from('invoices').select('status,total,amount_paid').eq('user_id', userId),
    supabase.from('subscriptions').select('plan,status').eq('user_id', userId).single(),
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(8),
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
        <div className="flex gap-3 text-sm">
          <Link href="/accounting/transactions" className="hover:text-[#0F4C81] text-gray-600">Transactions</Link>
          <Link href="/accounting/invoices" className="hover:text-[#0F4C81] text-gray-600">Invoices</Link>
          <Link href="/accounting/reports" className="hover:text-[#0F4C81] text-gray-600">Reports</Link>
          <Link href="/hub" className="hover:text-[#0F4C81] text-gray-600">Hub</Link>
          {!sub && <Link href="/accounting/checkout" className="bg-[#0F4C81] text-white px-3 py-1 rounded-lg">Upgrade</Link>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/accounting/transactions" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#0F4C81] hover:shadow-sm transition">
            <span className="text-2xl">💰</span>
            <div><p className="font-semibold text-sm">Add Transaction</p><p className="text-xs text-gray-400">Log income or expense</p></div>
          </Link>
          <Link href="/accounting/invoices/new" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#0F4C81] hover:shadow-sm transition">
            <span className="text-2xl">📄</span>
            <div><p className="font-semibold text-sm">New Invoice</p><p className="text-xs text-gray-400">Bill a customer</p></div>
          </Link>
          <Link href="/accounting/reports?type=pnl" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#0F4C81] hover:shadow-sm transition">
            <span className="text-2xl">📊</span>
            <div><p className="font-semibold text-sm">P&L Report</p><p className="text-xs text-gray-400">Profit & loss</p></div>
          </Link>
          <Link href="/accounting/reports?type=cashflow" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#0F4C81] hover:shadow-sm transition">
            <span className="text-2xl">🔄</span>
            <div><p className="font-semibold text-sm">Cash Flow</p><p className="text-xs text-gray-400">Money in & out</p></div>
          </Link>
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

          {/* Invoice Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Invoices</h2>
              <Link href="/accounting/invoices" className="text-sm text-[#0F4C81] hover:underline">View all</Link>
            </div>
            <div className="p-5 space-y-3">
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
                      <span className="text-xs text-gray-400">{count} invoice{count !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-sm font-semibold">{fmt(total)}</span>
                  </div>
                )
              })}
              <Link href="/accounting/invoices/new" className="block text-center btn-primary text-sm mt-4">
                + New Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
