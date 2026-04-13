import Link from 'next/link'

export default function PortalHomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg w-full shadow-sm">
        <div className="w-16 h-16 bg-[#0F4C81] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-white text-3xl font-bold">I</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Client Portal</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          Access your invoices and account statements. Use the secure link provided by your service provider.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left text-sm text-gray-600">
          <p className="font-semibold text-gray-700 mb-2">How to access your portal:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-gray-500">
            <li>Contact your service provider and request a portal link</li>
            <li>Click the secure link sent to you</li>
            <li>View invoices, statements, and payment history</li>
          </ol>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">Are you a business owner? <Link href="/auth/login" className="text-[#0F4C81] hover:underline">Sign in to your account →</Link></p>
        </div>
      </div>
    </main>
  )
}
