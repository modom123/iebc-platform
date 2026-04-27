import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { lead_id, to_email, to_name, business_name, subject, body: emailBody } = body as {
    lead_id: string
    to_email: string
    to_name?: string
    business_name?: string
    subject: string
    body: string
  }

  if (!lead_id || !to_email || !subject || !emailBody) {
    return NextResponse.json({ error: 'lead_id, to_email, subject, and body are required.' }, { status: 400 })
  }

  const configured = !!process.env.RESEND_API_KEY
  let sent = false

  if (configured) {
    try {
      const htmlBody = emailBody
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'IEBC Team <outreach@iebusinessconsultants.com>',
          to: to_email,
          subject,
          text: emailBody,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;line-height:1.6;color:#333;">${htmlBody}</div>`,
        }),
      })
      sent = res.ok
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Resend error:', err)
      }
    } catch (e) {
      console.error('Resend fetch failed:', e)
    }
  }

  // Log to lead_activities (fail silently if table doesn't exist yet)
  await supabase.from('lead_activities').insert({
    lead_id,
    user_id: session.user.id,
    type: 'email_sent',
    subject,
    body: emailBody,
    metadata: { to_email, to_name, business_name, sent, configured },
  }).select().maybeSingle()

  // Auto-advance status: new → contacted
  await supabase.from('leads')
    .update({ status: 'contacted' })
    .eq('id', lead_id)
    .eq('status', 'new')
    .eq('user_id', session.user.id)

  return NextResponse.json({ sent, configured })
}

export async function GET(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const lead_id = searchParams.get('lead_id')
  if (!lead_id) return NextResponse.json({ activities: [] })

  const { data } = await supabase
    .from('lead_activities')
    .select('id, type, subject, metadata, created_at')
    .eq('lead_id', lead_id)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ activities: data || [] })
}
