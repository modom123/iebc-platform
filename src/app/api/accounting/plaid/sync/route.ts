import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

// Syncs transactions for all or a specific Plaid connection using /transactions/sync
export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { connection_id } = await req.json().catch(() => ({}))

  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  const env = process.env.PLAID_ENV || 'sandbox'
  const plaidBase = `https://${env}.plaid.com`

  // Get connections to sync
  let connQuery = supabase.from('bank_connections').select('*').eq('user_id', session.user.id)
  if (connection_id) connQuery = connQuery.eq('id', connection_id)
  const { data: connections } = await connQuery

  if (!connections?.length) return NextResponse.json({ error: 'No connections found' }, { status: 404 })

  let totalAdded = 0, totalModified = 0, totalRemoved = 0

  for (const conn of connections) {
    // Get existing cursor
    const { data: cursorRow } = await supabase
      .from('plaid_sync_cursors')
      .select('cursor')
      .eq('connection_id', conn.id)
      .single()

    let cursor = cursorRow?.cursor || undefined
    let hasMore = true

    while (hasMore) {
      const syncRes = await fetch(`${plaidBase}/transactions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          secret,
          access_token: conn.plaid_access_token,
          cursor,
          count: 500,
        }),
      })

      const syncData = await syncRes.json()
      if (!syncRes.ok) {
        console.error('Plaid sync error:', syncData.error_message)
        break
      }

      // Insert added transactions
      if (syncData.added?.length) {
        const rows = syncData.added.map((t: {
          transaction_id: string; date: string; name: string;
          amount: number; category: string[]; merchant_name: string;
          account_id: string; iso_currency_code: string
        }) => ({
          user_id: session.user.id,
          date: t.date,
          description: t.name,
          amount: Math.abs(t.amount),
          type: t.amount > 0 ? 'expense' : 'income',
          category: t.category?.[0] || 'Uncategorized',
          vendor: t.merchant_name || t.name,
          plaid_transaction_id: t.transaction_id,
          currency: t.iso_currency_code || 'USD',
          reconciled: false,
        }))

        await supabase.from('transactions')
          .upsert(rows, { onConflict: 'plaid_transaction_id', ignoreDuplicates: true })
        totalAdded += rows.length
      }

      // Update modified transactions
      if (syncData.modified?.length) {
        for (const t of syncData.modified) {
          await supabase.from('transactions')
            .update({
              description: t.name,
              amount: Math.abs(t.amount),
              category: t.category?.[0] || 'Uncategorized',
            })
            .eq('plaid_transaction_id', t.transaction_id)
            .eq('user_id', session.user.id)
        }
        totalModified += syncData.modified.length
      }

      // Remove deleted
      if (syncData.removed?.length) {
        for (const t of syncData.removed) {
          await supabase.from('transactions')
            .delete()
            .eq('plaid_transaction_id', t.transaction_id)
            .eq('user_id', session.user.id)
        }
        totalRemoved += syncData.removed.length
      }

      cursor = syncData.next_cursor
      hasMore = syncData.has_more

      // Save cursor
      await supabase.from('plaid_sync_cursors').upsert({
        user_id: session.user.id,
        connection_id: conn.id,
        cursor,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'connection_id' })
    }

    // Update last_synced_at
    await supabase.from('bank_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', conn.id)
  }

  await logAudit(session.user.id, 'sync', 'transactions', undefined, { added: totalAdded, modified: totalModified, removed: totalRemoved }, req)

  return NextResponse.json({ success: true, added: totalAdded, modified: totalModified, removed: totalRemoved })
}
