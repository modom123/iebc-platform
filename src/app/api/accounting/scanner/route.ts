import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, or GIF images are supported' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 })
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `You are a receipt/invoice scanning assistant for an accounting system.
Analyze this image and extract the following fields. Respond ONLY with a valid JSON object — no markdown, no explanation.

{
  "vendor": "vendor/business name (string)",
  "amount": total amount as number (e.g. 42.50),
  "date": "date in YYYY-MM-DD format or null",
  "category": "one of: Revenue, Consulting, Product Sale, Payroll, Marketing, Software / SaaS, Office & Supplies, Travel, Legal & Professional, Taxes, Meals & Entertainment, Utilities, Insurance, Other Income, Other Expense",
  "type": "income or expense",
  "description": "brief description of what this is (max 80 chars)",
  "confidence": "high, medium, or low"
}

If a field cannot be determined, use null. Be conservative — if the image is not a receipt or invoice, return {"error": "Not a receipt or invoice"}.`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    let extracted: Record<string, unknown>
    try {
      extracted = JSON.parse(text)
    } catch {
      // Try to extract JSON from the response
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        extracted = JSON.parse(match[0])
      } else {
        return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
      }
    }

    if (extracted.error) {
      return NextResponse.json({ error: extracted.error }, { status: 422 })
    }

    return NextResponse.json({
      vendor: extracted.vendor ?? null,
      amount: extracted.amount ?? null,
      date: extracted.date ?? new Date().toISOString().split('T')[0],
      category: extracted.category ?? 'Other Expense',
      type: extracted.type ?? 'expense',
      description: extracted.description ?? `Payment to ${extracted.vendor ?? 'vendor'}`,
      confidence: extracted.confidence ?? 'medium',
    })
  } catch (err) {
    console.error('Scanner error:', err)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
