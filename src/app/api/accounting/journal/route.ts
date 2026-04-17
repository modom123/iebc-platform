import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*, journal_entry_lines(*)')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const enriched = (entries || []).map(e => ({
    ...e,
    lines: e.journal_entry_lines || [],
    total_debit: (e.journal_entry_lines || []).reduce((s: number, l: any) => s + Number(l.debit), 0),
    total_credit: (e.journal_entry_lines || []).reduce((s: number, l: any) => s + Number(l.credit), 0),
  }))

  return NextResponse.json({ entries: enriched })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const userId = session.user.id

  // Validate balance
  const totalDebit = (body.lines || []).reduce((s: number, l: any) => s + Number(l.debit || 0), 0)
  const totalCredit = (body.lines || []).reduce((s: number, l: any) => s + Number(l.credit || 0), 0)
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json({ error: 'Journal entry is not balanced — debits must equal credits' }, { status: 400 })
  }

  // Generate entry number
  const { count } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  const entryNumber = `JE-${String((count || 0) + 1).padStart(4, '0')}`

  const { data: entry, error: entryErr } = await supabase.from('journal_entries').insert({
    user_id: userId,
    entry_number: entryNumber,
    date: body.date,
    description: body.description,
    reference: body.reference || null,
    status: body.status || 'draft',
  }).select().single()

  if (entryErr) return NextResponse.json({ error: entryErr.message }, { status: 500 })

  const lineRows = (body.lines || [])
    .filter((l: any) => l.account_code || l.debit > 0 || l.credit > 0)
    .map((l: any) => ({
      journal_entry_id: entry.id,
      user_id: userId,
      account_code: l.account_code || '',
      account_name: l.account_name || '',
      description: l.description || '',
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
    }))

  if (lineRows.length > 0) {
    await supabase.from('journal_entry_lines').insert(lineRows)
  }

  return NextResponse.json({ entry })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...updates } = await req.json()
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}
