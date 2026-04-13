import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('journal_entries')
    .select(`
      *,
      journal_entry_lines (
        id, account_id, description, debit, credit,
        accounts ( code, name, type )
      )
    `)
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { date, description, reference, lines } = body

  if (!description || !lines || lines.length < 2) {
    return NextResponse.json({ error: 'description and at least 2 lines required' }, { status: 400 })
  }

  const totalDebits = lines.reduce((s: number, l: { debit: number }) => s + Number(l.debit || 0), 0)
  const totalCredits = lines.reduce((s: number, l: { credit: number }) => s + Number(l.credit || 0), 0)
  if (Math.abs(totalDebits - totalCredits) > 0.005) {
    return NextResponse.json({ error: 'Debits must equal credits' }, { status: 400 })
  }

  // Generate entry number
  const { count } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
  const entryNumber = `JE-${String((count || 0) + 1).padStart(4, '0')}`

  const { data: entry, error: entryErr } = await supabase
    .from('journal_entries')
    .insert({
      user_id: session.user.id,
      entry_number: entryNumber,
      date: date || new Date().toISOString().split('T')[0],
      description,
      reference: reference || null,
    })
    .select()
    .single()

  if (entryErr) return NextResponse.json({ error: entryErr.message }, { status: 500 })

  const lineRows = lines.map((l: { account_id: string; description: string; debit: number; credit: number }) => ({
    journal_entry_id: entry.id,
    account_id: l.account_id,
    description: l.description || null,
    debit: Number(l.debit) || 0,
    credit: Number(l.credit) || 0,
  }))

  const { error: linesErr } = await supabase.from('journal_entry_lines').insert(lineRows)
  if (linesErr) return NextResponse.json({ error: linesErr.message }, { status: 500 })

  return NextResponse.json({ ...entry, journal_entry_lines: lineRows }, { status: 201 })
}

export async function DELETE(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id!)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
