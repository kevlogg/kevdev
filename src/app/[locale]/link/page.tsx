import type { Metadata } from 'next'
import LinkTreeClient from './LinkTreeClient'

export const metadata: Metadata = {
  title: 'KevDev — Enlaces Oficiales & Contacto Directo',
  description:
    'Accede a todos los canales oficiales de KevDev: Sitio Web Oficial, Portafolio de Proyectos, Instagram y atención directa por WhatsApp.',
  alternates: {
    canonical: 'https://kevdev.net.ar/link',
  },
  openGraph: {
    title: 'KevDev — Enlaces Oficiales & Contacto',
    description: 'Sitio Web, Proyectos, Instagram y WhatsApp oficial de KevDev.',
    url: 'https://kevdev.net.ar/link',
    siteName: 'KevDev',
    images: [
      {
        url: 'https://www.kevdev.net.ar/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KevDev — Enlaces Oficiales',
      },
    ],
  },
}

export default function LinkPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'KevDev — Hub de Enlaces Oficiales',
    url: 'https://kevdev.net.ar/link',
    mainEntity: {
      '@type': 'Organization',
      name: 'KevDev Software Studio',
      url: 'https://kevdev.net.ar',
      logo: 'https://kevdev.net.ar/favicon-512x512.png',
      sameAs: [
        'https://kevdev.net.ar',
        'https://www.instagram.com/kevdev_software/',
        'https://wa.me/5492235851419',
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <LinkTreeClient />
    </>
  )
}
