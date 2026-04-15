import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

interface FormationService {
  id: string
  name: string
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
      notes,
    } = body as {
      services: FormationService[]
      total: number
      name: string
      email: string
      phone?: string
      company?: string
      state?: string
      notes?: string
    }

    if (!services?.length || !name || !email || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebusinessconsultants.com'

    // Create Stripe customer
    const customer = await stripe.customers.create({
      name,
      email,
      phone: phone || undefined,
      metadata: {
        company: company || '',
        state: state || '',
        project_type: 'formation',
        services: services.map(s => s.id).join(','),
      },
    })

    // Build line items — one per selected service
    const lineItems = services.map(service => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Business Formation — ${service.name}`,
          description: state ? `State: ${state}${company ? ` · Entity: ${company}` : ''}` : undefined,
        },
        unit_amount: service.price * 100, // dollars → cents
      },
      quantity: 1,
    }))

    const serviceList = services.map(s => s.name).join(', ')

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: lineItems,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      metadata: {
        checkout_type: 'formation',
        customer_name: name,
        customer_email: email,
        customer_phone: phone || '',
        company: company || '',
        state: state || '',
        notes: (notes || '').slice(0, 500), // Stripe metadata 500 char limit
        services: serviceList.slice(0, 500),
        total: total.toString(),
      },
      success_url: `${appUrl}/accounting/checkout/success?type=formation&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/formation`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Formation Checkout Error:', error)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
