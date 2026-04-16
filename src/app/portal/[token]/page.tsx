import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClientPortalView from './ClientPortalView'

export default async function ClientPortalPage({ params }: { params: { token: string } }) {
  const supabase = createServerSupabaseClient()

  // Look up the portal token (no auth required — public page)
  const { data: portalToken, error } = await supabase
    .from('client_portal_tokens')
    .select('*, invoices(*, invoice_line_items(*), customers(*))')
    .eq('token', params.token)
    .eq('is_active', true)
    .single()

  if (error || !portalToken) return notFound()

  // Check expiry
  if (portalToken.expires_at && new Date(portalToken.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-6 sm:p-8 w-full max-w-sm sm:max-w-md text-center mx-4">
          <p className="text-2xl mb-2">⏰</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Link Expired</h1>
          <p className="text-gray-500 text-sm">This payment link has expired. Please contact the business for a new link.</p>
        </div>
      </div>
    )
  }

  const invoice = portalToken.invoices
  if (!invoice) return notFound()

  return <ClientPortalView invoice={invoice} token={params.token} />
}
