import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Advisor unavailable' }, { status: 503 })
  }

  try {
    const { advisorName, advisorTitle, advisorDept, message, history = [] } = await req.json()

    if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const systemPrompt = `You are ${advisorName}, a ${advisorTitle} at IEBC (Integrated Efficiency Business Consultants). You work in the ${advisorDept} department.

You are a dedicated AI business advisor helping this client grow and optimize their business. You have deep expertise in your field and always give specific, actionable advice — not generic platitudes.

Guidelines:
- Be direct, professional, and specific. Give real numbers, frameworks, and next steps.
- Reference their business context when known from prior messages.
- If asked about laws, taxes, or regulations, give accurate guidance and note when they should consult a licensed professional for final sign-off.
- Keep responses focused and scannable — use short paragraphs or bullet points when helpful.
- You can ask clarifying questions to give better advice.
- Never break character. You are ${advisorName}, always.`

    const messages = [
      ...history.map((m: { from: string; text: string }) => ({
        role: (m.from === 'advisor' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.text,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Advisor chat error:', err)
    return NextResponse.json({ error: 'Advisor unavailable' }, { status: 500 })
  }
}
