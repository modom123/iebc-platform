import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  // Portal is fully public — skip auth
  if (request.nextUrl.pathname.startsWith('/portal')) {
    return response
  }

  // Skip if Supabase env vars are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    const protectedPaths = ['/accounting', '/hub', '/settings', '/admin']
    if (protectedPaths.some(p => request.nextUrl.pathname.startsWith(p)) && !session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Admin check — only for /admin, wrapped to prevent DB errors blocking the page
    if (request.nextUrl.pathname.startsWith('/admin') && session) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (profile?.role !== 'admin') {
          return NextResponse.redirect(new URL('/accounting', request.url))
        }
      } catch {
        return NextResponse.redirect(new URL('/accounting', request.url))
      }
    }
  } catch {
    // If middleware errors, let the page handle auth itself rather than 404ing
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/accounting/:path*',
    '/hub/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/portal/:path*',
  ]
}
