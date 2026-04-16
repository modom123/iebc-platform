import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { public_token, institution_name, institution_id } = await req.json()
  if (!public_token) return NextResponse.json({ error: 'public_token is required' }, { status: 400 })

  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  const env = process.env.PLAID_ENV || 'sandbox'
  const plaidBase = `https://${env}.plaid.com`

  // Exchange public token for access token
  const exchangeRes = await fetch(`${plaidBase}/item/public_token/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, secret, public_token }),
  })
  const exchangeData = await exchangeRes.json()
  if (!exchangeRes.ok) return NextResponse.json({ error: exchangeData.error_message || 'Exchange failed' }, { status: 400 })

  const { access_token, item_id } = exchangeData

  // Store connection
  const { data: conn, error: connErr } = await supabase
    .from('bank_connections')
    .upsert({
      user_id: session.user.id,
      institution_name: institution_name || 'Bank Account',
      plaid_access_token: access_token,
      plaid_item_id: item_id,
    }, { onConflict: 'plaid_item_id' })
    .select()
    .single()

  if (connErr) return NextResponse.json({ error: connErr.message }, { status: 500 })

  // Fetch accounts for this item
  const accountsRes = await fetch(`${plaidBase}/accounts/get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, secret, access_token }),
  })
  const accountsData = await accountsRes.json()

  if (accountsRes.ok && accountsData.accounts) {
    const accountRows = accountsData.accounts.map((a: {
      account_id: string; name: string; official_name: string;
      type: string; subtype: string; mask: string;
      balances: { current: number; available: number; iso_currency_code: string }
    }) => ({
      user_id: session.user.id,
      connection_id: conn.id,
      plaid_account_id: a.account_id,
      name: a.name,
      official_name: a.official_name,
      type: a.type,
      subtype: a.subtype,
      mask: a.mask,
      current_balance: a.balances.current,
      available_balance: a.balances.available,
      iso_currency_code: a.balances.iso_currency_code || 'USD',
      last_synced_at: new Date().toISOString(),
    }))

    await supabase.from('bank_accounts').upsert(accountRows, { onConflict: 'user_id,plaid_account_id' })
  }

  await logAudit(session.user.id, 'bank_connect', 'bank_connections', conn.id, { institution: institution_name, institution_id }, req)

  return NextResponse.json({
    success: true,
    connection_id: conn.id,
    institution_name: institution_name,
    accounts: accountsData.accounts?.length || 0,
  })
}
