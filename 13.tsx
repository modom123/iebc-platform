import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Hub() {
  const supabase = createServerSupabaseClient()
  const {  { session } } = await supabase.auth.getSession()
  if (!session) return <p>Redirecting...</p>

  const {  data: subs } = await supabase.from('subscriptions').select('plan, status').eq('user_id', session.user.id).single()
  const {  data: consultants } = await supabase.from('consultant_assignments').select('consultant_id, department').eq('user_id', session.user.id)

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#0F4C81]">🏢 IEBC Master Hub</h1>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-600">Plan: <span className="font-bold text-[#0F4C81] uppercase">{subs?.plan || 'None'}</span> | Status: {subs?.status}</p>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Your Assigned Consultants</h3>
            {consultants?.length ? (
              <div className="flex flex-wrap gap-2">
                {consultants.map((c, i) => <span key={i} className="px-3 py-1 bg-blue-100 rounded-full text-sm">{c.department}</span>)}
              </div>
            ) : <p className="text-gray-500 text-sm">No consultants assigned yet. Upgrade or contact support.</p>}
          </div>
        </div>
      </div>
    </main>
  )
}