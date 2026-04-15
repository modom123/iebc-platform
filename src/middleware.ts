import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Subdomain → path prefix mapping
// e.g. app.iebconsultants.com  → rewrite to /accounting
// e.g. hub.iebconsultants.com  → rewrite to /hub
// e.g. portal.iebconsultants.com → rewrite to /portal
const SUBDOMAIN_MAP: Record<string, string> = {
  app:        '/accounting',
  accounting: '/accounting',
  hub:        '/hub',
  portal:     '/portal',
  platform:   '/platform',
}

function getSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || ''
  // Strip port if present (localhost:3000)
  const hostname = host.split(':')[0]
  // e.g. "app.iebconsultants.com" → "app"
  const parts = hostname.split('.')
  if (parts.length >= 3) return parts[0]
  // Handle Vercel preview URLs like "app-iebconsultants.vercel.app"
  // or branch deploys — skip those
  return null
}

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

  // ── Subdomain routing ──────────────────────────────────────────────
  const subdomain = getSubdomain(request)
  if (subdomain && SUBDOMAIN_MAP[subdomain]) {
    const prefix = SUBDOMAIN_MAP[subdomain]
    const pathname = request.nextUrl.pathname

    // Already routed (path starts with the prefix) — don't double-rewrite
    if (!pathname.startsWith(prefix)) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = prefix + (pathname === '/' ? '' : pathname)
      response = NextResponse.rewrite(rewriteUrl)
      // Re-apply security headers after rewrite
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
      }
    }
  }

  // ── Portal is fully public — skip auth ────────────────────────────
  if (request.nextUrl.pathname.startsWith('/portal')) {
    return response
  }

  // Skip auth check if Supabase env vars are not configured
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

    // Public paths that live inside a normally-protected prefix
    const publicWithinProtected = [
      '/accounting/checkout',  // purchase flow — must be accessible before login
    ]
    if (publicWithinProtected.some(p => request.nextUrl.pathname.startsWith(p))) {
      return response
    }

    const protectedPaths = ['/accounting', '/hub', '/settings', '/admin']
    if (protectedPaths.some(p => request.nextUrl.pathname.startsWith(p)) && !session) {
      // Redirect to login, preserving the original URL as ?next=
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Admin-only guard
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
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
