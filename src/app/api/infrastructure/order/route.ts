import { NextResponse } from 'next/server'

const orders: Record<string, unknown>[] = []

function buildEmailHtml(order: Record<string, unknown>): string {
  const advisors = (order.advisors as { name: string; title: string; deptName: string; negotiatedRate?: number }[] | undefined) ?? []
  const contractors = (order.contractors as { name: string; title: string; deptName: string; rate: number; negotiatedRate?: number }[] | undefined) ?? []
  const team = advisors.length > 0 ? advisors : contractors

  const offerLines = team
    .filter(a => a.negotiatedRate != null)
    .map(a => `<li><strong>${a.name}</strong> (${a.title}) — offered <strong>$${a.negotiatedRate?.toLocaleString()}/mo</strong></li>`)
    .join('')

  const teamRows = team
    .map(a => {
      const listed = (a as { rate?: number }).rate
      const negotiated = a.negotiatedRate
      const rateLabel = negotiated
        ? `<span style="color:#C9A02E;font-weight:bold">$${negotiated.toLocaleString()}/mo (offered)</span>${listed ? ` <span style="color:#9ca3af;font-size:12px">listed $${listed.toLocaleString()}/mo</span>` : ''}`
        : listed
        ? `$${listed.toLocaleString()}/mo`
        : '—'
      return `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6">${a.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#6b7280">${a.title}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#6b7280">${a.deptName ?? ''}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6">${rateLabel}</td>
      </tr>`
    })
    .join('')

  const typeLabel = String(order.type ?? 'infrastructure').toUpperCase()
  const planLabel = order.plan ? ` — ${String(order.plan).charAt(0).toUpperCase() + String(order.plan).slice(1)} plan` : ''
  const hasOffers = offerLines.length > 0

  return `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fa;margin:0;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">

    <div style="background:#0B2140;padding:24px 28px">
      <p style="color:#C9A02E;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px">New Order — Action Required</p>
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0">${typeLabel}${planLabel}</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:6px 0 0">Order ID: ${order.id} · ${new Date(String(order.createdAt)).toLocaleString()}</p>
    </div>

    <div style="padding:24px 28px">

      ${hasOffers ? `
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:20px">
        <p style="font-weight:700;color:#92400e;margin:0 0 8px;font-size:13px">⚡ Salary Offers — Respond Within 2 Hours</p>
        <ul style="margin:0;padding-left:20px;color:#92400e;font-size:13px">
          ${offerLines}
        </ul>
      </div>
      ` : ''}

      <h2 style="font-size:14px;font-weight:700;color:#0B2140;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px">Client Information</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
        <tr><td style="padding:5px 0;color:#6b7280;width:140px">Name</td><td style="padding:5px 0;font-weight:600">${order.name ?? '—'}</td></tr>
        <tr><td style="padding:5px 0;color:#6b7280">Email</td><td style="padding:5px 0"><a href="mailto:${order.email}" style="color:#1D4ED8">${order.email ?? '—'}</a></td></tr>
        <tr><td style="padding:5px 0;color:#6b7280">Phone</td><td style="padding:5px 0">${order.phone || '—'}</td></tr>
        <tr><td style="padding:5px 0;color:#6b7280">Company</td><td style="padding:5px 0;font-weight:600">${order.company ?? order.business_name ?? '—'}</td></tr>
        ${order.notes ? `<tr><td style="padding:5px 0;color:#6b7280;vertical-align:top">Notes</td><td style="padding:5px 0;color:#374151">${order.notes}</td></tr>` : ''}
      </table>

      ${team.length > 0 ? `
      <h2 style="font-size:14px;font-weight:700;color:#0B2140;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px">Requested Advisors (${team.length})</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase">Name</th>
            <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase">Title</th>
            <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase">Dept</th>
            <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase">Rate</th>
          </tr>
        </thead>
        <tbody>${teamRows}</tbody>
      </table>
      ` : ''}

      <h2 style="font-size:14px;font-weight:700;color:#0B2140;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px">Order Summary</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
        ${order.duration ? `<tr><td style="padding:5px 0;color:#6b7280">Duration</td><td style="padding:5px 0;font-weight:600">${order.duration} month${Number(order.duration) !== 1 ? 's' : ''}</td></tr>` : ''}
        ${order.total ? `<tr><td style="padding:5px 0;color:#6b7280">Total Contract Value</td><td style="padding:5px 0;font-weight:800;color:#0B2140;font-size:16px">$${Number(order.total).toLocaleString()}</td></tr>` : ''}
        ${order.monthlyTotal ? `<tr><td style="padding:5px 0;color:#6b7280">Monthly</td><td style="padding:5px 0">$${Number(order.monthlyTotal).toLocaleString()}/mo</td></tr>` : ''}
        ${order.build ? `<tr><td style="padding:5px 0;color:#6b7280">Website Build</td><td style="padding:5px 0;font-weight:600">$${Number(order.build).toLocaleString()}</td></tr>` : ''}
        ${order.monthly ? `<tr><td style="padding:5px 0;color:#6b7280">Monthly Hosting</td><td style="padding:5px 0">$${Number(order.monthly).toLocaleString()}/mo</td></tr>` : ''}
      </table>

      <div style="background:#0B2140;border-radius:12px;padding:16px;text-align:center">
        <p style="color:#fff;font-weight:700;font-size:14px;margin:0 0 4px">Reply to this client within 2 hours</p>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0">Send the contract, confirm the team, and kick off onboarding.</p>
      </div>

    </div>
  </div>
</body>
</html>`
}

async function sendNotification(order: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY
  const notifyEmail = process.env.NOTIFY_EMAIL ?? 'admin@iebusinessconsultants.com'
  if (!apiKey) return

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const advisors = (order.advisors as { name: string }[] | undefined) ?? []
    const contractors = (order.contractors as { name: string }[] | undefined) ?? []
    const team = advisors.length > 0 ? advisors : contractors
    const hasOffers = [...advisors, ...contractors].some(a => (a as { negotiatedRate?: number }).negotiatedRate != null)

    const typeLabel = String(order.type ?? 'infrastructure')
    const subject = hasOffers
      ? `⚡ Salary Offer — ${order.name ?? order.email} wants ${team.length} advisor${team.length !== 1 ? 's' : ''}`
      : `🆕 New ${typeLabel} order — ${order.name ?? order.email} (${team.length > 0 ? `${team.length} advisor${team.length !== 1 ? 's' : ''}` : String(order.plan ?? '')})`

    await resend.emails.send({
      from: 'IEBC Orders <orders@iebusinessconsultants.com>',
      to: notifyEmail,
      reply_to: String(order.email ?? notifyEmail),
      subject,
      html: buildEmailHtml(order),
    })
  } catch (err) {
    console.error('Notification email failed:', err)
  }
}

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

    // Persist to Supabase if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createServerSupabaseClient } = await import('@/lib/supabase/server')
        const supabase = createServerSupabaseClient()
        await supabase.from('infrastructure_orders').insert([order])
      } catch {
        // Table may not exist yet — in-memory fallback is fine
      }
    }

    // Fire notification email (non-blocking)
    sendNotification(order)

    return NextResponse.json({ success: true, orderId: order.id })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET() {
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
