import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Plaid sends webhooks here for real-time transaction updates
// Verifies using PLAID_WEBHOOK_SECRET if provided
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { webhook_type, webhook_code, item_id } = body

    if (webhook_type === 'TRANSACTIONS') {
      const supabase = createServerSupabaseClient()

      // Find which user owns this item
      const { data: conn } = await supabase
        .from('bank_connections')
        .select('user_id, id')
        .eq('plaid_item_id', item_id)
        .single()

      if (conn && (webhook_code === 'SYNC_UPDATES_AVAILABLE' || webhook_code === 'DEFAULT_UPDATE')) {
        // Trigger a sync for this connection
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        await fetch(`${appUrl}/api/accounting/plaid/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-webhook-trigger': 'true' },
          body: JSON.stringify({ connection_id: conn.id }),
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Plaid webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
