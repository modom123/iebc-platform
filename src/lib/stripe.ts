import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getStripeInstance(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY environment variable is not configured. ' +
        'Add it to your Vercel project settings under Environment Variables.'
      )
    }
    _stripe = new Stripe(key, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return _stripe
}

// Lazy proxy — Stripe is only instantiated on first use, so a missing
// STRIPE_SECRET_KEY won't crash module load.  The error is thrown inside
// route handlers where it is caught by the try/catch and returned as a
// proper JSON error response.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = getStripeInstance() as any
    const value = instance[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
