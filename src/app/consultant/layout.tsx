import ConsultantShell from '@/components/ConsultantShell'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// Roles that belong in New Money (consultant hub)
const NEW_MONEY_ROLES = ['iebc_staff', 'consultant', 'admin']

export default async function ConsultantLayout({ children }: { children: React.ReactNode }) {
  let user = undefined
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createServerSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) redirect('/auth/login')
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()
      // Only IEBC staff, consultants, and admins can access New Money
      // Regular subscribers belong in /accounting
      if (!NEW_MONEY_ROLES.includes(profile?.role ?? '')) redirect('/accounting')
      user = { name: profile?.full_name, email: session.user.email, role: profile?.role }
    }
  } catch { /* Supabase not configured — allow dev access */ }

  return <ConsultantShell user={user}>{children}</ConsultantShell>
}
