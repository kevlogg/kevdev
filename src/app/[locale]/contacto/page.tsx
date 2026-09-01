import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAQ from '@/components/sections/FAQ'
import ContactForm from '@/components/sections/ContactForm'
import ClientShell from '@/components/ui/ClientShell'

export const metadata: Metadata = {
  title: 'Contacto & Cotización de Proyectos Web | KevDev Argentina',
  description:
    'Hablemos de tu proyecto web o software. Enfoque directo, tiempos claros y ejecución técnica en Mar del Plata, Buenos Aires y todo Argentina.',
  alternates: {
    canonical: 'https://kevdev.net.ar/contacto',
  },
}

export default function ContactoPage() {
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://www.kevdev.net.ar/contacto#webpage',
    url: 'https://www.kevdev.net.ar/contacto',
    name: 'Contacto & Cotización de Proyectos Web | KevDev',
    description:
      'Página oficial de contacto y agendamiento de KevDev. Solicitud de cotizaciones para sitios web, tiendas online y software a medida.',
    mainEntity: {
      '@type': 'ProfessionalService',
      name: 'KevDev — Desarrollador Web & Software a Medida',
      url: 'https://www.kevdev.net.ar',
      telephone: '+54-9-223-585-1419',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mar del Plata',
        addressRegion: 'Buenos Aires',
        addressCountry: 'AR',
      },
      hasMap: 'https://maps.google.com/?cid=8114234444718749965',
      sameAs: [
        'https://maps.google.com/?cid=8114234444718749965',
        'https://share.google/Vmv20uo1V4pSFQY8h',
        'https://www.instagram.com/kevd3v/',
        'https://www.linkedin.com/in/kevin-loggia/',
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '20:00',
        },
      ],
    },
  }

  return (
    <>
      <ClientShell />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />

      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />

        <main style={{ paddingTop: '7.5rem', paddingBottom: '4rem' }}>
          <ContactForm />
          <FAQ />
        </main>

        <Footer />
      </div>
    </>
  )
}
