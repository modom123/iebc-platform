import ConsultantShell from '@/components/ConsultantShell'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ConsultantLayout({ children }: { children: React.ReactNode }) {
  let user = undefined
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createServerSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) redirect('/login')
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()
      // Admins who land here get redirected to the full hub
      if (profile?.role === 'admin' || profile?.role === 'iebc_staff') redirect('/hub')
      user = { name: profile?.full_name, email: session.user.email, role: profile?.role }
    }
  } catch { /* Supabase not configured — allow dev access */ }

  return <ConsultantShell user={user}>{children}</ConsultantShell>
}
