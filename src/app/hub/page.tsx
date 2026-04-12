import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Hub() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', session.user.id)
    .single()

  const { data: consultants } = await supabase
    .from('consultant_assignments')
    .select('consultant_id, department')
    .eq('user_id', session.user.id)

  const { data: leads } = await supabase
    .from('leads')
    .select('id, business_name, heat, status, est_value')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#0F4C81]">🏢 IEBC Master Hub</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">{session.user.email}</span>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Public Site</Link>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="font-bold text-lg mb-3">Subscription</h2>
          {sub ? (
            <div className="flex gap-4 items-center flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-[#0F4C81] rounded-full font-semibold uppercase text-sm">{sub.plan}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{sub.status}</span>
              {sub.current_period_end && (
                <span className="text-sm text-gray-500">Renews {new Date(sub.current_period_end).toLocaleDateString()}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-gray-500 text-sm">No active subscription.</p>
              <Link href="/accounting/checkout" className="btn-primary text-sm">Upgrade Now</Link>
            </div>
          )}
        </div>

        {/* Assigned Consultants */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="font-bold text-lg mb-3">🤖 Your AI Workforce (60 Consultant System)</h2>
          {consultants && consultants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {consultants.map((c, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-[#0F4C81] rounded-full text-sm">{c.department}</span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No consultants assigned yet. Contact support or upgrade your plan.</p>
          )}
        </div>

        {/* Hot Leads */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="font-bold text-lg mb-3">🔥 Recent Leads</h2>
          {leads && leads.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Business</th>
                  <th className="p-3 text-left">Heat</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Est. Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="p-3 font-medium">{lead.business_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${lead.heat === 'hot' ? 'bg-red-100 text-red-600' : lead.heat === 'warm' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {lead.heat}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{lead.status}</td>
                    <td className="p-3 text-right font-mono">${Number(lead.est_value).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No leads yet.</p>
          )}
        </div>

      </div>
    </main>
  )
}
