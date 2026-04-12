import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Map plan IDs to Stripe price IDs — set these in your Stripe dashboard
// then add the price IDs to your environment variables
const PRICE_IDS: Record<string, string> = {
  silver:   process.env.STRIPE_PRICE_SILVER   || 'price_silver_placeholder',
  gold:     process.env.STRIPE_PRICE_GOLD     || 'price_gold_placeholder',
  platinum: process.env.STRIPE_PRICE_PLATINUM || 'price_platinum_placeholder',
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const priceId = PRICE_IDS[plan]
    if (!priceId || priceId.includes('placeholder')) {
      return NextResponse.json({ error: 'Invalid plan or price not configured' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { user_id: session.user.id, plan },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/hub?subscribed=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/accounting/checkout?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
