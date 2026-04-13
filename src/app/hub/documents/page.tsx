'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Document = {
  id: string
  name: string
  category: string
  file_type: string
  file_size: number
  storage_path: string
  notes: string
  created_at: string
}

const CATEGORIES = [
  'All',
  'Contracts',
  'Tax Documents',
  'Receipts',
  'Invoices',
  'Business Formation',
  'Insurance',
  'HR / Payroll',
  'Legal',
  'Other',
]

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/webp': '🖼️',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'text/plain': '📃',
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DocumentVaultPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [msg, setMsg] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadForm, setUploadForm] = useState({ category: 'Other', notes: '', name: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchDocs() }, [])

  async function fetchDocs() {
    setLoading(true)
    const res = await fetch('/api/hub/documents')
    const data = await res.json()
    setDocs(data.documents || [])
    setLoading(false)
  }

  function handleFileSelect(file: File) {
    setSelectedFile(file)
    setUploadForm(p => ({ ...p, name: file.name.replace(/\.[^.]+$/, '') }))
    setShowUpload(true)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)
    setUploadProgress(10)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('name', uploadForm.name || selectedFile.name)
    formData.append('category', uploadForm.category)
    formData.append('notes', uploadForm.notes)

    setUploadProgress(40)
    const res = await fetch('/api/hub/documents', { method: 'POST', body: formData })
    setUploadProgress(90)

    if (res.ok) {
      setMsg('Document uploaded!')
      setShowUpload(false)
      setSelectedFile(null)
      setUploadForm({ category: 'Other', notes: '', name: '' })
      fetchDocs()
    } else {
      const data = await res.json()
      setMsg(data.error || 'Upload failed')
    }
    setUploading(false)
    setUploadProgress(0)
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteDoc(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch('/api/hub/documents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchDocs()
  }

  async function downloadDoc(doc: Document) {
    const res = await fetch(`/api/hub/documents?id=${doc.id}&action=url`)
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
  }

  const filtered = docs.filter(d => {
    const matchCat = category === 'All' || d.category === category
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.notes || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const categoryCounts = CATEGORIES.slice(1).reduce((acc, cat) => {
    acc[cat] = docs.filter(d => d.category === cat).length
    return acc
  }, {} as Record<string, number>)

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Document Vault</span>
        </div>
        <button onClick={() => { setShowUpload(true); setSelectedFile(null) }}
          className="bg-[#0F4C81] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-800 transition">
          Upload Document
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.includes('Error') || msg.includes('failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {msg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Documents', value: String(docs.length), color: 'text-[#0F4C81]' },
            { label: 'Contracts', value: String(categoryCounts['Contracts'] || 0), color: 'text-gray-700' },
            { label: 'Tax Documents', value: String(categoryCounts['Tax Documents'] || 0), color: 'text-orange-600' },
            { label: 'Total Size', value: fmtSize(docs.reduce((s, d) => s + (d.file_size || 0), 0)), color: 'text-gray-700' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar: Categories */}
          <div className="w-44 shrink-0 space-y-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex justify-between items-center ${
                  category === cat ? 'bg-[#0F4C81] text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <span className="truncate">{cat}</span>
                <span className={`text-xs ${category === cat ? 'text-blue-200' : 'text-gray-400'}`}>
                  {cat === 'All' ? docs.length : (categoryCounts[cat] || 0)}
                </span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">

            {/* Upload Form */}
            {showUpload && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Upload Document</h3>

                {/* Drop Zone */}
                {!selectedFile ? (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${dragOver ? 'border-[#0F4C81] bg-blue-50' : 'border-gray-200 hover:border-[#0F4C81] hover:bg-blue-50'}`}>
                    <p className="text-4xl mb-2">📁</p>
                    <p className="font-medium text-gray-700">Drop file here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, Images up to 10MB</p>
                    <input ref={fileRef} type="file" className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.txt"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
                  </div>
                ) : (
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-2xl">{FILE_ICONS[selectedFile.type] || '📎'}</span>
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{fmtSize(selectedFile.size)}</p>
                      </div>
                      <button type="button" onClick={() => { setSelectedFile(null); setUploadForm(p => ({ ...p, name: '' })) }}
                        className="ml-auto text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-sm">Document Name</label>
                        <input className="input-field" value={uploadForm.name}
                          onChange={e => setUploadForm(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label-sm">Category</label>
                        <select className="input-field" value={uploadForm.category}
                          onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}>
                          {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="label-sm">Notes (optional)</label>
                        <input className="input-field" placeholder="e.g. Vendor contract signed Jan 2026..."
                          value={uploadForm.notes}
                          onChange={e => setUploadForm(p => ({ ...p, notes: e.target.value }))} />
                      </div>
                    </div>
                    {uploading && (
                      <div className="space-y-1">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0F4C81] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 text-center">Uploading...</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button type="submit" disabled={uploading}
                        className="bg-[#0F4C81] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                      <button type="button" onClick={() => { setShowUpload(false); setSelectedFile(null) }}
                        className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Search */}
            <div>
              <input className="input-field" placeholder="Search documents..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Documents Grid */}
            {loading ? (
              <div className="p-12 text-center text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-4xl mb-3">📁</p>
                <p className="text-gray-500 font-medium">No documents yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">Upload contracts, tax docs, receipts, and more</p>
                <button onClick={() => setShowUpload(true)} className="btn-primary text-sm">Upload First Document</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3 hover:border-[#0F4C81] transition group">
                    <span className="text-3xl shrink-0 mt-0.5">{FILE_ICONS[doc.file_type] || '📎'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <div className="flex gap-2 items-center mt-1 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-[#0F4C81] rounded text-xs">{doc.category}</span>
                        <span className="text-xs text-gray-400">{fmtSize(doc.file_size)}</span>
                        <span className="text-xs text-gray-400">{fmtDate(doc.created_at)}</span>
                      </div>
                      {doc.notes && <p className="text-xs text-gray-400 mt-1 truncate">{doc.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => downloadDoc(doc)}
                        title="Download"
                        className="p-1.5 text-gray-400 hover:text-[#0F4C81] hover:bg-blue-50 rounded-lg transition">
                        ⬇️
                      </button>
                      <button onClick={() => deleteDoc(doc.id, doc.name)}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
