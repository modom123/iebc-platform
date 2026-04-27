import ComingSoon from '@/components/ComingSoon'

export default function Page() {
  return <ComingSoon title="Accounts" backHref="/accounting" backLabel="← Dashboard" />
import { redirect } from 'next/navigation'

export default function AccountsPage() {
  redirect('/accounting/coa')
}
