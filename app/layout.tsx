import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ailleurs — Cape Town Experiences',
  description: 'Immersive travel experiences in Cape Town, South Africa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d1b2a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
