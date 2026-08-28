import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAQ from '@/components/sections/FAQ'
import ClientShell from '@/components/ui/ClientShell'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Diseño Web Profesional en Argentina | SEO Local | kevdev',
  description: 'Diseño y desarrollo de sitios web institucionales y landing pages de alta conversión. Optimización SEO On-Page, 100% Mobile Responsive y velocidad Core Web Vitals.',
  alternates: {
    canonical: 'https://kevdev.net.ar/diseno-web',
  },
}

export default function DisenoWebPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Diseño Web Profesional',
    serviceType: 'Desarrollo y Diseño Web',
    provider: {
      '@type': 'ProfessionalService',
      name: 'KevDev',
      url: 'https://kevdev.net.ar',
      sameAs: 'https://maps.google.com/?q=KevDev+Desarrollo+Web',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Argentina',
    },
    description: 'Creación de sitios web institucionales y de servicios estructurados para SEO local y respuesta de Google AI.',
  }

  return (
    <>
      <ClientShell />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />

        <main style={{ paddingTop: '7.5rem', paddingBottom: '4rem' }}>
          <section className="site-container" style={{ maxWidth: 900, textAlign: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#22d3ee',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'rgba(34, 211, 238, 0.08)',
                border: '1px solid rgba(34, 211, 238, 0.25)',
                padding: '0.35rem 0.85rem',
                borderRadius: 99,
                display: 'inline-block',
                marginBottom: '1.5rem',
              }}
            >
              SEO Local & Google AI Ready
            </span>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: 'var(--color-star)',
                margin: '0 0 1.5rem',
              }}
            >
              Diseño Web Profesional que <span style={{ color: '#22d3ee' }}>Posiciona tu Negocio</span>
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(1rem, 1.8vw, 1.1875rem)',
                lineHeight: 1.75,
                color: 'var(--color-muted)',
                maxWidth: '60ch',
                margin: '0 auto 2.5rem',
              }}
            >
              Desarrollamos páginas web institucionales y landing pages optimizadas desde el código para dominar búsquedas locales en Google y destacar en los resultados de Google AI (Gemini).
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/#contacto"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  padding: '0.875rem 1.75rem',
                  borderRadius: 12,
                  textDecoration: 'none',
                  boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4)',
                }}
              >
                Solicitar Presupuesto
              </Link>
              <a
                href="https://maps.google.com/?q=KevDev+Desarrollo+Web"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--color-star)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  padding: '0.875rem 1.75rem',
                  borderRadius: 12,
                  textDecoration: 'none',
                }}
              >
                Ficha en Google Maps 📍
              </a>
            </div>
          </section>

          {/* Features Grid */}
          <section className="site-container" style={{ maxWidth: 1000, marginTop: '5rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(18, 18, 18, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '2rem',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-star)', margin: '0 0 0.75rem' }}>
                  Velocidad Core Web Vitals
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Páginas ultraligeras que cargan en menos de 1.2s. Google premia la velocidad otorgando mejores posiciones en el ranking orgánico.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(18, 18, 18, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '2rem',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-star)', margin: '0 0 0.75rem' }}>
                  Diseño 100% Mobile First
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Más del 75% de las búsquedas locales ocurren desde smartphones. Aseguramos usabilidad perfecta en iPhone y Android.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(18, 18, 18, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '2rem',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-star)', margin: '0 0 0.75rem' }}>
                  Esquemas Schema.org
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Incrustamos datos JSON-LD estructurados (`LocalBusiness`, `Service`, `FAQPage`) para que Google AI entienda exactamente tus servicios.
                </p>
              </div>
            </div>
          </section>

          <FAQ />
        </main>

        <Footer />
      </div>
    </>
  )
}
