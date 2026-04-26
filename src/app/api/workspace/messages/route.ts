import { NextResponse } from 'next/server'

async function getSupabaseAndUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  const { createServerSupabaseClient } = await import('@/lib/supabase/server')
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  return { supabase, userId: session.user.id }
}

// Build advisor persona system prompt for AI reply
function advisorSystemPrompt(advisorName: string, advisorTitle: string): string {
  return `You are ${advisorName}, an expert ${advisorTitle} at IEBC (IE Business Consultants). You are a dedicated AI advisor assigned to this client's business.

Your role:
- Provide expert, actionable guidance in your domain
- Review documents, flag issues, and deliver strategic insights
- Communicate professionally but accessibly — clear, direct, and confident
- Reference specific details when the client shares them
- Proactively surface relevant concerns or opportunities

Keep responses concise (2-4 sentences max unless detail is explicitly needed). Sign off naturally as yourself, e.g., "— ${advisorName.split(' ')[0]}"`
}

// GET: fetch messages for a thread
// ?advisor_id=X&order_id=Y  → thread messages
// ?advisor_id=X             → latest message per advisor (for list view)
export async function GET(req: Request) {
  const ctx = await getSupabaseAndUser()
  if (!ctx) return NextResponse.json({ messages: [] })

  const { supabase, userId } = ctx
  const { searchParams } = new URL(req.url)
  const advisorId = searchParams.get('advisor_id')
  const orderId = searchParams.get('order_id')

  try {
    let query = supabase
      .from('advisor_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (advisorId) query = query.eq('advisor_id', advisorId)
    if (orderId) query = query.eq('order_id', orderId)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ messages: data ?? [] })
  } catch {
    return NextResponse.json({ messages: [] })
  }
}

// POST: send a message (and get an AI reply from the advisor)
export async function POST(req: Request) {
  const ctx = await getSupabaseAndUser()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { supabase, userId } = ctx
  const body = await req.json()
  const { order_id, advisor_id, advisor_name, advisor_title, content } = body

  if (!order_id || !advisor_id || !advisor_name || !content?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    // Store client message
    const { data: clientMsg, error: insertErr } = await supabase
      .from('advisor_messages')
      .insert([{
        user_id: userId,
        order_id,
        advisor_id,
        advisor_name,
        sender_role: 'client',
        content: content.trim(),
      }])
      .select()
      .single()

    if (insertErr) throw insertErr

    // Fetch conversation history for context
    const { data: history } = await supabase
      .from('advisor_messages')
      .select('sender_role, content')
      .eq('user_id', userId)
      .eq('advisor_id', advisor_id)
      .order('created_at', { ascending: true })
      .limit(20)

    // Generate AI reply from advisor persona
    let advisorReplyContent = ''
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk')
        const anthropic = new Anthropic({ apiKey })

        const messages = (history ?? []).map(m => ({
          role: m.sender_role === 'client' ? 'user' as const : 'assistant' as const,
          content: m.content,
        }))

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: advisorSystemPrompt(advisor_name, advisor_title ?? 'Business Advisor'),
          messages,
        })

        advisorReplyContent = (response.content[0] as { type: string; text: string }).text ?? ''
      } catch {
        advisorReplyContent = `Thanks for your message. I'll review this and get back to you shortly. — ${advisor_name.split(' ')[0]}`
      }
    } else {
      advisorReplyContent = `Thanks for your message. I'll review this and get back to you shortly. — ${advisor_name.split(' ')[0]}`
    }

    // Store advisor reply
    const { data: advisorMsg } = await supabase
      .from('advisor_messages')
      .insert([{
        user_id: userId,
        order_id,
        advisor_id,
        advisor_name,
        sender_role: 'advisor',
        content: advisorReplyContent,
      }])
      .select()
      .single()

    return NextResponse.json({ clientMessage: clientMsg, advisorReply: advisorMsg })
  } catch (err) {
    console.error('Messages error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
