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
  silver:   'IEBC Financial Infrastructure — Silver',
  gold:     'IEBC Financial Infrastructure — Gold',
  platinum: 'IEBC Financial Infrastructure — Platinum',
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
    const { plan, email, businessName } = body as {
      plan: string
      email: string
      businessName?: string
    }

    if (!plan || !email) {
      return NextResponse.json({ error: 'Missing required fields: plan, email' }, { status: 400 })
    }

    if (!['silver', 'gold', 'platinum'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Create minimal customer — Stripe will fill in name/phone/address on checkout
    const customer = await stripe.customers.create({
      email,
      metadata: { plan, source: 'iebc_checkout', business_name: businessName || '' },
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
      // Stripe collects name, billing address, phone — no duplicate entry
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      // Write what the customer enters back onto the Stripe customer record
      customer_update: { name: 'auto', address: 'auto', shipping: 'auto' },
      metadata: {
        plan,
        customer_email: email,
        business_name: businessName || '',
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
