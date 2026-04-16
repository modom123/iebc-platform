import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Not paid yet — tell client to keep polling
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ ready: false })
    }

    const email = session.customer_details?.email ?? session.metadata?.customer_email ?? ''
    const name = session.customer_details?.name ?? session.metadata?.customer_name ?? ''
    const phone = session.customer_details?.phone ?? session.metadata?.customer_phone ?? ''
    const plan = session.metadata?.plan ?? session.client_reference_id ?? ''
    const password = session.metadata?.account_password ?? ''
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : ''
    const stripeSubId = typeof session.subscription === 'string' ? session.subscription : ''

    if (!email) {
      return NextResponse.json({ ready: false })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Supabase not configured — return email so client can show it
      return NextResponse.json({ ready: true, email, plan, password: '' })
    }

    const supabase = getAdminClient()

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    let userId: string

    if (existingProfile?.id) {
      userId = existingProfile.id
      // Update plan for existing user
      await supabase.from('profiles').update({
        plan,
        stripe_customer_id: stripeCustomerId,
      }).eq('id', userId)
    } else {
      // Create user with the password they chose during checkout
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: password || undefined,
        email_confirm: true,
        user_metadata: { full_name: name, plan, stripe_customer_id: stripeCustomerId },
      })

      if (createErr || !created?.user) {
        console.error('Failed to create user:', createErr)
        return NextResponse.json({ ready: false })
      }

      userId = created.user.id

      const billingAddress = {
        street: session.metadata?.billing_street ?? '',
        city: session.metadata?.billing_city ?? '',
        state: session.metadata?.billing_state ?? '',
        zip: session.metadata?.billing_zip ?? '',
      }

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

    // Upsert subscription record
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan,
      stripe_subscription_id: stripeSubId,
      stripe_customer_id: stripeCustomerId,
      status: 'trialing',
      current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ ready: true, email, plan, password })
  } catch (err) {
    console.error('Checkout complete error:', err)
    return NextResponse.json({ ready: false })
  }
}
