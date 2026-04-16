import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const PRICE_IDS: Record<string, string> = {
  silver:   process.env.STRIPE_PRICE_SILVER   || '',
  gold:     process.env.STRIPE_PRICE_GOLD     || '',
  platinum: process.env.STRIPE_PRICE_PLATINUM || '',
}

const PLAN_AMOUNTS: Record<string, number> = {
  silver:   900,
  gold:     2200,
  platinum: 4200,
}

const PLAN_NAMES: Record<string, string> = {
  silver:   'IEBC Efficient SaaS — Silver',
  gold:     'IEBC Efficient SaaS — Gold',
  platinum: 'IEBC Efficient SaaS — Platinum',
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Payment system is not yet configured. Please contact support at info@iebusinessconsultants.com.' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { plan, name, email, phone, password, billing_address } = body as {
      plan: string
      name: string
      email: string
      phone?: string
      password?: string
      billing_address?: { street: string; city: string; state: string; zip: string }
    }

    if (!plan || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields: plan, name, email' }, { status: 400 })
    }

    if (!['silver', 'gold', 'platinum'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

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
      metadata: { plan, source: 'iebc_checkout' },
    })

    const priceId = PRICE_IDS[plan]
    const hasPrice = priceId && priceId.trim() !== ''

    const lineItems = hasPrice
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency: 'usd',
            product_data: { name: PLAN_NAMES[plan] },
            unit_amount: PLAN_AMOUNTS[plan],
            recurring: { interval: 'month' as const },
          },
          quantity: 1,
        }]

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebusinessconsultants.com'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: lineItems,
      subscription_data: {
        trial_period_days: 7,
        metadata: { plan },
      },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      metadata: {
        plan,
        customer_name: name,
        customer_email: email,
        customer_phone: phone || '',
        // password stored in metadata so success page can create account immediately
        account_password: password || '',
        billing_street: billing_address?.street || '',
        billing_city: billing_address?.city || '',
        billing_state: billing_address?.state || '',
        billing_zip: billing_address?.zip || '',
      },
      success_url: `${appUrl}/accounting/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/accounting/checkout?canceled=true`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    const message = error instanceof Error ? error.message : 'Checkout failed. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
