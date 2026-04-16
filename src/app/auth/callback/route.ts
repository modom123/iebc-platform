import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/accounting'

  if (code) {
    try {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
      }
    } catch {
      return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
