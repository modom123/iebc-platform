import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-7xl font-black text-[#0F4C81] mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/accounting" className="btn-primary text-sm">Go to Dashboard</Link>
          <Link href="/" className="btn-secondary text-sm">Home</Link>
        </div>
      </div>
    </main>
  )
}
