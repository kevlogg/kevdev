'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

const GOOGLE_REVIEWS = [
  {
    name: 'Martina Cantale',
    role: '4 opiniones · 2 fotos',
    initials: 'MC',
    avatarBg: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    rating: 5,
    date: 'Hace 5 días',
    comment:
      'Estamos muy contentos de haber contratado a Kevin. Excelente servicio, sabe lo que los clientes necesitan y ofrece más de lo que tiene que ver con su trabajo! Muy innovador',
  },
  {
    name: 'Noelia Bandini',
    role: 'Local Guide · 45 opiniones',
    initials: 'NB',
    avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    rating: 5,
    date: 'Hace 3 semanas',
    comment:
      'Excelente atencion amabilidad, profesionalismo y flexibilidad en todo, muy recomendable',
  },
  {
    name: 'Grow AI',
    role: 'App, Web & Juego',
    initials: 'G',
    avatarBg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    rating: 5,
    date: 'Hace 3 semanas',
    comment:
      'Fenómeno kevin y su equipo de Kevdev. Nos armó una aplicación, una página web y hasta nos creó un juego que está mejorando, son unos cracks!',
  },
]

function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.27v3.15C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24a7.18 7.18 0 0 1 0-4.48V6.61H1.27a11.98 11.98 0 0 0 0 10.78l4.01-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
      />
    </svg>
  )
}

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
        
        {/* Ficha de Google Business Profile & Reseñas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
              href="https://share.google/Vmv20uo1V4pSFQY8h"
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
              📍 <span>Ver Ficha en Google</span>
            </a>
          </div>

          {/* 3 Cards de Reseñas de Google */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {GOOGLE_REVIEWS.map((rev, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.35)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.35)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 229, 255, 0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Header: Avatar, Name, Date, Google Icon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: rev.avatarBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                      }}
                    >
                      {rev.initials}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: 'var(--color-star)',
                          lineHeight: 1.2,
                        }}
                      >
                        {rev.name}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.75rem',
                          color: 'var(--color-faint)',
                          lineHeight: 1.3,
                        }}
                      >
                        {rev.role} · {rev.date}
                      </span>
                    </div>
                  </div>
                  <GoogleGIcon />
                </div>

                {/* Star rating & Comment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ color: '#fbbc04', fontSize: '0.85rem', letterSpacing: '2px' }}>
                    ★★★★★
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8125rem',
                      color: 'rgba(221, 232, 255, 0.82)',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    "{rev.comment}"
                  </p>
                </div>

                {/* Footer badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'rgba(0, 229, 255, 0.7)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem' }}>✓</span> Reseña verificada en Google Maps
                </div>
              </div>
            ))}
          </div>
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
                <Link href="/contacto" style={{ color: '#22d3ee', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 700 }}>
                  ➜ Contacto & Cotizaciones 💬
                </Link>
              </li>
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
                <Link href="/contacto" style={{ color: '#22d3ee', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}>
                  Contacto Directo
                </Link>
              </li>
              <li>
                <Link href="/#servicios" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/#faq" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  Preguntas Frecuentes (FAQ)
                </Link>
              </li>
              <li>
                <a href="https://share.google/Vmv20uo1V4pSFQY8h" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
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
