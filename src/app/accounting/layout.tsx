import AccountingShell from '@/components/AccountingShell'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Plan } from '@/lib/plan-features'

export const dynamic = 'force-dynamic'

export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
  let user = undefined
  let plan: Plan = 'silver'
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createServerSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const [{ data: profile }, { data: sub }] = await Promise.all([
          supabase.from('profiles').select('full_name, role').eq('id', session.user.id).single(),
          supabase.from('subscriptions').select('plan').eq('user_id', session.user.id).single(),
        ])
        user = { name: profile?.full_name, email: session.user.email, role: profile?.role }
        if (sub?.plan && ['silver', 'gold', 'platinum'].includes(sub.plan)) {
          plan = sub.plan as Plan
        }
      }
    }
  } catch { /* Supabase not configured */ }

  return <AccountingShell user={user} plan={plan}>{children}</AccountingShell>
}
