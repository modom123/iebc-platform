import AppShell from '@/components/AppShell'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  let user = undefined
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()
      user = { name: profile?.full_name, email: session.user.email, role: profile?.role }
    }
  } catch {
    // Supabase not configured — render layout without user context
  }

  return <AppShell user={user}>{children}</AppShell>
}
