import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      industry,
      industryLabel,
      plan,
      setupAmount,
      depositAmount,
      name,
      email,
      phone,
      company,
    } = body as {
      industry: string
      industryLabel: string
      plan: string
      setupAmount: number
      depositAmount: number
      name: string
      email: string
      phone?: string
      company?: string
    }

    if (!industry || !name || !email || !depositAmount) {
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
        industry,
        plan,
        project_type: 'agency_build',
      },
    })

    // One-time payment for 25% deposit
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `IEBC Agency Build — ${industryLabel} (${plan} Plan)`,
              description: `25% project deposit. Remaining: 50% at deployment, 25% at final delivery. Total project: $${setupAmount.toLocaleString()}`,
            },
            unit_amount: depositAmount * 100, // cents
          },
          quantity: 1,
        },
      ],
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      metadata: {
        checkout_type: 'project_deposit',
        industry,
        industry_label: industryLabel,
        plan,
        setup_amount: setupAmount.toString(),
        deposit_amount: depositAmount.toString(),
        deployment_amount: Math.round(setupAmount * 0.5).toString(),
        final_amount: Math.round(setupAmount * 0.25).toString(),
        customer_name: name,
        customer_email: email,
        customer_phone: phone || '',
        company: company || '',
      },
      success_url: `${appUrl}/accounting/checkout/success?type=project&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#industries`,
      allow_promotion_codes: false,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Project Checkout Error:', error)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
