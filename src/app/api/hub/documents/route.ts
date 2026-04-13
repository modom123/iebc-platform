import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const BUCKET = 'documents'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  const action = req.nextUrl.searchParams.get('action')

  if (id && action === 'url') {
    const { data: doc } = await supabase
      .from('vault_documents')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, 300)
    return NextResponse.json({ url: data?.signedUrl || null })
  }

  const { data, error } = await supabase
    .from('vault_documents')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ documents: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const name = (formData.get('name') as string) || 'Untitled'
  const category = (formData.get('category') as string) || 'Other'
  const notes = (formData.get('notes') as string) || ''

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

  const ext = file.name.split('.').pop() || 'bin'
  const storagePath = `${session.user.id}/${Date.now()}-${name.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    // Fallback: store metadata only if storage bucket not set up yet
    const { data, error: dbErr } = await supabase.from('vault_documents').insert({
      user_id: session.user.id,
      name,
      category,
      notes: notes || null,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
    }).select().single()
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
    return NextResponse.json({ document: data })
  }

  const { data, error: dbErr } = await supabase.from('vault_documents').insert({
    user_id: session.user.id,
    name,
    category,
    notes: notes || null,
    file_type: file.type,
    file_size: file.size,
    storage_path: storagePath,
  }).select().single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ document: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const { data: doc } = await supabase
    .from('vault_documents')
    .select('storage_path')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (doc?.storage_path) {
    await supabase.storage.from(BUCKET).remove([doc.storage_path])
  }

  const { error } = await supabase
    .from('vault_documents')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
