import AppShell from '@/components/AppShell'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  let user = undefined
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', session.user.id)
      .single()
    user = { name: profile?.full_name, email: session.user.email, role: profile?.role }
  }

  return <AppShell user={user}>{children}</AppShell>
}
