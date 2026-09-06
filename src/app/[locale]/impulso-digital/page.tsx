import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ClientShell from '@/components/ui/ClientShell'
import ConvocatoriaImpulsoForm from '@/components/sections/ConvocatoriaImpulsoForm'

export const metadata: Metadata = {
  title: 'Convocatoria Impulso Digital | Sitios Web Bonificados | KevDev',
  description:
    'Postulá tu negocio para ganar el desarrollo de tu sitio web bonificado y 3 meses de suscripción sin costo. Convocatoria abierta para marcas y emprendimientos en marcha.',
  alternates: {
    canonical: 'https://kevdev.net.ar/impulso-digital',
  },
  openGraph: {
    title: 'Convocatoria Impulso Digital — KevDev',
    description:
      'Buscamos un negocio en marcha que quiera ordenar sus ventas y dar un salto profesional en internet. ¡Postulá tu marca hoy!',
    url: 'https://kevdev.net.ar/impulso-digital',
    type: 'website',
  },
}

export default function ImpulsoDigitalPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.kevdev.net.ar/impulso-digital#webpage',
    url: 'https://www.kevdev.net.ar/impulso-digital',
    name: 'Convocatoria Impulso Digital KevDev',
    description:
      'Programa de selección de negocios para bonificación de desarrollo web y suscripción.',
    publisher: {
      '@type': 'Organization',
      name: 'KevDev Argentina',
      url: 'https://www.kevdev.net.ar',
    },
  }

  return (
    <>
      <ClientShell />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />

        <main style={{ paddingTop: '7.5rem', paddingBottom: '6rem' }}>
          <ConvocatoriaImpulsoForm />
        </main>

        <Footer />
      </div>
    </>
  )
}
