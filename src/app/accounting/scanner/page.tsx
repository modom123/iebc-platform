'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'

type LineItem = { description: string; qty: number; unit_price: number; amount: number }

type ScanResult = {
  vendor: string | null
  amount: number | null
  date: string | null
  category: string
  type: 'income' | 'expense'
  description: string
  line_items: LineItem[]
  tax_amount: number | null
  subtotal: number | null
  invoice_number: string | null
  confidence: 'high' | 'medium' | 'low'
}

const CONFIDENCE_STYLES = {
  high:   { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  label: 'High confidence' },
  medium: { bar: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50', label: 'Medium confidence' },
  low:    { bar: 'bg-red-400',    text: 'text-red-600',    bg: 'bg-red-50',    label: 'Low confidence — review carefully' },
}

const CATEGORIES = [
  'Revenue', 'Consulting', 'Product Sale', 'Payroll', 'Marketing',
  'Software / SaaS', 'Office & Supplies', 'Travel', 'Legal & Professional',
  'Taxes', 'Meals & Entertainment', 'Utilities', 'Insurance', 'Shipping',
  'Rent', 'Equipment', 'Other Income', 'Other Expense',
]

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function ScannerPage() {
  const fileRef   = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [file,     setFile]    = useState<File | null>(null)
  const [preview,  setPreview] = useState<string | null>(null)
  const [isPdf,    setIsPdf]   = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result,   setResult]  = useState<ScanResult | null>(null)
  const [error,    setError]   = useState('')
  const [form,     setForm]    = useState<Partial<ScanResult> & { description: string }>({ description: '' })
  const [saving,   setSaving]  = useState(false)
  const [saved,    setSaved]   = useState(false)

  const reset = () => {
    setFile(null); setPreview(null); setIsPdf(false)
    setResult(null); setError(''); setSaved(false)
    setForm({ description: '' })
    if (fileRef.current)   fileRef.current.value   = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  const handleFile = (f: File) => {
    const pdf = f.type === 'application/pdf'
    setIsPdf(pdf)
    setFile(f)
    setPreview(pdf ? null : URL.createObjectURL(f))
    setResult(null); setError(''); setSaved(false)
    scan(f)
  }

  const scan = async (f: File) => {
    setScanning(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', f)
      const res  = await fetch('/api/accounting/scanner', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Scan failed'); setScanning(false); return }
      setResult(data)
      setForm({
        vendor:         data.vendor         ?? '',
        amount:         data.amount         ?? '',
        date:           data.date           ?? new Date().toISOString().split('T')[0],
        category:       data.category,
        type:           data.type,
        description:    data.description,
        invoice_number: data.invoice_number ?? '',
        line_items:     data.line_items     ?? [],
        tax_amount:     data.tax_amount,
        subtotal:       data.subtotal,
      })
    } catch {
      setError('Network error. Please try again.')
    }
    setScanning(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const saveTransaction = async () => {
    if (!form.amount || !form.description) return
    setSaving(true)
    const res = await fetch('/api/accounting/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:        form.type        || 'expense',
        category:    form.category    || 'Other Expense',
        description: form.description,
        amount:      parseFloat(String(form.amount)),
        date:        form.date        || new Date().toISOString().split('T')[0],
        vendor:      form.vendor      || '',
        reference:   form.invoice_number || '',
      }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true) }
    else { const d = await res.json(); setError(d.error || 'Failed to save') }
  }

  const conf = result ? CONFIDENCE_STYLES[result.confidence] : null

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">AI Document Scanner</h1>
          <span className="px-2 py-0.5 bg-blue-100 text-[#0F4C81] text-xs font-bold rounded-full">AI Powered</span>
        </div>
        <Link href="/accounting/transactions" className="text-sm text-[#0F4C81] hover:underline">View Transactions</Link>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left: upload zone ── */}
          <div className="space-y-4">

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => !file && fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl transition overflow-hidden
                ${file ? 'border-[#0F4C81] cursor-default' : 'border-gray-200 hover:border-[#0F4C81] hover:bg-blue-50/30 cursor-pointer'}`}
              style={{ minHeight: 300 }}
            >
              {/* Image preview */}
              {preview && !isPdf && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Document" className="w-full object-contain max-h-[480px]" />
              )}

              {/* PDF preview */}
              {isPdf && file && (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center gap-4">
                  <div className="w-20 h-20 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-center">
                    <span className="text-red-500 font-black text-lg">PDF</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!file && !scanning && (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center gap-3">
                  <div className="flex gap-4 text-4xl">
                    <span>📄</span>
                    <span>📷</span>
                    <span>🧾</span>
                  </div>
                  <h3 className="font-bold text-gray-700 text-lg">Drop your document here</h3>
                  <p className="text-gray-400 text-sm">PDF invoices · Phone photos · Scanned receipts</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {['JPG', 'PNG', 'HEIC', 'WebP', 'PDF'].map(t => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 font-mono">{t}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 mt-2">Claude AI · Extracts vendor, amount, date, line items</p>
                </div>
              )}

              {/* Scanning overlay */}
              {scanning && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-4">
                  {/* Animated scan line */}
                  <div className="relative w-48 h-48 border-2 border-[#0F4C81] rounded-xl overflow-hidden bg-blue-50/50">
                    <div
                      className="absolute left-0 right-0 h-0.5 bg-[#0F4C81] opacity-80"
                      style={{ animation: 'scanLine 1.8s ease-in-out infinite' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">{isPdf ? '📄' : '📷'}</span>
                    </div>
                    {/* Corner brackets */}
                    {[
                      'top-1 left-1 border-t-2 border-l-2',
                      'top-1 right-1 border-t-2 border-r-2',
                      'bottom-1 left-1 border-b-2 border-l-2',
                      'bottom-1 right-1 border-b-2 border-r-2',
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-4 h-4 border-[#0F4C81] ${cls}`} />
                    ))}
                  </div>
                  <p className="font-semibold text-[#0F4C81] text-sm">
                    {isPdf ? 'Reading PDF document...' : 'Scanning document...'}
                  </p>
                  <p className="text-xs text-gray-400">Extracting vendor, amount, date, and line items</p>
                </div>
              )}
            </div>

            {/* Scan line CSS */}
            <style>{`
              @keyframes scanLine {
                0%   { top: 8px;  opacity: 1; }
                50%  { top: calc(100% - 8px); opacity: 1; }
                100% { top: 8px;  opacity: 1; }
              }
            `}</style>

            {/* Upload buttons */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-3 border-2 border-[#0F4C81] text-[#0F4C81] rounded-xl font-semibold hover:bg-blue-50 transition text-sm flex items-center justify-center gap-2"
                >
                  <span>📁</span>
                  {file ? 'Change File' : 'Upload File'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-1">PDF or image</p>
              </div>
              <div>
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="w-full py-3 border-2 border-[#C9A02E] text-[#C9A02E] rounded-xl font-semibold hover:bg-amber-50 transition text-sm flex items-center justify-center gap-2"
                >
                  <span>📷</span>
                  Take Photo
                </button>
                <p className="text-center text-xs text-gray-400 mt-1">Use camera</p>
              </div>
            </div>

            {/* Hidden inputs */}
            <input ref={fileRef}   type="file" accept="image/*,application/pdf" className="hidden" onChange={handleChange} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleChange} />

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* How it works */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">How it works</h3>
              <div className="space-y-2.5">
                {[
                  ['📷', 'Upload any receipt, invoice, or bill'],
                  ['📄', 'Supports PDF invoices and phone camera photos'],
                  ['🤖', 'Claude AI extracts all data including line items'],
                  ['✏️', 'Review and edit before saving'],
                  ['✅', 'Saved instantly as a transaction'],
                ].map(([icon, text], i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="text-base w-5 text-center shrink-0">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: extracted data / edit ── */}
          <div>
            {saved ? (
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-10 text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h3 className="font-bold text-green-700 text-xl">Transaction Saved!</h3>
                {form.amount && (
                  <p className="text-green-600 text-base">
                    <strong>{fmt(Number(form.amount))}</strong> logged as {form.type} · {form.category}
                  </p>
                )}
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/accounting/transactions"
                    className="bg-[#0F4C81] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#082D4F] transition">
                    View Transactions
                  </Link>
                  <button onClick={reset}
                    className="border-2 border-[#0F4C81] text-[#0F4C81] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition">
                    Scan Another
                  </button>
                </div>
              </div>

            ) : result ? (
              <div className="bg-white rounded-2xl border border-[#0F4C81] shadow-sm p-6 space-y-5">

                {/* Confidence bar */}
                <div className={`rounded-xl p-3 ${conf!.bg} flex items-center justify-between`}>
                  <span className={`text-xs font-semibold ${conf!.text}`}>{conf!.label}</span>
                  <div className="flex gap-1">
                    {(['high', 'medium', 'low'] as const).map(l => (
                      <div key={l} className={`h-1.5 w-6 rounded-full ${result.confidence === l || (result.confidence === 'high' && l !== 'low') || result.confidence === 'high' ? conf!.bar : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400">Review and edit before saving as a transaction.</p>

                {/* Invoice number (if found) */}
                {result.invoice_number && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                    Invoice / Receipt #: <span className="font-mono font-semibold text-gray-700">{result.invoice_number}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Vendor / From</label>
                    <input type="text"
                      value={form.vendor as string ?? ''}
                      onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                    <input type="text"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Total Amount ($)</label>
                      <input type="number" step="0.01"
                        value={String(form.amount ?? '')}
                        onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                      <input type="date"
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
                      <select
                        value={form.category ?? 'Other Expense'}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Subtotal / tax breakdown */}
                {(result.subtotal !== null || result.tax_amount !== null) && (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
                    {result.subtotal !== null && (
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>{fmt(result.subtotal)}</span>
                      </div>
                    )}
                    {result.tax_amount !== null && (
                      <div className="flex justify-between text-gray-500">
                        <span>Tax</span>
                        <span>{fmt(result.tax_amount)}</span>
                      </div>
                    )}
                    {result.amount !== null && (
                      <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1 mt-1">
                        <span>Total</span>
                        <span>{fmt(result.amount)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Line items */}
                {result.line_items.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Line Items</p>
                    <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 font-semibold text-gray-500">
                        <span className="col-span-6">Description</span>
                        <span className="col-span-2 text-right">Qty</span>
                        <span className="col-span-2 text-right">Unit</span>
                        <span className="col-span-2 text-right">Total</span>
                      </div>
                      {result.line_items.map((li, i) => (
                        <div key={i} className="grid grid-cols-12 px-3 py-2 border-t border-gray-100 text-gray-600">
                          <span className="col-span-6 truncate">{li.description}</span>
                          <span className="col-span-2 text-right">{li.qty ?? 1}</span>
                          <span className="col-span-2 text-right">{li.unit_price != null ? fmt(li.unit_price) : '—'}</span>
                          <span className="col-span-2 text-right">{li.amount != null ? fmt(li.amount) : '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={saveTransaction}
                    disabled={saving || !form.amount || !form.description}
                    className="flex-1 py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#082D4F] disabled:opacity-50 transition text-sm"
                  >
                    {saving ? 'Saving...' : '✅ Save as Transaction'}
                  </button>
                  <button onClick={reset}
                    className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 text-sm transition">
                    ✕
                  </button>
                </div>
              </div>

            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-5 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-700 text-lg">AI will extract data here</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
                    Upload a receipt, invoice, or bill — as a PDF or photo — and Claude AI will extract everything automatically.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full text-left">
                  {[
                    ['📍 Vendor', 'Business name'],
                    ['💰 Amount', 'Total + tax'],
                    ['📅 Date', 'Transaction date'],
                    ['📋 Line items', 'What was purchased'],
                    ['🏷️ Category', 'Auto-classified'],
                    ['🔢 Invoice #', 'Reference number'],
                  ].map(([t, d]) => (
                    <div key={t} className="bg-gray-50 rounded-xl p-3">
                      <p className="font-semibold text-xs text-gray-700">{t}</p>
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
