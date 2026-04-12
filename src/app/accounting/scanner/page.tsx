'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'

type ScanResult = {
  vendor: string | null
  amount: number | null
  date: string | null
  category: string
  type: 'income' | 'expense'
  description: string
  confidence: 'high' | 'medium' | 'low'
}

const CONFIDENCE_STYLES = {
  high:   'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-red-100 text-red-600',
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function ScannerPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Partial<ScanResult> & { description: string }>({ description: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setResult(null)
    setError('')
    setSaved(false)
    scan(file)
  }

  const scan = async (file: File) => {
    setScanning(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/accounting/scanner', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Scan failed')
        setScanning(false)
        return
      }
      setResult(data)
      setForm({
        vendor: data.vendor ?? '',
        amount: data.amount ?? '',
        date: data.date ?? new Date().toISOString().split('T')[0],
        category: data.category,
        type: data.type,
        description: data.description,
      })
    } catch {
      setError('Network error. Please try again.')
    }
    setScanning(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const saveTransaction = async () => {
    if (!form.amount || !form.description) return
    setSaving(true)
    const res = await fetch('/api/accounting/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.type || 'expense',
        category: form.category || 'Other Expense',
        description: form.description,
        amount: parseFloat(String(form.amount)),
        date: form.date || new Date().toISOString().split('T')[0],
        vendor: form.vendor || '',
      }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">AI Receipt Scanner</h1>
          <span className="px-2 py-0.5 bg-blue-100 text-[#0F4C81] text-xs font-bold rounded-full">AI Powered</span>
        </div>
        <Link href="/accounting/transactions" className="text-sm text-[#0F4C81] hover:underline">View Transactions</Link>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upload zone */}
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition overflow-hidden ${
                preview ? 'border-[#0F4C81]' : 'border-gray-200 hover:border-[#0F4C81] hover:bg-blue-50/30'
              }`}
              style={{ minHeight: 300 }}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Receipt"
                  className="w-full h-full object-contain max-h-[480px]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                  <div className="text-5xl mb-4">📷</div>
                  <h3 className="font-bold text-gray-700 text-lg">Drop receipt or invoice here</h3>
                  <p className="text-gray-400 text-sm mt-2">or click to upload · JPG, PNG, WebP · Max 5MB</p>
                  <p className="text-xs text-gray-300 mt-4">Powered by Claude AI · Extracts vendor, amount, date, category</p>
                </div>
              )}

              {scanning && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin" />
                  <p className="font-semibold text-[#0F4C81]">Scanning with AI...</p>
                  <p className="text-xs text-gray-400">Extracting data from your receipt</p>
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 border-2 border-[#0F4C81] text-[#0F4C81] rounded-xl font-semibold hover:bg-blue-50 transition text-sm"
            >
              {preview ? '📷 Scan Another Receipt' : '📷 Upload Receipt or Invoice'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}

            {/* How it works */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">How it works</h3>
              <div className="space-y-2">
                {[
                  ['📷', 'Upload any receipt, invoice, or bill image'],
                  ['🤖', 'Claude AI extracts vendor, amount, date, and category'],
                  ['✏️', 'Review and edit the extracted data'],
                  ['✅', 'Save directly as a transaction'],
                ].map(([icon, text], i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="text-lg">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Extracted data / edit form */}
          <div>
            {result && !saved ? (
              <div className="bg-white rounded-2xl border border-[#0F4C81] shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[#0F4C81] text-lg">Extracted Data</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONFIDENCE_STYLES[result.confidence]}`}>
                    {result.confidence} confidence
                  </span>
                </div>
                <p className="text-xs text-gray-400">Review and edit before saving as a transaction.</p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Vendor / From</label>
                    <input
                      type="text"
                      value={form.vendor as string ?? ''}
                      onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={String(form.amount ?? '')}
                        onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                      <input
                        type="date"
                        value={form.date ?? ''}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
                      <select
                        value={form.type ?? 'expense'}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value as 'income' | 'expense' }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                      <input
                        type="text"
                        value={form.category ?? ''}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveTransaction}
                  disabled={saving || !form.amount || !form.description}
                  className="w-full py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#082D4F] disabled:opacity-50 transition"
                >
                  {saving ? 'Saving...' : '✅ Save as Transaction'}
                </button>
              </div>
            ) : saved ? (
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h3 className="font-bold text-green-700 text-lg">Transaction Saved!</h3>
                {form.amount && (
                  <p className="text-green-600">
                    <strong>{fmt(Number(form.amount))}</strong> logged as {form.type} · {form.category}
                  </p>
                )}
                <div className="flex gap-3 justify-center">
                  <Link href="/accounting/transactions" className="btn-primary text-sm">View Transactions</Link>
                  <button
                    onClick={() => {
                      setPreview(null); setResult(null); setSaved(false); setForm({ description: '' })
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                    className="btn-secondary text-sm px-4 py-2 border-2 border-[#0F4C81] text-[#0F4C81] rounded-lg"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4 h-full flex flex-col items-center justify-center">
                <div className="text-5xl">🤖</div>
                <h3 className="font-bold text-gray-700 text-lg">AI will extract data here</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Upload a receipt or invoice and Claude AI will automatically extract the vendor, amount, date, and category.
                </p>
                <div className="grid grid-cols-3 gap-3 w-full mt-2">
                  {[['Vendor', 'Business name'], ['Amount', 'Total due'], ['Category', 'Auto-classified']].map(([t, d]) => (
                    <div key={t} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="font-semibold text-xs text-gray-600">{t}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
