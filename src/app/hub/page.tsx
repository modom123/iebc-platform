import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const TIER_INFO: Record<string, { label: string; color: string; consultants: number; users: number; price: string }> = {
  silver:   { label: 'Silver',   color: 'bg-gray-100 text-gray-700',    consultants: 0, users: 1,  price: '$9/mo' },
  gold:     { label: 'Gold',     color: 'bg-yellow-100 text-yellow-700', consultants: 3, users: 5,  price: '$22/mo' },
  platinum: { label: 'Platinum', color: 'bg-blue-100 text-[#0F4C81]',   consultants: 5, users: 10, price: '$42/mo' },
}

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

  const tier = sub?.plan ? TIER_INFO[sub.plan] : null
  const maxConsultants = tier?.consultants ?? 0

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#0F4C81]">🏢 IEBC Master Hub</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-400 hidden md:block">{session.user.email}</span>
            <Link href="/accounting" className="text-sm text-gray-500 hover:text-gray-700">📊 Accounting</Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Site</Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Active Builds', '0'],
            ['Hot Leads', String(leads?.filter(l => l.heat === 'hot').length ?? 0)],
            ['Tasks Due', '0'],
            ['MRR Target', '$10M'],
          ].map(([label, value], i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Subscription + Tier */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="font-bold text-lg mb-3">Subscription</h2>
          {sub && tier ? (
            <div className="flex flex-wrap gap-3 items-center">
              <span className={`px-3 py-1 rounded-full font-bold uppercase text-sm ${tier.color}`}>
                {tier.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {sub.status}
              </span>
              <span className="text-sm text-gray-500">{tier.price}</span>
              <span className="text-sm text-gray-500">·</span>
              <span className="text-sm text-gray-500">
                {maxConsultants > 0 ? `${maxConsultants} consultants` : 'No consultants'} · Up to {tier.users} user{tier.users > 1 ? 's' : ''}
              </span>
              {sub.current_period_end && (
                <span className="text-sm text-gray-400 ml-auto">
                  Renews {new Date(sub.current_period_end).toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-gray-500 text-sm">No active subscription.</p>
              <Link href="/accounting/checkout" className="btn-primary text-sm">Upgrade Now</Link>
            </div>
          )}
        </div>

        {/* AI Consultant Workforce */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">🤖 AI Consultant Workforce</h2>
            {maxConsultants > 0 && (
              <span className="text-sm text-gray-400">{consultants?.length ?? 0} / {maxConsultants} assigned</span>
            )}
          </div>

          {maxConsultants === 0 ? (
            <div className="text-sm text-gray-500">
              <p>Consultant assignments require Gold ($22/mo) or Platinum ($42/mo).</p>
              <Link href="/accounting/checkout" className="text-[#0F4C81] font-semibold hover:underline mt-1 inline-block">
                Upgrade to unlock consultants →
              </Link>
            </div>
          ) : consultants && consultants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {consultants.map((c, i) => (
                <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#0F4C81] rounded-full text-sm font-medium">
                  {c.department}
                </span>
              ))}
              {maxConsultants > consultants.length && (
                <span className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 rounded-full text-sm">
                  + {maxConsultants - consultants.length} slot{maxConsultants - consultants.length > 1 ? 's' : ''} available
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Your {tier?.label} plan includes {maxConsultants} consultant{maxConsultants > 1 ? 's' : ''}. Contact support to get assigned.
            </p>
          )}
        </div>

        {/* Lead Pipeline */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">🔥 Lead Pipeline</h2>
            <span className="text-sm text-[#0F4C81] font-medium">{leads?.length ?? 0} leads</span>
          </div>
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
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td className="p-3 font-medium">{lead.business_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        lead.heat === 'hot' ? 'bg-red-100 text-red-600' :
                        lead.heat === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {lead.heat}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 capitalize">{lead.status}</td>
                    <td className="p-3 text-right font-mono">${Number(lead.est_value).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No leads yet. Add leads via your admin panel or contact your consultant.</p>
          )}
        </div>

      </div>
    </main>
  )
}
