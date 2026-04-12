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

  const userId = session.user.id

  const [
    { data: sub },
    { data: consultants },
    { data: leads },
    { data: tasks },
    { data: profile },
  ] = await Promise.all([
    supabase.from('subscriptions').select('plan, status, current_period_end').eq('user_id', userId).single(),
    supabase.from('consultant_assignments').select('consultant_id, department').eq('user_id', userId),
    supabase.from('leads').select('id, business_name, heat, status, est_value').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('tasks').select('id, title, status, priority, due_date').eq('user_id', userId).neq('status', 'done').order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('full_name').eq('id', userId).single(),
  ])

  const tier = sub?.plan ? TIER_INFO[sub.plan] : null
  const maxConsultants = tier?.consultants ?? 0
  const todayStr = new Date().toISOString().split('T')[0]
  const overdueTasks = (tasks || []).filter(t => t.due_date && t.due_date < todayStr).length

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-[#0F4C81]">IEBC</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Master Hub</span>
        </div>
        <div className="flex gap-3 text-sm items-center">
          <Link href="/accounting" className="hover:text-[#0F4C81] text-gray-600">Accounting</Link>
          <Link href="/hub/leads" className="hover:text-[#0F4C81] text-gray-600">Leads</Link>
          <Link href="/hub/tasks" className="hover:text-[#0F4C81] text-gray-600">Tasks</Link>
          <Link href="/hub/team" className="hover:text-[#0F4C81] text-gray-600">Team</Link>
          <Link href="/hub/formation" className="hover:text-[#0F4C81] text-gray-600">Formation</Link>
          <Link href="/settings" className="hover:text-[#0F4C81] text-gray-600">Settings</Link>
          {!sub && <Link href="/accounting/checkout" className="bg-[#0F4C81] text-white px-3 py-1 rounded-lg">Upgrade</Link>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Welcome back'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{session.user.email}</p>
          </div>
          {tier && (
            <span className={`px-3 py-1 rounded-full font-bold uppercase text-sm ${tier.color}`}>
              {tier.label} · {tier.price}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Tasks', value: String((tasks || []).length), color: 'text-[#0F4C81]', href: '/hub/tasks' },
            { label: 'Hot Leads', value: String((leads || []).filter(l => l.heat === 'hot').length), color: 'text-red-600', href: '/hub/leads' },
            { label: 'Tasks Overdue', value: String(overdueTasks), color: overdueTasks > 0 ? 'text-red-600' : 'text-gray-400', href: '/hub/tasks' },
            { label: 'Pipeline Value', value: '$' + (leads || []).reduce((s, l) => s + Number(l.est_value), 0).toLocaleString(), color: 'text-green-700', href: '/hub/leads' },
          ].map((c, i) => (
            <Link key={i} href={c.href} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-[#0F4C81] hover:shadow-sm transition">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/hub/tasks', icon: '✅', label: 'Add Task', sub: 'Track your work' },
            { href: '/hub/leads', icon: '🔥', label: 'Add Lead', sub: 'Manage pipeline' },
            { href: '/accounting/invoices/new', icon: '📄', label: 'New Invoice', sub: 'Bill a customer' },
            { href: '/accounting/transactions', icon: '💰', label: 'Log Transaction', sub: 'Record income/expense' },
            { href: '/hub/team', icon: '👥', label: 'Team', sub: 'Manage members' },
            { href: '/hub/formation', icon: '🏛️', label: 'Formation', sub: 'Set up your entity' },
          ].map(({ href, icon, label, sub }) => (
            <Link key={href} href={href} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#0F4C81] hover:shadow-sm transition">
              <span className="text-2xl">{icon}</span>
              <div><p className="font-semibold text-sm">{label}</p><p className="text-xs text-gray-400">{sub}</p></div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Active Tasks</h2>
              <Link href="/hub/tasks" className="text-sm text-[#0F4C81] hover:underline">View all</Link>
            </div>
            {tasks && tasks.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {tasks.map(t => (
                  <div key={t.id} className="p-4 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      t.priority === 'urgent' ? 'bg-red-500' :
                      t.priority === 'high' ? 'bg-orange-400' :
                      t.priority === 'medium' ? 'bg-blue-400' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      {t.due_date && (
                        <p className={`text-xs ${t.due_date < todayStr ? 'text-red-500' : 'text-gray-400'}`}>Due {t.due_date}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>{t.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm mb-3">No active tasks</p>
                <Link href="/hub/tasks" className="btn-primary text-sm">Add First Task</Link>
              </div>
            )}
          </div>

          {/* Leads */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Lead Pipeline</h2>
              <Link href="/hub/leads" className="text-sm text-[#0F4C81] hover:underline">View all</Link>
            </div>
            {leads && leads.length > 0 ? (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{lead.business_name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.heat === 'hot' ? 'bg-red-100 text-red-600' :
                          lead.heat === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-600'
                        }`}>{lead.heat}</span>
                      </td>
                      <td className="p-4 text-gray-500 capitalize text-xs">{lead.status.replace('_', ' ')}</td>
                      <td className="p-4 text-right font-mono text-sm">${Number(lead.est_value).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm mb-3">No leads yet</p>
                <Link href="/hub/leads" className="btn-primary text-sm">Add First Lead</Link>
              </div>
            )}
          </div>
        </div>

        {/* Subscription + AI Consultants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-bold text-lg mb-3">Subscription</h2>
            {sub && tier ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full font-bold uppercase text-sm ${tier.color}`}>{tier.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{sub.status}</span>
                  <span className="text-sm text-gray-500">{tier.price}</span>
                </div>
                {sub.current_period_end && (
                  <p className="text-sm text-gray-500">Renews {new Date(sub.current_period_end).toLocaleDateString()}</p>
                )}
                <Link href="/accounting/checkout" className="text-sm text-[#0F4C81] hover:underline">Change plan →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-500 text-sm">No active subscription.</p>
                <Link href="/accounting/checkout" className="btn-primary text-sm inline-block">Upgrade Now</Link>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">AI Consultant Workforce</h2>
              {maxConsultants > 0 && (
                <span className="text-sm text-gray-400">{consultants?.length ?? 0} / {maxConsultants}</span>
              )}
            </div>
            {maxConsultants === 0 ? (
              <div className="text-sm text-gray-500">
                <p>Requires Gold ($22/mo) or Platinum ($42/mo).</p>
                <Link href="/accounting/checkout" className="text-[#0F4C81] font-semibold hover:underline mt-1 inline-block">Upgrade to unlock →</Link>
              </div>
            ) : consultants && consultants.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {consultants.map((c, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#0F4C81] rounded-full text-sm font-medium">{c.department}</span>
                ))}
                {maxConsultants > consultants.length && (
                  <span className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 rounded-full text-sm">
                    + {maxConsultants - consultants.length} slot{maxConsultants - consultants.length > 1 ? 's' : ''} available
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Your {tier?.label} plan includes {maxConsultants} consultant{maxConsultants > 1 ? 's' : ''}. Contact support to get assigned.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
