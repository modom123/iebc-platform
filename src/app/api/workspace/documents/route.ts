import { NextResponse } from 'next/server'

const BUCKET = 'workspace-docs'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

async function getSupabaseAndUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  const { createServerSupabaseClient } = await import('@/lib/supabase/server')
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  return { supabase, userId: session.user.id }
}

// GET: list documents, or get a signed URL
// ?order_id=X&advisor_id=Y  → filter docs
// ?id=X&action=url           → signed download URL
export async function GET(req: Request) {
  const ctx = await getSupabaseAndUser()
  if (!ctx) return NextResponse.json({ documents: [] })

  const { supabase, userId } = ctx
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const action = searchParams.get('action')
  const orderId = searchParams.get('order_id')
  const advisorId = searchParams.get('advisor_id')

  if (id && action === 'url') {
    const { data: doc } = await supabase
      .from('workspace_documents')
      .select('file_path')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.file_path, 3600)
    return NextResponse.json({ url: signed?.signedUrl })
  }

  try {
    let query = supabase
      .from('workspace_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (orderId) query = query.eq('order_id', orderId)
    if (advisorId) query = query.eq('advisor_id', advisorId)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ documents: data ?? [] })
  } catch {
    return NextResponse.json({ documents: [] })
  }
}

// POST: upload a document
export async function POST(req: Request) {
  const ctx = await getSupabaseAndUser()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { supabase, userId } = ctx
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const orderId = formData.get('order_id') as string
  const advisorId = formData.get('advisor_id') as string | null
  const advisorName = formData.get('advisor_name') as string | null
  const category = (formData.get('category') as string) || 'general'
  const description = (formData.get('description') as string) || ''

  if (!file || !orderId) return NextResponse.json({ error: 'Missing file or order_id' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const filePath = `${userId}/${orderId}/${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, arrayBuffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data, error: dbError } = await supabase
    .from('workspace_documents')
    .insert([{
      user_id: userId,
      order_id: orderId,
      advisor_id: advisorId || null,
      advisor_name: advisorName || null,
      uploader_role: 'client',
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      category,
      description,
    }])
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ document: data })
}

// DELETE: remove a document
export async function DELETE(req: Request) {
  const ctx = await getSupabaseAndUser()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { supabase, userId } = ctx
  const { id } = await req.json()

  const { data: doc } = await supabase
    .from('workspace_documents')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase.storage.from(BUCKET).remove([doc.file_path])
  await supabase.from('workspace_documents').delete().eq('id', id).eq('user_id', userId)
  return NextResponse.json({ success: true })
}
