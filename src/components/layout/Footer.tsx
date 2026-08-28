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
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: 'clamp(2.5rem, 5vw, 4rem) 0 2rem 0',
        background: 'rgba(7, 9, 14, 0.35)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="site-container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Ficha de Google Business Profile con mayor transparencia glassmorphism */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: 16,
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            transition: 'all 0.3s ease',
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
                Google Business Profile Oficial
              </span>
              <span style={{ color: '#fbbc04', fontWeight: 700, fontSize: '0.8125rem' }}>
                5.0 ★★★★★
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
              Ficha verificada en Google Maps para cruce de datos SEO local en Argentina.
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
              background: 'rgba(234, 67, 53, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              padding: '0.625rem 1.125rem',
              borderRadius: 10,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(234, 67, 53, 0.25)',
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
              Páginas de Servicios
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link href="/diseno-web" style={{ color: '#38bdf8', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}>
                  ➜ Diseño Web Profesional
                </Link>
              </li>
              <li>
                <Link href="/tiendas-online" style={{ color: '#818cf8', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}>
                  ➜ Tiendas Online & E-Commerce
                </Link>
              </li>
              <li>
                <Link href="/desarrollo-a-medida" style={{ color: '#c084fc', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}>
                  ➜ Desarrollo Web a Medida
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
              Secciones
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
