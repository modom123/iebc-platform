import Link from 'next/link'

type Props = {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
}

export default function ComingSoon({ title, description, backHref = '/accounting', backLabel = '← Dashboard' }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link href={backHref} className="text-gray-400 hover:text-gray-600 text-sm">{backLabel}</Link>
        <span className="text-gray-300">|</span>
        <h1 className="font-bold text-gray-800">{title}</h1>
        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Coming Soon</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-[#0F4C81]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#0F4C81]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.153-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title} is on its way</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {description || `We're building ${title} now. Check back soon — it will appear here once it's ready.`}
          </p>
          <Link href={backHref} className="mt-6 inline-block px-5 py-2 rounded-lg text-sm font-semibold text-[#0F4C81] bg-[#0F4C81]/10 hover:bg-[#0F4C81]/20 transition">
            {backLabel}
          </Link>
        </div>
      </div>
    </main>
  )
}
