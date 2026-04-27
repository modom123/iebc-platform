import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, business_name, industry, service_interest, message, source } = body

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Try hub_prospects table first (agency site's primary prospect table)
    const { error: prospectError } = await supabase
      .from('hub_prospects')
      .insert({
        name: name || '',
        email,
        business_name: business_name || '',
        industry: industry || '',
        service_interest: service_interest || '',
        message: message || '',
        source: source || 'website',
        status: 'new',
        created_at: new Date().toISOString(),
      })

    if (prospectError) {
      // Fallback: save to leads table if hub_prospects doesn't exist yet
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          business_name: business_name || name || email,
          contact_email: email,
          industry: industry || '',
          status: 'new',
          heat: 'warm',
        })

      if (leadError) {
        console.error('Lead capture error:', leadError.message)
        // Still return success to avoid exposing internal errors
      }
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Lead capture exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
