import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TransactionForm from './TransactionForm'
import DeleteButton from './DeleteButton'

const INCOME_CATEGORIES = ['Revenue', 'Consulting', 'Product Sale', 'Refund', 'Grant', 'Other Income']
const EXPENSE_CATEGORIES = ['Payroll', 'Marketing', 'Software / SaaS', 'Office & Supplies', 'Travel', 'Legal & Professional', 'Taxes', 'Other Expense']

export default async function TransactionsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(100)

  const totalIncome = (transactions || [])
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netProfit = totalIncome - totalExpenses

  const grouped = (transactions || []).reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + Number(t.amount)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0F4C81]">Transactions</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all income and expenses</p>
          </div>
          <div className="flex gap-3">
            <Link href="/accounting/invoices" className="btn-secondary text-sm px-4 py-2 border-2 border-[#0F4C81] text-[#0F4C81] rounded-lg font-semibold hover:bg-blue-50">
              Invoices
            </Link>
            <Link href="/accounting" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</Link>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              ${Math.abs(netProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Transaction Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="font-bold text-lg mb-4">Add Transaction</h2>
              <TransactionForm
                incomeCategories={INCOME_CATEGORIES}
                expenseCategories={EXPENSE_CATEGORIES}
              />
            </div>

            {/* Category Breakdown */}
            {Object.keys(grouped).length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 mt-4">
                <h2 className="font-bold text-base mb-3">Category Breakdown</h2>
                <div className="space-y-2">
                  {Object.entries(grouped)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([cat, amt]) => {
                      const max = Math.max(...Object.values(grouped))
                      const pct = max > 0 ? (amt / max) * 100 : 0
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-gray-600">{cat}</span>
                            <span className="font-mono text-gray-800">${amt.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div className="h-1.5 bg-[#0F4C81] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-base">All Transactions</h2>
                <span className="text-sm text-gray-400">{(transactions || []).length} entries</span>
              </div>
              {(transactions || []).length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p className="text-4xl mb-3">💳</p>
                  <p className="font-medium">No transactions yet</p>
                  <p className="text-sm mt-1">Add your first income or expense using the form.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(transactions || []).map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(t.date + 'T00:00:00').toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{t.description}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              t.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                            }`}>{t.category}</span>
                          </td>
                          <td className={`p-3 text-right font-mono font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            <DeleteButton id={t.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
