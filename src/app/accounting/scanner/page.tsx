'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'

type ScanResult = {
  document_type: string
  confidence: string
  raw_text_summary: string | null
  is_financial: boolean
  // financial
  vendor: string | null
  amount: number | null
  subtotal: number | null
  tax_amount: number | null
  date: string | null
  due_date: string | null
  invoice_number: string | null
  category: string | null
  type: string | null
  description: string | null
  line_items: { description: string; qty: number; unit_price: number; amount: number }[]
  // legal / identity
  full_name: string | null
  id_number: string | null
  address: string | null
  date_of_birth: string | null
  expiration_date: string | null
  issuing_authority: string | null
  document_title: string | null
  parties: string[]
  key_dates: { label: string; date: string }[]
  notary: string | null
  case_or_reference_number: string | null
}

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/heic', 'image/heif', 'application/pdf',
]

const DOC_TYPE_LABELS: Record<string, string> = {
  receipt:        'Receipt',
  invoice:        'Invoice',
  bill:           'Bill',
  contract:       'Contract',
  legal:          'Legal Document',
  id_card:        'ID / License',
  bank_statement: 'Bank Statement',
  tax_form:       'Tax Form',
  payroll:        'Payroll Document',
  purchase_order: 'Purchase Order',
  estimate:       'Estimate / Quote',
  insurance:      'Insurance Document',
  other:          'Document',
}

const DOC_TYPE_ICONS: Record<string, string> = {
  receipt:        '🧾',
  invoice:        '📄',
  bill:           '📋',
  contract:       '📜',
  legal:          '⚖️',
  id_card:        '🪪',
  bank_statement: '🏦',
  tax_form:       '🧮',
  payroll:        '💵',
  purchase_order: '🛒',
  estimate:       '📐',
  insurance:      '🛡️',
  other:          '📁',
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-red-100 text-red-700',
}

const fmt = (n: number | null) =>
  n != null ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : null

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{String(value)}</span>
    </div>
  )
}

