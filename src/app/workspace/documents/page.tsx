'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Doc = {
  id: string
  file_name: string
  file_type: string
  file_size: number
  category: string
  description: string
  uploader_role: 'client' | 'advisor'
  advisor_name: string | null
  order_id: string
  created_at: string
}

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'text/plain': '📃',
}

const CATEGORIES = ['Contracts', 'Reports', 'Invoices', 'Tax Documents', 'Financials', 'HR', 'Legal', 'Other']

function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const DARK = '#0B2140'

export default function WorkspaceDocumentsPage() {
  const searchParams = useSearchParams()
  const defaultOrderId = searchParams.get('order_id') ?? ''
  const defaultAdvisorId = searchParams.get('advisor_id') ?? ''
  const defaultAdvisorName = searchParams.get('advisor_name') ?? ''

  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [filter, setFilter] = useState<'all' | 'client' | 'advisor'>('all')
  const [msg, setMsg] = useState('')
  const [uploadForm, setUploadForm] = useState({
    order_id: defaultOrderId,
    category: 'Other',
    description: '',
  })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchDocs() }, [])

  async function fetchDocs() {
    setLoading(true)
    try {
      let url = '/api/workspace/documents'
      const params = new URLSearchParams()
      if (defaultOrderId) params.set('order_id', defaultOrderId)
      if (defaultAdvisorId) params.set('advisor_id', defaultAdvisorId)
      if (params.toString()) url += '?' + params.toString()
      const res = await fetch(url)
      if (res.ok) {
        const d = await res.json()
        setDocs(d.documents ?? [])
      }
    } catch { /* non-blocking */ }
    setLoading(false)
  }

  function handleFileSelect(file: File) {
    setSelectedFile(file)
    setShowUpload(true)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile || !uploadForm.order_id) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('order_id', uploadForm.order_id)
    formData.append('category', uploadForm.category)
    formData.append('description', uploadForm.description)
    if (defaultAdvisorId) {
      formData.append('advisor_id', defaultAdvisorId)
      formData.append('advisor_name', defaultAdvisorName)
    }

    const res = await fetch('/api/workspace/documents', { method: 'POST', body: formData })
    if (res.ok) {
      setMsg('Document uploaded successfully.')
      setShowUpload(false)
      setSelectedFile(null)
      setUploadForm(p => ({ ...p, category: 'Other', description: '' }))
      fetchDocs()
    } else {
      const d = await res.json()
      setMsg(d.error || 'Upload failed.')
    }
    setUploading(false)
    setTimeout(() => setMsg(''), 4000)
  }

  async function deleteDoc(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch('/api/workspace/documents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchDocs()
  }

  async function downloadDoc(doc: Doc) {
    const res = await fetch(`/api/workspace/documents?id=${doc.id}&action=url`)
    const d = await res.json()
    if (d.url) window.open(d.url, '_blank')
  }

  const filtered = docs.filter(d => {
    if (filter === 'client') return d.uploader_role === 'client'
    if (filter === 'advisor') return d.uploader_role === 'advisor'
    return true
  })

  const advisorDocs = docs.filter(d => d.uploader_role === 'advisor').length
  const clientDocs = docs.filter(d => d.uploader_role === 'client').length

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {defaultAdvisorName ? `Files shared with ${defaultAdvisorName}` : 'All workspace documents'}
          </p>
        </div>
        <button
          onClick={() => { setShowUpload(true); setSelectedFile(null) }}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition shadow-sm"
          style={{ background: DARK }}
        >
          + Upload
        </button>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.includes('failed') || msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: docs.length, key: 'all' },
          { label: 'Advisor Deliverables', value: advisorDocs, key: 'advisor' },
          { label: 'Shared by Me', value: clientDocs, key: 'client' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key as 'all' | 'client' | 'advisor')}
            className={`bg-white rounded-xl border p-4 text-left transition ${filter === s.key ? 'border-[#0B2140] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <p className="text-2xl font-extrabold" style={{ color: DARK }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Upload Document</h3>
            <button onClick={() => { setShowUpload(false); setSelectedFile(null) }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>

          {!selectedFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${dragOver ? 'border-[#0B2140] bg-blue-50' : 'border-gray-200 hover:border-[#0B2140] hover:bg-blue-50'}`}
            >
              <p className="text-4xl mb-2">📁</p>
              <p className="font-medium text-gray-700 text-sm">Drop file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, Images — up to 10MB</p>
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.txt"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-2xl">{FILE_ICONS[selectedFile.type] || '📎'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{fmtSize(selectedFile.size)}</p>
                </div>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]"
                    value={uploadForm.category}
                    onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Description</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]"
                    placeholder="Optional note…"
                    value={uploadForm.description}
                    onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading}
                  className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50 transition"
                  style={{ background: DARK }}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
                <button type="button" onClick={() => { setShowUpload(false); setSelectedFile(null) }}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">▤</p>
          <p className="font-bold text-gray-800 mb-1">No documents yet</p>
          <p className="text-sm text-gray-500 mb-5">Upload contracts, reports, or any file for your advisor team.</p>
          <button onClick={() => setShowUpload(true)}
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: DARK }}>
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 hover:border-[#0B2140] hover:shadow-sm transition group">
              <span className="text-2xl shrink-0 mt-0.5">{FILE_ICONS[doc.file_type] || '📎'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{doc.file_name}</p>
                <div className="flex flex-wrap gap-2 items-center mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${doc.uploader_role === 'advisor' ? 'bg-blue-50 text-[#0B2140]' : 'bg-gray-100 text-gray-600'}`}>
                    {doc.uploader_role === 'advisor' ? `From ${doc.advisor_name ?? 'Advisor'}` : 'Uploaded by you'}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px]">{doc.category}</span>
                  <span className="text-[10px] text-gray-400">{fmtSize(doc.file_size)}</span>
                  <span className="text-[10px] text-gray-400">{fmtDate(doc.created_at)}</span>
                </div>
                {doc.description && <p className="text-xs text-gray-400 mt-1 truncate">{doc.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => downloadDoc(doc)}
                  title="Download"
                  className="p-1.5 text-gray-400 hover:text-[#0B2140] hover:bg-blue-50 rounded-lg transition text-sm">
                  ⬇️
                </button>
                {doc.uploader_role === 'client' && (
                  <button onClick={() => deleteDoc(doc.id, doc.file_name)}
                    title="Delete"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition text-sm">
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advisor deliverables callout */}
      {advisorDocs === 0 && docs.length > 0 && (
        <div className="rounded-xl p-4 border border-dashed border-gray-300 text-center">
          <p className="text-sm text-gray-500">Advisor deliverables (reports, analyses) will appear here once your team submits them.</p>
        </div>
      )}

      {/* Back link if filtered by advisor */}
      {defaultAdvisorName && (
        <div className="pt-2">
          <Link href="/workspace/documents" className="text-xs font-semibold text-gray-400 hover:text-[#0B2140] transition">
            ← View all workspace documents
          </Link>
        </div>
      )}
    </div>
  )
}
