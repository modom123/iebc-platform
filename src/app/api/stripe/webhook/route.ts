import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan

    if (userId && plan) {
      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan,
        stripe_subscription_id: session.subscription,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const feeCents = Math.round((invoice.amount_paid ?? 0) * 0.0076)
    await supabase.from('iebc_fees').insert({
      payment_intent_id: invoice.payment_intent,
      gross_amount_cents: invoice.amount_paid,
      iebc_fee_cents: feeCents,
      status: 'succeeded',
    })
  }

  return NextResponse.json({ received: true })
}
