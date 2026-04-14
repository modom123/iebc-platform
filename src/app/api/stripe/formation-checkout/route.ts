import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

type ServiceItem = {
  id: string
  label: string
  price: number
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      services,
      total,
      name,
      email,
      phone,
      company,
      state,
    } = body as {
      services: ServiceItem[]
      total: number
      name: string
      email: string
      phone?: string
      company?: string
      state?: string
    }

    if (!name || !email || !services || services.length === 0 || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 })
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      name,
      email,
      phone: phone || undefined,
      metadata: {
        source: 'iebc_formation_checkout',
        company: company || '',
        state: state || '',
        services: services.map(s => s.id).join(','),
        service_count: String(services.length),
        total_amount: String(total),
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebusinessconsultants.com'

    // Build line items — one per service
    const lineItems = services.map(s => ({
      price_data: {
        currency: 'usd' as const,
        product_data: {
          name: `IEBC ${s.label}`,
        },
        unit_amount: s.price * 100, // cents
      },
      quantity: 1 as const,
    }))

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: lineItems,
      metadata: {
        type: 'formation_checkout',
        services: services.map(s => s.id).join(','),
        total: String(total),
        customer_name: name,
        customer_email: email,
        company: company || '',
        state: state || '',
      },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      success_url: `${appUrl}/checkout/formation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/formation?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Formation Checkout Error:', error)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
