import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function RedirectRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#121212',
          color: '#e8e8e8',
        }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
