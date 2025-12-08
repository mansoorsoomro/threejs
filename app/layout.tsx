import type { Metadata } from 'next'
import './globals.css'
import StoreProvider from '@/lib/store/StoreProvider'

export const metadata: Metadata = {
  title: 'Coupe Building Designer',
  description: 'Design your custom building with instant pricing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}

