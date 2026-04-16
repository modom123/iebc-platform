import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role key so we can create users + write to any table
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminClient()

  // ── 1. Checkout completed → create Supabase account + save profile ──
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const email = session.customer_details?.email ?? session.metadata?.customer_email ?? ''
    const name = session.customer_details?.name ?? session.metadata?.customer_name ?? ''
    const phone = session.customer_details?.phone ?? session.metadata?.customer_phone ?? ''
    // client_reference_id carries the plan when using direct Stripe payment links
    const plan = session.metadata?.plan ?? session.client_reference_id ?? ''
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : ''
    const stripeSubId = typeof session.subscription === 'string' ? session.subscription : ''

    const billingAddress = {
      street: session.metadata?.billing_street ?? '',
      city: session.metadata?.billing_city ?? '',
      state: session.metadata?.billing_state ?? '',
      zip: session.metadata?.billing_zip ?? '',
    }

    if (!email) {
      console.error('Webhook: no email in checkout session', session.id)
      return NextResponse.json({ received: true })
    }

    // Check if user already exists by querying profiles (avoids paginated listUsers)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    let userId: string

    if (existingProfile?.id) {
      userId = existingProfile.id
      // Existing user — update their plan info
      await supabase.from('profiles').update({
        plan,
        stripe_customer_id: stripeCustomerId,
        phone,
        billing_address: JSON.stringify(billingAddress),
      }).eq('id', userId)
    } else {
      // New user — send invite email so they can set their password
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebusinessconsultants.com'
      const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: name,
          plan,
          stripe_customer_id: stripeCustomerId,
        },
        redirectTo: `${appUrl}/auth/callback?next=/accounting`,
      })

      if (inviteErr || !invited?.user) {
        console.error('Failed to invite user:', inviteErr)
        return NextResponse.json({ received: true })
      }

      userId = invited.user.id

      // Save profile record
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: name,
        phone,
        plan,
        stripe_customer_id: stripeCustomerId,
        billing_address: JSON.stringify(billingAddress),
        role: 'user',
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    }

    // Save subscription record
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan,
      stripe_subscription_id: stripeSubId,
      stripe_customer_id: stripeCustomerId,
      status: 'trialing',
      current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    // Track IEBC fee (0.76% platform fee)
    if (session.amount_total && session.amount_total > 0) {
      const feeCents = Math.round(session.amount_total * 0.0076)
      await supabase.from('iebc_fees').insert({
        payment_intent_id: session.payment_intent ?? session.id,
        gross_amount_cents: session.amount_total,
        iebc_fee_cents: feeCents,
        status: 'succeeded',
      }).select().maybeSingle() // ignore if iebc_fees doesn't exist yet
    }
  }

  // ── 2. Subscription updated (active, trialing, past_due, etc.) ──
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const plan = (subscription.metadata?.plan as string) || ''
    const newStatus = subscription.status

    await supabase
      .from('subscriptions')
      .update({
        status: newStatus,
        plan: plan || undefined,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  // ── 3. Subscription cancelled → revoke access ──
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription

    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  // ── 4. Payment failed → mark past_due ──
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    if (invoice.subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription)
    }
  }

  // ── 5. Payment succeeded → ensure active + track fee ──
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice

    if (invoice.subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription)
    }

    // Track IEBC platform fee
    if ((invoice.amount_paid ?? 0) > 0) {
      const feeCents = Math.round((invoice.amount_paid ?? 0) * 0.0076)
      await supabase.from('iebc_fees').insert({
        payment_intent_id: invoice.payment_intent ?? invoice.id,
        gross_amount_cents: invoice.amount_paid,
        iebc_fee_cents: feeCents,
        status: 'succeeded',
      }).select().maybeSingle()
    }
  }

  return NextResponse.json({ received: true })
}
