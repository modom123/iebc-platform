import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

const TIER_INFO: Record<string, { label: string; color: string; price: string }> = {
  silver:   { label: 'Silver',   color: 'bg-gray-100 text-gray-700',    price: '$9/mo' },
  gold:     { label: 'Gold',     color: 'bg-yellow-100 text-yellow-700', price: '$22/mo' },
  platinum: { label: 'Platinum', color: 'bg-blue-100 text-[#0F4C81]',   price: '$42/mo' },
}

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', session.user.id).single(),
  ])

  const tier = sub?.plan ? TIER_INFO[sub.plan] : null

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
              <p className="mt-1 font-medium text-gray-800">{profile?.full_name || '—'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
              <p className="mt-1 font-medium text-gray-800">{session.user.email}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
              <p className="mt-1">
                <span className="px-2 py-0.5 bg-blue-50 text-[#0F4C81] rounded-full text-xs font-medium capitalize">{profile?.role || 'client'}</span>
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
              <p className="mt-1 text-sm text-gray-600">{new Date(session.user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Subscription</h2>
          {sub && tier ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full font-bold text-sm uppercase ${tier.color}`}>{tier.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{sub.status}</span>
                <span className="text-sm text-gray-500">{tier.price}</span>
              </div>
              {sub.current_period_end && (
                <p className="text-sm text-gray-500">
                  Next billing date: <span className="font-medium text-gray-700">{new Date(sub.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <Link href="/accounting/checkout" className="btn-secondary text-sm">Change Plan</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm">No active subscription.</p>
              <Link href="/accounting/checkout" className="btn-primary text-sm inline-block">Upgrade Now — From $9/mo</Link>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/accounting', label: 'Accounting Dashboard', icon: '📊' },
              { href: '/hub', label: 'Master Hub', icon: '🏢' },
              { href: '/hub/leads', label: 'Lead Pipeline', icon: '🔥' },
              { href: '/hub/tasks', label: 'Tasks', icon: '✅' },
              { href: '/hub/team', label: 'Team Management', icon: '👥' },
              { href: '/hub/formation', label: 'Business Formation', icon: '🏛️' },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-[#0F4C81] hover:bg-blue-50 transition text-sm font-medium text-gray-700">
                <span>{icon}</span> {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Account</h2>
          <SignOutButton />
        </div>

      </div>
    </main>
  )
}