export default function ScannerPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const f = files[0]
    if (!ACCEPTED_TYPES.includes(f.type) && !f.type.startsWith('image/')) {
      setError('Unsupported file type. Upload an image (JPG, PNG, WebP, HEIC) or a PDF.')
      return
    }
    setError('')
    setResult(null)
    setSaved(false)
    setFile(f)
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  async function scan() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/accounting/scanner', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function saveTransaction() {
    if (!result || !result.is_financial) return
    setSaving(true)
    try {
      const res = await fetch('/api/accounting/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: result.date || new Date().toISOString().split('T')[0],
          description: result.description || result.vendor || DOC_TYPE_LABELS[result.document_type] || 'Scanned document',
          amount: result.amount,
          type: result.type === 'income' ? 'income' : 'expense',
          category: result.category || 'Other Expense',
          vendor: result.vendor,
        }),
      })
      if (res.ok) setSaved(true)
      else throw new Error('Failed to save')
    } catch {
      setError('Could not save transaction. Try again.')
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError('')
    setSaved(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const docLabel = result ? (DOC_TYPE_LABELS[result.document_type] ?? 'Document') : ''
  const docIcon  = result ? (DOC_TYPE_ICONS[result.document_type] ?? '📁') : ''

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Document Scanner</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Receipts, invoices, contracts, IDs, bank statements, tax forms, legal docs — any document.
          </p>
        </div>
        <Link href="/accounting" className="text-sm text-gray-500 hover:text-gray-700 transition">← Dashboard</Link>
      </div>

      {/* Upload zone */}
      {!result && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragging ? 'border-[#0F4C81] bg-blue-50' : 'border-gray-200 hover:border-[#0F4C81] hover:bg-blue-50/40'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={e => handleFiles(e.target.files)}
          />
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain mb-4" />
          ) : (
            <div className="text-5xl mb-4">{file ? '📄' : '📂'}</div>
          )}
          {file ? (
            <div>
              <p className="font-bold text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-gray-700">Drop any document here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">JPG · PNG · WebP · HEIC · PDF &nbsp;·&nbsp; Max 20MB</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Receipt', 'Invoice', 'Contract', 'ID Card', 'Bank Statement', 'Tax Form', 'Legal Doc', 'Any Document'].map(t => (
                  <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Actions */}
      {file && !result && (
        <div className="flex gap-3">
          <button
            onClick={scan}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-[#0F4C81] hover:bg-[#082D4F] disabled:opacity-50 transition shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Scanning…
              </span>
            ) : `✦ Scan Document`}
          </button>
          <button onClick={reset} className="px-4 py-3 rounded-xl font-semibold text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition">
            Clear
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">

          {/* Doc type header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{docIcon}</div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-gray-900">{docLabel} Detected</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CONFIDENCE_COLORS[result.confidence] ?? 'bg-gray-100 text-gray-500'}`}>
                    {result.confidence} confidence
                  </span>
                </div>
                {result.raw_text_summary && (
                  <p className="text-sm text-gray-500 mt-1 max-w-xl">{result.raw_text_summary}</p>
                )}
              </div>
            </div>
            <button onClick={reset} className="shrink-0 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg transition">
              Scan Another
            </button>
          </div>

          {/* Financial fields */}
          {result.is_financial && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Financial Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <Field label="Vendor / Payee"    value={result.vendor} />
                <Field label="Total Amount"       value={fmt(result.amount)} />
                <Field label="Subtotal"           value={fmt(result.subtotal)} />
                <Field label="Tax"                value={fmt(result.tax_amount)} />
                <Field label="Date"               value={result.date} />
                <Field label="Due Date"           value={result.due_date} />
                <Field label="Invoice / Ref #"    value={result.invoice_number} />
                <Field label="Category"           value={result.category} />
                <Field label="Type"               value={result.type} />
                <Field label="Description"        value={result.description} />
              </div>

              {result.line_items.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Line Items</p>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-left">
                        <tr>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Description</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">Qty</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">Unit Price</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {result.line_items.map((li, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-700">{li.description}</td>
                            <td className="px-4 py-2 text-gray-500 text-right">{li.qty}</td>
                            <td className="px-4 py-2 text-gray-500 text-right">{fmt(li.unit_price)}</td>
                            <td className="px-4 py-2 font-semibold text-gray-800 text-right">{fmt(li.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Save as transaction */}
              {result.amount != null && (
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                  {saved ? (
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                      <span>✓</span> Transaction saved to your books
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={saveTransaction}
                        disabled={saving}
                        className="py-2.5 px-5 rounded-xl font-bold text-sm text-white bg-[#0F4C81] hover:bg-[#082D4F] disabled:opacity-50 transition shadow-sm"
                      >
                        {saving ? 'Saving…' : `+ Add to Transactions (${fmt(result.amount)})`}
                      </button>
                      <span className="text-xs text-gray-400">Logs this document as a {result.type} transaction</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Identity / Legal fields */}
          {(result.full_name || result.id_number || result.address || result.document_title ||
            result.parties.length > 0 || result.key_dates.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Document Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <Field label="Document Title"     value={result.document_title} />
                <Field label="Name"               value={result.full_name} />
                <Field label="ID / License #"     value={result.id_number} />
                <Field label="Address"            value={result.address} />
                <Field label="Date of Birth"      value={result.date_of_birth} />
                <Field label="Expiration Date"    value={result.expiration_date} />
                <Field label="Issued By"          value={result.issuing_authority} />
                <Field label="Notary"             value={result.notary} />
                <Field label="Case / Ref #"       value={result.case_or_reference_number} />
              </div>

              {result.parties.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Parties Involved</p>
                  <div className="flex flex-wrap gap-2">
                    {result.parties.map((p, i) => (
                      <span key={i} className="text-sm bg-blue-50 text-[#0F4C81] font-medium px-3 py-1 rounded-full border border-blue-100">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.key_dates.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Key Dates</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {result.key_dates.map((kd, i) => (
                      <div key={i} className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kd.label}</span>
                        <span className="text-sm text-gray-800 font-medium">{kd.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Non-financial, no structured fields — just summary */}
          {!result.is_financial &&
            !result.full_name && !result.id_number && !result.address &&
            !result.document_title && result.parties.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Extracted Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{result.raw_text_summary ?? 'No extractable fields found.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
