'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function RevenuePage() {
  const [data, setData] = useState<{ mrr: number; arr: number; income: number; expenses: number; net: number; invoices: number; outstanding: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    Promise.all([
      supabase.from('transactions').select('type,amount').eq('type', 'income'),
      supabase.from('transactions').select('type,amount').eq('type', 'expense'),
      supabase.from('transactions').select('type,amount').eq('type', 'income').gte('date', firstOfMonth),
      supabase.from('subscriptions').select('plan,status').eq('status', 'active'),
      supabase.from('invoices').select('status,total,amount_paid').neq('status', 'void'),
    ]).then(([income, expenses, monthIncome, subs, invoices]) => {
      const totalIncome   = (income.data || []).reduce((s, t) => s + Number(t.amount), 0)
      const totalExpenses = (expenses.data || []).reduce((s, t) => s + Number(t.amount), 0)
      const mrr           = (monthIncome.data || []).reduce((s, t) => s + Number(t.amount), 0)

      const PLAN_MRR: Record<string, number> = { silver: 9, gold: 22, platinum: 42 }
      const subMrr = (subs.data || []).reduce((s, sub) => s + (PLAN_MRR[sub.plan] || 0), 0)

      const outstanding = (invoices.data || [])
        .filter(i => i.status !== 'paid')
        .reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0)
      const invoiceCount = (invoices.data || []).length

      setData({ mrr: subMrr || mrr, arr: (subMrr || mrr) * 12, income: totalIncome, expenses: totalExpenses, net: totalIncome - totalExpenses, invoices: invoiceCount, outstanding })
      setLoading(false)
    })
  }, [])

  const metrics = data ? [
    { label: 'MRR',             value: fmt(data.mrr),         sub: 'Monthly recurring',        color: 'text-green-600' },
    { label: 'ARR',             value: fmt(data.arr),         sub: 'Annual run rate',           color: 'text-blue-600' },
    { label: 'Total Income',    value: fmt(data.income),      sub: 'All time',                  color: 'text-gray-800' },
    { label: 'Total Expenses',  value: fmt(data.expenses),    sub: 'All time',                  color: 'text-red-600' },
    { label: 'Net Profit',      value: fmt(data.net),         sub: 'Income minus expenses',     color: data.net >= 0 ? 'text-green-600' : 'text-red-600' },
    { label: 'Outstanding A/R', value: fmt(data.outstanding), sub: `Across ${data.invoices} invoices`, color: 'text-yellow-600' },
  ] : []

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Revenue & MRR</h1>
        </div>
        <Link href="/accounting/reports" className="text-sm text-[#0F4C81] hover:underline">Full Reports →</Link>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading revenue data...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {metrics.map(m => (
                <div key={m.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
                  <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm font-bold text-gray-700 mb-4">Quick Actions</p>
                <div className="space-y-2">
                  {[
                    { href: '/accounting/invoices',     label: 'View & send invoices',        icon: '▤' },
                    { href: '/accounting/transactions',  label: 'Log income / expenses',        icon: '⇄' },
                    { href: '/accounting/reports',       label: 'P&L and financial reports',    icon: '▦' },
                    { href: '/accounting/forecast',      label: 'Cash flow forecast',           icon: '▲' },
                    { href: '/accounting/tax',           label: 'Tax center & estimates',       icon: '◈' },
                  ].map(a => (
                    <Link key={a.href} href={a.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-[#0F4C81] text-gray-600 text-sm transition">
                      <span className="text-base w-5 text-center text-gray-400">{a.icon}</span>
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm font-bold text-gray-700 mb-4">Efficient Subscribers</p>
                <div className="space-y-3 text-sm">
                  {[
                    { plan: 'Silver',   price: '$9/mo',  color: 'bg-slate-100 text-slate-600' },
                    { plan: 'Gold',     price: '$22/mo', color: 'bg-amber-50 text-amber-700' },
                    { plan: 'Platinum', price: '$42/mo', color: 'bg-blue-50 text-blue-700' },
                  ].map(p => (
                    <div key={p.plan} className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${p.color}`}>{p.plan}</span>
                      <span className="text-gray-500 text-xs">{p.price}</span>
                    </div>
                  ))}
                  <Link href="/accounting/checkout" className="block text-center mt-3 text-xs text-[#0F4C81] hover:underline font-medium">
                    View checkout page →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
