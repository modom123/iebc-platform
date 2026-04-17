import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Plaid Link Token — returns a link_token for initializing Plaid Link in the browser
// Requires env: PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV (sandbox|development|production)
export async function POST() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  const env = process.env.PLAID_ENV || 'sandbox'

  if (!clientId || !secret) {
    return NextResponse.json({ error: 'Plaid is not configured. Add PLAID_CLIENT_ID and PLAID_SECRET to your environment variables.' }, { status: 503 })
  }

  const plaidBase = `https://${env}.plaid.com`

  const res = await fetch(`${plaidBase}/link/token/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      secret,
      user: { client_user_id: session.user.id },
      client_name: 'IEBC Efficient Accounting',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
      webhook: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/accounting/plaid/webhook`
        : undefined,
    }),
  })

  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.error_message || 'Failed to create link token' }, { status: 400 })

  return NextResponse.json({ link_token: data.link_token, expiration: data.expiration })
}
