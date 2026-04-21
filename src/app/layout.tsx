import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'kevdev — Digital Product Builder',
  description:
    'Kevin Loggia — Construyo productos digitales y herramientas web para negocios reales. Landing pages, web apps, MVPs y automatizaciones con foco en negocio y ejecución.',
  openGraph: {
    title: 'kevdev — Digital Product Builder',
    description: 'Productos digitales reales. No demos.',
    url: 'https://kevdev.vercel.app',
    siteName: 'kevdev',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
