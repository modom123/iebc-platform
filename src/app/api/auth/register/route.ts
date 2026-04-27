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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      password,
      phone,
      business_name,
      billing_address,
    } = body as {
      name: string
      email: string
      password: string
      phone?: string
      business_name?: string
      billing_address?: { street: string; city: string; state: string; zip: string }
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Create Supabase user — email_confirm: false sends a verification email
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: name },
    })

    if (createErr || !created.user) {
      // Friendly duplicate-email message
      if (createErr?.message?.toLowerCase().includes('already')) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 })
      }
      return NextResponse.json({ error: createErr?.message ?? 'Failed to create account.' }, { status: 400 })
    }

    const userId = created.user.id
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebusinessconsultants.com'

    // 2. Create Stripe customer with full profile info
    const customer = await stripe.customers.create({
      name,
      email,
      phone: phone || undefined,
      address: billing_address ? {
        line1: billing_address.street,
        city: billing_address.city,
        state: billing_address.state,
        postal_code: billing_address.zip,
        country: 'US',
      } : undefined,
      metadata: {
        supabase_user_id: userId,
        business_name: business_name || '',
        source: 'signup',
      },
    })

    // 3. Save full profile to Supabase
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: name,
      phone: phone || null,
      business_name: business_name || null,
      stripe_customer_id: customer.id,
      billing_address: billing_address ? JSON.stringify(billing_address) : null,
      role: 'user',
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    // 4. Create Stripe Checkout Session in setup mode to save a card on file
    //    (no charge — card saved for future upsells/subscriptions)
    const setupSession = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customer.id,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      metadata: {
        setup_type: 'signup_card_save',
        user_id: userId,
      },
      success_url: `${appUrl}/accounting?welcome=1`,
      cancel_url:  `${appUrl}/accounting?welcome=1&card_skipped=1`,
    })

    return NextResponse.json({ setupUrl: setupSession.url, emailVerificationRequired: true })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
