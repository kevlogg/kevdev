import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAQ from '@/components/sections/FAQ'
import ClientShell from '@/components/ui/ClientShell'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tiendas Online & E-Commerce en Argentina | Mercado Pago & Mobbex | kevdev',
  description: 'Desarrollo de tiendas virtuales autoadministrables con cobros en Mercado Pago, Mobbex, Stripe y transferencias directas con descuento.',
  alternates: {
    canonical: 'https://kevdev.net.ar/tiendas-online',
  },
}

export default function TiendasOnlinePage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Tiendas Online y E-Commerce',
    serviceType: 'Desarrollo E-Commerce y Pasarelas de Pago',
    provider: {
      '@type': 'ProfessionalService',
      name: 'KevDev',
      url: 'https://kevdev.net.ar',
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
      ],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Argentina',
    },
    description: 'Desarrollo de e-commerce profesional con cobros en Mercado Pago, Mobbex, Stripe y gestión de envíos.',
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
                color: '#6366f1',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '0.35rem 0.85rem',
                borderRadius: 99,
                display: 'inline-block',
                marginBottom: '1.5rem',
              }}
            >
              Integración Nativa Mercado Pago, Mobbex & Stripe
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
              Tiendas Online y E-Commerce que <span style={{ color: '#818cf8' }}>Venden las 24 Horas</span>
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
              Convertí visitantes en clientes recurrentes con un checkout sin fricciones, cobranzas automáticas en Mercado Pago, Mobbex y Stripe, y gestión intuitiva de catálogo.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/#contacto"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  padding: '0.875rem 1.75rem',
                  borderRadius: 12,
                  textDecoration: 'none',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                }}
              >
                Cotizar Mi Tienda Online
              </Link>
              <a
                href="https://share.google/Vmv20uo1V4pSFQY8h"
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
                Ficha en Google 📍
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
                  Mercado Pago & Mobbex
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Cobros con tarjetas de crédito/débito en cuotas sin interés y dinero en cuenta. Transferencia con descuento automático.
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
                  Gestión de Envíos
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Cálculo automático de costo por código postal con Correo Argentino, Andreani, OCA o cadetería personalizada.
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
                  Panel Autoadministrable
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Control de stock, variantes (talles, colores), cupones de descuento y notificaciones automáticas al cliente.
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
