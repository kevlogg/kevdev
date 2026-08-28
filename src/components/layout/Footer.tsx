import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid var(--color-border)',
        padding: 'clamp(2.5rem, 5vw, 4rem) 0 2rem 0',
        background: 'rgba(12, 12, 12, 0.95)',
      }}
    >
      <div className="site-container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Google Business Profile Badge & Cross Link */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.9), rgba(15, 23, 42, 0.7))',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 16,
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-star)',
                }}
              >
                Ficha Oficial Google Business Profile
              </span>
              <span style={{ color: '#fbbc04', fontWeight: 700, fontSize: '0.8125rem' }}>
                5.0 ★★★★★
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
              Verificada en Google Maps para cruce de entidad y posicionamiento SEO local en Argentina.
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=KevDev+Desarrollo+Web"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#ea4335',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              padding: '0.625rem 1.125rem',
              borderRadius: 10,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(234, 67, 53, 0.3)',
              transition: 'transform 0.2s, background 0.2s',
            }}
          >
            📍 <span>Ver Ficha en Google Maps</span>
          </a>
        </div>

        {/* Links Navigation */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-faint)',
                display: 'block',
                marginBottom: '0.75rem',
              }}
            >
              Servicios Web
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link href="/diseno-web" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  Diseño Web Profesional
                </Link>
              </li>
              <li>
                <Link href="/tiendas-online" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  Tiendas Online E-Commerce
                </Link>
              </li>
              <li>
                <Link href="/desarrollo-a-medida" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  Desarrollo a Medida
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-faint)',
                display: 'block',
                marginBottom: '0.75rem',
              }}
            >
              Navegación
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <a href="/#servicios" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  Servicios
                </a>
              </li>
              <li>
                <a href="/#faq" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  Preguntas Frecuentes (FAQ)
                </a>
              </li>
              <li>
                <a href="https://maps.google.com/?q=KevDev+Desarrollo+Web" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  Google Business Profile ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-faint)' }}>
            {t('copyright', { year })} · {t('role')}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
            Buenos Aires, Argentina
          </span>
        </div>

      </div>
    </footer>
  )
}
