import { createServerSupabaseClient } from '@/lib/supabase/server'

type AuditAction =
  | 'create' | 'update' | 'delete'
  | 'login' | 'logout' | 'password_change'
  | 'export' | 'import' | 'sync'
  | 'portal_view' | 'portal_generate'
  | 'bank_connect' | 'bank_disconnect'
  | 'invoice_sent' | 'invoice_paid' | 'payment_received'

export async function logAudit(
  userId: string,
  action: AuditAction,
  resourceType: string,
  resourceId?: string,
  changes?: Record<string, unknown>,
  req?: Request
) {
  try {
    const supabase = createServerSupabaseClient()
    const ip = req ? (
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    ) : undefined
    const userAgent = req?.headers.get('user-agent') || undefined

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      changes: changes || null,
      ip_address: ip || null,
      user_agent: userAgent || null,
    })
  } catch {
    // Audit logging should never break the main flow
  }
}
