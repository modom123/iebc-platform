import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IEBC Platform',
  description: 'Formation · Accounting · Hubs · 60 Consultants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
