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
      // Upsert so re-subscriptions don't error
      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          plan,
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'user_id' }
      )
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const periodEnd = new Date((sub.current_period_end ?? 0) * 1000).toISOString()

    await supabase
      .from('subscriptions')
      .update({
        status: sub.status,
        current_period_end: periodEnd,
      })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription

    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const feeCents = Math.round((invoice.amount_paid ?? 0) * 0.0076)

    // Renew subscription period on successful payment
    if (invoice.subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription as string)
    }

    await supabase.from('iebc_fees').insert({
      payment_intent_id: invoice.payment_intent,
      gross_amount_cents: invoice.amount_paid,
      iebc_fee_cents: feeCents,
      status: 'succeeded',
    })
  }

  return NextResponse.json({ received: true })
}
