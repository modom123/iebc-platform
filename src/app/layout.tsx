import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IEBC | Control. Grow. Be Efficient.',
  description: 'Integrated Efficiency Business Consultants — Formation · Accounting · 60 Consultants',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
