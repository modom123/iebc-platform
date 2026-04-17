import { NextResponse } from 'next/server'

// In-memory store for demo — replace with Supabase insert in production
const orders: Record<string, unknown>[] = []

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const order = {
      id: `infra_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...body,
    }
    orders.push(order)

    // If Supabase is configured, also persist there
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createServerSupabaseClient } = await import('@/lib/supabase/server')
        const supabase = createServerSupabaseClient()
        await supabase.from('infrastructure_orders').insert([order])
      } catch {
        // Table may not exist yet — in-memory fallback is fine
      }
    }

    return NextResponse.json({ success: true, orderId: order.id })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET() {
  // Try Supabase first
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const supabase = createServerSupabaseClient()
      const { data } = await supabase
        .from('infrastructure_orders')
        .select('*')
        .order('createdAt', { ascending: false })
      if (data) return NextResponse.json({ orders: data })
    } catch {
      // Fall through to in-memory
    }
  }
  return NextResponse.json({ orders })
}
