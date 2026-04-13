import { notFound } from 'next/navigation'
import Link from 'next/link'

type Invoice = {
  id: string; invoice_number: string; status: string;
  total: number; amount_paid: number; due_date: string; created_at: string; notes: string
}
type Customer = { id: string; name: string; email: string; phone: string; address: string }
type Company = { full_name: string; company_name: string; notification_email: string }

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-400',
}

async function getPortalData(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iebc-platform.vercel.app'
  const res = await fetch(`${baseUrl}/api/portal?token=${token}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function ClientPortalPage({ params }: { params: { token: string } }) {
  const data = await getPortalData(params.token)

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md w-full shadow-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid Portal Link</h1>
          <p className="text-gray-500 text-sm">This link is invalid or has expired. Please contact your service provider for a new link.</p>
        </div>
      </main>
    )
  }

  const { customer, invoices, company, label } = data as { customer: Customer; invoices: Invoice[]; company: Company; label: string }

  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
  const paid = invoices.filter(i => i.status === 'paid')
  const totalOutstanding = outstanding.reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0)
  const totalPaid = paid.reduce((s, i) => s + Number(i.total), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0F4C81] text-white px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{company?.company_name || company?.full_name || 'Client Portal'}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{label || 'Account Portal'}</p>
          </div>
          <div className="text-right text-blue-200 text-sm">
            <p>{customer?.name}</p>
            <p>{customer?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Balance Due</p>
            <p className={`text-2xl font-bold mt-1 ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(totalOutstanding)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Total Invoices</p>
            <p className="text-2xl font-bold mt-1 text-gray-800">{invoices.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">Total Paid</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{fmt(totalPaid)}</p>
          </div>
        </div>

        {/* Outstanding invoices */}
        {outstanding.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-red-50">
              <h2 className="font-bold text-red-800">Outstanding — {fmt(totalOutstanding)}</h2>
              <p className="text-xs text-red-600 mt-0.5">Please remit payment at your earliest convenience</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                  <th className="px-5 py-2 text-left">Invoice</th>
                  <th className="px-5 py-2 text-left">Date</th>
                  <th className="px-5 py-2 text-left">Due</th>
                  <th className="px-5 py-2 text-right">Amount</th>
                  <th className="px-5 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {outstanding.map(inv => {
                  const balance = Number(inv.total) - Number(inv.amount_paid)
                  const isOverdue = inv.status === 'overdue' || (inv.due_date && inv.due_date < new Date().toISOString().split('T')[0])
                  return (
                    <tr key={inv.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50/20' : ''}`}>
                      <td className="px-5 py-3 font-medium text-[#0F4C81]">{inv.invoice_number}</td>
                      <td className="px-5 py-3 text-gray-500">{inv.created_at.split('T')[0]}</td>
                      <td className={`px-5 py-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{inv.due_date || '—'}</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-gray-800">{fmt(balance)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-700' : STATUS_COLORS[inv.status]}`}>
                          {isOverdue ? 'Overdue' : inv.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-5 py-3 font-bold text-gray-700">Total Due</td>
                  <td className="px-5 py-3 text-right font-bold font-mono text-red-600 text-base">{fmt(totalOutstanding)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            <div className="p-5 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-sm text-gray-600 mb-3">To pay, please contact {company?.notification_email || company?.full_name || 'your service provider'}.</p>
              {company?.notification_email && (
                <a
                  href={`mailto:${company.notification_email}?subject=Payment for ${outstanding[0]?.invoice_number || 'outstanding invoices'}&body=Hi, I would like to arrange payment for my outstanding balance of ${fmt(totalOutstanding)}.`}
                  className="inline-block bg-[#0F4C81] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                >
                  Contact to Pay
                </a>
              )}
            </div>
          </div>
        )}

        {/* Invoice history */}
        {invoices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Invoice History</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                  <th className="px-5 py-2 text-left">Invoice</th>
                  <th className="px-5 py-2 text-left">Date</th>
                  <th className="px-5 py-2 text-right">Total</th>
                  <th className="px-5 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{inv.invoice_number}</td>
                    <td className="px-5 py-3 text-gray-500">{inv.created_at.split('T')[0]}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-gray-800">{fmt(Number(inv.total))}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {invoices.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400">No invoices on record.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>Powered by IEBC Efficient Accounting · Secure client portal</p>
          <p className="mt-1">Questions? Contact {company?.notification_email || 'your service provider'}</p>
        </div>
      </div>
    </main>
  )
}
