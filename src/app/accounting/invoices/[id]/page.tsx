import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import PrintButton from './PrintButton'

type LineItem = { id: string; description: string; quantity: number; unit_price: number; amount: number }
type Invoice = {
  id: string; invoice_number: string; status: string; issue_date: string; due_date: string
  subtotal: number; tax_rate: number; tax_amount: number; total: number; amount_paid: number; notes: string
  customers: { name: string; email: string; phone: string; address: string } | null
  invoice_line_items: LineItem[]
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-400',
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/auth/login')
  }
  let supabase: ReturnType<typeof createServerSupabaseClient>
  try {
    supabase = createServerSupabaseClient()
  } catch {
    redirect('/auth/login')
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const { data: invoice } = await supabase
    .from('invoices')
    .select(`*, customers(*), invoice_line_items(*)`)
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single() as { data: Invoice | null }

  if (!invoice) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', session.user.id)
    .single()

  const balance = Number(invoice.total) - Number(invoice.amount_paid)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting/invoices" className="text-gray-400 hover:text-gray-600 text-sm">← Invoices</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">{invoice.invoice_number}</h1>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status] || ''}`}>{invoice.status}</span>
        </div>
        <div className="flex gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-0 print:rounded-none">

          {/* Header */}
          <div className="p-10 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-[#0F4C81]">INVOICE</h1>
                <p className="text-gray-400 text-sm mt-1">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">IEBC</p>
                <p className="text-sm text-gray-500">Integrated Efficiency Business Consultants</p>
                {profile?.email && <p className="text-sm text-gray-500">{profile.email}</p>}
              </div>
            </div>
          </div>

          {/* Bill To + Dates */}
          <div className="p-10 border-b border-gray-100 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
              {invoice.customers ? (
                <>
                  <p className="font-bold text-gray-800 text-lg">{invoice.customers.name}</p>
                  {invoice.customers.email && <p className="text-sm text-gray-500">{invoice.customers.email}</p>}
                  {invoice.customers.phone && <p className="text-sm text-gray-500">{invoice.customers.phone}</p>}
                  {invoice.customers.address && <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.customers.address}</p>}
                </>
              ) : (
                <p className="text-gray-400">No customer</p>
              )}
            </div>
            <div className="text-right space-y-2">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Issue Date</p>
                <p className="font-medium text-gray-800">{invoice.issue_date}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Due Date</p>
                <p className="font-medium text-gray-800">{invoice.due_date || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-10 border-b border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
                  <th className="pb-3 text-left">Description</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(invoice.invoice_line_items || []).map(item => (
                  <tr key={item.id}>
                    <td className="py-3 text-gray-700">{item.description}</td>
                    <td className="py-3 text-right text-gray-500">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-500">{fmt(item.unit_price)}</td>
                    <td className="py-3 text-right font-semibold">{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-10">
            <div className="max-w-xs ml-auto space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{fmt(invoice.subtotal)}</span>
              </div>
              {Number(invoice.tax_rate) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
                  <span className="font-medium">{fmt(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black border-t border-gray-200 pt-3">
                <span>Total</span>
                <span className="text-[#0F4C81]">{fmt(invoice.total)}</span>
              </div>
              {Number(invoice.amount_paid) > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Amount Paid</span>
                    <span className="font-medium">({fmt(invoice.amount_paid)})</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
                    <span>Balance Due</span>
                    <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>{fmt(balance)}</span>
                  </div>
                </>
              )}
            </div>

            {invoice.notes && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-300">Thank you for your business · IEBC Platform · iebc-platform.vercel.app</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media print { .print\\:hidden { display: none !important; } }`}</style>
    </main>
  )
}
