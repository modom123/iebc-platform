import { redirect } from 'next/navigation'
import WorkspaceSidebar from './WorkspaceSidebar'

export const dynamic = 'force-dynamic'

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  let user = undefined
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const supabase = createServerSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        redirect('/auth/login?next=/workspace')
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()
      user = { name: profile?.full_name, email: session.user.email }
    }
  } catch { /* Supabase not configured — allow in dev */ }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <WorkspaceSidebar user={user} />
      <main className="flex-1 overflow-auto lg:pt-0 pt-14">
        {children}
      </main>
    </div>
  )
}
