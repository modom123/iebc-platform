import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Payment system is not yet configured. Please contact support at info@iebusinessconsultants.com.' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const {
      industryId,
      industryLabel,
      setupAmount,
      downPaymentAmount,
      name,
      email,
      phone,
      company,
      state,
    } = body as {
      industryId: string
      industryLabel: string
      setupAmount: number
      downPaymentAmount: number
      name: string
      email: string
      phone?: string
      company?: string
      state?: string
    }

    if (!name || !email || !industryLabel || !setupAmount || !downPaymentAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const deployAmount = Math.round(setupAmount * 0.50)
    const finalAmount = setupAmount - downPaymentAmount - deployAmount

    // Create Stripe customer
    const customer = await stripe.customers.create({
      name,
      email,
      phone: phone || undefined,
      metadata: {
        industry_id: industryId,
        industry_label: industryLabel,
        company: company || '',
        state: state || '',
        source: 'iebc_agency_checkout',
        total_setup_amount: String(setupAmount),
        down_payment: String(downPaymentAmount),
        deployment_payment: String(deployAmount),
        final_payment: String(finalAmount),
        payment_structure: '25/50/25 milestone',
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebusinessconsultants.com'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${industryLabel} — Down Payment (25%)`,
              description: [
                `IEBC custom ${industryLabel} system build.`,
                `Full setup fee: $${setupAmount.toLocaleString()} paid across 3 milestones:`,
                `• Today (25%): $${downPaymentAmount.toLocaleString()}`,
                `• Deployment phase (50%): $${deployAmount.toLocaleString()}`,
                `• Final delivery (25%): $${finalAmount.toLocaleString()}`,
              ].join(' '),
            },
            unit_amount: downPaymentAmount * 100, // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'agency_down_payment',
        industry_id: industryId,
        industry_label: industryLabel,
        setup_amount: String(setupAmount),
        down_payment: String(downPaymentAmount),
        deployment_payment: String(deployAmount),
        final_payment: String(finalAmount),
        customer_name: name,
        customer_email: email,
        company: company || '',
        state: state || '',
      },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      success_url: industryId === 'business_hub'
        ? `${appUrl}/checkout/hub/success?session_id={CHECKOUT_SESSION_ID}`
        : industryId.startsWith('website_')
          ? `${appUrl}/checkout/website/success?session_id={CHECKOUT_SESSION_ID}`
          : industryId.startsWith('bundle_')
            ? `${appUrl}/checkout/bundle/success?session_id={CHECKOUT_SESSION_ID}&bundle=${encodeURIComponent(industryLabel)}`
            : `${appUrl}/checkout/industry/${industryId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: industryId === 'business_hub'
        ? `${appUrl}/checkout/hub?canceled=true`
        : industryId.startsWith('website_')
          ? `${appUrl}/checkout/website?canceled=true`
          : industryId.startsWith('bundle_')
            ? `${appUrl}/checkout/bundle?canceled=true`
            : `${appUrl}/checkout/industry/${industryId}?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Agency Checkout Error:', error)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
