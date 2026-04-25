import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
const IMAGE_LIMIT = 10 * 1024 * 1024   // 10 MB
const PDF_LIMIT   = 20 * 1024 * 1024   // 20 MB

const EXTRACT_PROMPT = `You are an expert accounting assistant scanning a financial document (receipt, invoice, or bill).

Extract every field you can find. Respond ONLY with a valid JSON object — no markdown, no explanation, no code fences.

{
  "vendor": "vendor or business name (string or null)",
  "amount": total amount as a number (e.g. 42.50, do not include currency symbol),
  "date": "date in YYYY-MM-DD format or null",
  "category": "one of: Revenue, Consulting, Product Sale, Payroll, Marketing, Software / SaaS, Office & Supplies, Travel, Legal & Professional, Taxes, Meals & Entertainment, Utilities, Insurance, Shipping, Rent, Equipment, Other Income, Other Expense",
  "type": "income or expense",
  "description": "concise description max 80 chars — include what was purchased/sold",
  "line_items": [{"description": "...", "qty": 1, "unit_price": 0.00, "amount": 0.00}],
  "tax_amount": tax amount as number or null,
  "subtotal": subtotal before tax as number or null,
  "invoice_number": "invoice or receipt number as string or null",
  "confidence": "high, medium, or low"
}

Rules:
- Use the TOTAL amount (after tax) for the "amount" field
- For receipts from stores use "expense"; for sales invoices use "income"
- If the document is not a financial document, return: {"error": "Not a financial document"}
- Be thorough — multi-page PDFs may have totals on the last page
- line_items: include all line items if visible, otherwise return []`

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI scanner is not configured' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const isPdf   = file.type === 'application/pdf'
    const isImage = IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/')

    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload a JPG, PNG, WebP, HEIC image or a PDF.' },
        { status: 400 }
      )
    }

    const limit = isPdf ? PDF_LIMIT : IMAGE_LIMIT
    if (file.size > limit) {
      return NextResponse.json(
        { error: `File too large. Maximum ${isPdf ? '20MB for PDFs' : '10MB for images'}.` },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Build content block — document for PDFs, image for everything else
    const fileBlock = isPdf
      ? ({
          type: 'document' as const,
          source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 },
        } as Parameters<typeof anthropic.messages.create>[0]['messages'][0]['content'][number])
      : ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: (file.type.startsWith('image/') ? file.type : 'image/jpeg') as
              'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            data: base64,
          },
        } as Parameters<typeof anthropic.messages.create>[0]['messages'][0]['content'][number])

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            fileBlock,
            { type: 'text', text: EXTRACT_PROMPT },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    let extracted: Record<string, unknown>
    try {
      extracted = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        extracted = JSON.parse(match[0])
      } else {
        return NextResponse.json({ error: 'AI could not read this document. Try a clearer image.' }, { status: 422 })
      }
    }

    if (extracted.error) {
      return NextResponse.json({ error: extracted.error }, { status: 422 })
    }

    return NextResponse.json({
      vendor:          extracted.vendor         ?? null,
      amount:          extracted.amount         ?? null,
      date:            extracted.date           ?? new Date().toISOString().split('T')[0],
      category:        extracted.category       ?? 'Other Expense',
      type:            extracted.type           ?? 'expense',
      description:     extracted.description    ?? `Payment to ${extracted.vendor ?? 'vendor'}`,
      line_items:      Array.isArray(extracted.line_items) ? extracted.line_items : [],
      tax_amount:      extracted.tax_amount     ?? null,
      subtotal:        extracted.subtotal       ?? null,
      invoice_number:  extracted.invoice_number ?? null,
      confidence:      extracted.confidence     ?? 'medium',
    })
  } catch (err) {
    console.error('Scanner error:', err)
    return NextResponse.json({ error: 'Failed to process document. Please try again.' }, { status: 500 })
  }
}
