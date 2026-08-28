import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAQ from '@/components/sections/FAQ'
import ClientShell from '@/components/ui/ClientShell'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Desarrollo Web a Medida & Software | kevdev',
  description: 'Desarrollo de aplicaciones web a medida, SaaS, integración de APIs personalizadas, dashboards y código optimizado a 60 FPS.',
  alternates: {
    canonical: 'https://kevdev.net.ar/desarrollo-a-medida',
  },
}

export default function DesarrolloAMedidaPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Desarrollo Web a Medida',
    serviceType: 'Desarrollo de Software y Sistemas Web',
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
    description: 'Soluciones de software y plataformas web a medida para empresas y startups.',
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
                color: '#c084fc',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'rgba(192, 132, 252, 0.1)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                padding: '0.35rem 0.85rem',
                borderRadius: 99,
                display: 'inline-block',
                marginBottom: '1.5rem',
              }}
            >
              Arquitectura Escalable & Rendimiento 60 FPS
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
              Sistemas Web y Software <span style={{ color: '#c084fc' }}>Construidos a Medida</span>
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
              Desarrollo de plataformas personalizadas, SaaS, paneles de control avanzados, integración de APIs y experiencias interactivas optimizadas sin limitaciones de plantillas.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/#contacto"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  padding: '0.875rem 1.75rem',
                  borderRadius: 12,
                  textDecoration: 'none',
                  boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)',
                }}
              >
                Cotizar Sistema a Medida
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
                Ficha Google Maps 📍
              </a>
            </div>
          </section>

          {/* Features */}
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
                  APIs & Microservicios
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Conexión con CRM (HubSpot, Salesforce), sistemas ERP, Webhooks personalizados y arquitecturas REST / GraphQL.
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
                  Motores Gráficos 60 FPS
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Animación interactiva, Canvas, WebGL e interpolación LERP de alto rendimiento.
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
                  Seguridad & Escalabilidad
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Protección OWASP, autenticación JWT, sanitización de datos y despliegue en infraestructura Cloud.
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
