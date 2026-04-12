import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const TIER_LABELS: Record<string, { label: string; color: string; consultants: number; users: number }> = {
  silver:   { label: 'Silver',   color: 'bg-gray-100 text-gray-700',   consultants: 0, users: 1 },
  gold:     { label: 'Gold',     color: 'bg-yellow-100 text-yellow-700', consultants: 3, users: 5 },
  platinum: { label: 'Platinum', color: 'bg-blue-100 text-[#0F4C81]',   consultants: 5, users: 10 },
}

export default async function Accounting() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  let sub = null
  let transactions: { date: string; vendor: string; amount: number; type: 'credit' | 'debit' }[] = []

  if (session) {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', session.user.id)
      .single()
    sub = data

    // Fetch recent IEBC fee records as a proxy for transaction history
    const { data: fees } = await supabase
      .from('iebc_fees')
      .select('created_at, gross_amount_cents, iebc_fee_cents')
      .order('created_at', { ascending: false })
      .limit(10)

    transactions = (fees || []).map(f => ({
      date: new Date(f.created_at).toLocaleDateString(),
      vendor: 'Stripe Payment',
      amount: f.gross_amount_cents / 100,
      type: 'credit' as const,
    }))
  }

  const tier = sub?.plan ? TIER_LABELS[sub.plan] : null

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0F4C81]">📊 Efficient by IEBC</h1>
            {tier && (
              <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${tier.color}`}>
                {tier.label} Plan · {tier.consultants > 0 ? `${tier.consultants} consultants · ` : ''}Up to {tier.users} user{tier.users > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex gap-3 items-center">
            {!session && (
              <Link href="/accounting/checkout" className="btn-primary text-sm">Upgrade</Link>
            )}
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Public Site</Link>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ['Revenue', '$24,850', 'text-green-700'],
            ['Expenses', '$9,320', 'text-red-600'],
            ['Net Profit', '$15,530', 'text-green-700'],
            ['Cash on Hand', '$47,200', 'text-[#0F4C81]'],
          ].map(([l, v, color], i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">{l}</p>
              <p className={`text-2xl font-bold ${color}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Tier Features */}
        {sub?.plan && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold mb-3">Your {tier?.label} Plan Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sub.plan === 'silver' && (
                <>
                  <Feature text="Core accounting dashboard" />
                  <Feature text="Income & expense tracking" />
                  <Feature text="Transaction history" />
                  <Feature text="Email support" />
                  <div className="md:col-span-2">
                    <Link href="/accounting/checkout" className="text-sm text-[#0F4C81] font-semibold hover:underline">
                      Upgrade to Gold for consultants & more features →
                    </Link>
                  </div>
                </>
              )}
              {sub.plan === 'gold' && (
                <>
                  <Feature text="3 IEBC consultants assigned" />
                  <Feature text="Up to 5 team users" />
                  <Feature text="Invoice generation" />
                  <Feature text="Lead pipeline access" />
                  <Feature text="Priority support" />
                  <div>
                    <Link href="/accounting/checkout" className="text-sm text-[#0F4C81] font-semibold hover:underline">
                      Upgrade to Platinum →
                    </Link>
                  </div>
                </>
              )}
              {sub.plan === 'platinum' && (
                <>
                  <Feature text="Full accounting suite" />
                  <Feature text="5 IEBC consultants assigned" />
                  <Feature text="Up to 10 team users" />
                  <Feature text="Business formation support" />
                  <Feature text="AI workforce dispatch" />
                  <Feature text="Dedicated account manager" />
                </>
              )}
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Vendor</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length > 0 ? transactions.map((t, i) => (
                <tr key={i}>
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">{t.vendor}</td>
                  <td className={`p-3 text-right font-mono ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
                  </td>
                </tr>
              )) : (
                <>
                  <tr>
                    <td className="p-3">2026-04-03</td>
                    <td className="p-3">AWS Cloud</td>
                    <td className="p-3 text-right font-mono text-red-600">-$284.00</td>
                  </tr>
                  <tr>
                    <td className="p-3">2026-04-02</td>
                    <td className="p-3">Apex Co. Payment</td>
                    <td className="p-3 text-right font-mono text-green-600">+$4,200.00</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Upsell if no subscription */}
        {!sub && (
          <div className="bg-[#0F4C81] text-white p-6 rounded-xl text-center">
            <h3 className="font-bold text-lg mb-2">Unlock Your Full Dashboard</h3>
            <p className="text-blue-200 text-sm mb-4">Subscribe to sync real data, access consultants, and manage your team.</p>
            <Link href="/accounting/checkout" className="bg-white text-[#0F4C81] px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              View Plans — From $9/mo
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-green-500">✓</span> {text}
    </div>
  )
}
