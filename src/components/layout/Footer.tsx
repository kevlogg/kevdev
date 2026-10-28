'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const GOOGLE_REVIEWS = [
  {
    name: 'Ulises Sangla',
    role: '3 opiniones',
    initials: 'US',
    avatarBg: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    rating: 5,
    date: 'Hace 3 semanas',
    comment:
      'Excelente la atencion brindada, siempre muy atento a lo que necesitaba para mi proyecto!',
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
  {
    name: 'Prana Pro',
    role: '1 opinión · 0 fotos',
    initials: 'PP',
    avatarBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    rating: 5,
    date: 'Hace 3 semanas',
    comment:
      'Si buscas tecnología de vanguardia y procesos eficientes son los indicados, nos hicieron una automatización, landing page y sistema de stock en menos de 2 semanas una locura, muy recomendados!!!',
  },
  {
    name: 'marpla code',
    role: '2 opiniones · 1 foto',
    initials: 'MC',
    avatarBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    rating: 5,
    date: 'Hace 3 semanas',
    comment:
      'Necesitábamos una landing page para un cliente grande y los genios de KevDev supieron resolver a la altura, capos.',
  },
  {
    name: 'Camila Nardi',
    role: '3 opiniones · 0 fotos',
    initials: 'CN',
    avatarBg: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    rating: 5,
    date: 'Hace 3 semanas',
    comment:
      'Entiende muy bien lo que uno busca!! Son divinos y muy profesionales siempre muy atentos kevin y su team, re talentosos 🙌',
  },
  {
    name: 'Emiliano Firpo',
    role: '7 opiniones · 1 foto',
    initials: 'EF',
    avatarBg: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
    rating: 5,
    date: 'Hace 3 semanas',
    comment:
      'Nos contactamos con Kevin para realizar un sitio web para el mundial 2026 y superó nuestras expectativas, altamente recomendable, interpreta muy rápido lo que uno quiere y lo hace realidad con la misma velocidad, muy bueno en lo que hace el y su equipo!',
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

  // Carousel state and refs
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartScrollLeft = useRef(0)

  // Scroll carousel by direction
  const scrollByCard = useCallback((direction: 'next' | 'prev') => {
    const el = carouselRef.current
    if (!el) return
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : 320
    const scrollAmount = direction === 'next' ? cardWidth : -cardWidth
    
    // Check if at the end and looping forward
    if (direction === 'next' && el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else if (direction === 'prev' && el.scrollLeft <= 5) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }, [])

  // Auto-scroll loop
  useEffect(() => {
    if (isPaused || isDragging) return
    const interval = setInterval(() => {
      scrollByCard('next')
    }, 3800)
    return () => clearInterval(interval)
  }, [isPaused, isDragging, scrollByCard])

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = carouselRef.current
    if (!el) return
    setIsDragging(true)
    setIsPaused(true)
    dragStartX.current = e.pageX - el.offsetLeft
    dragStartScrollLeft.current = el.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - dragStartX.current) * 1.4
    carouselRef.current.scrollLeft = dragStartScrollLeft.current - walk
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header Card con botones de acción */}
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
                  5.0 ★★★★★ (7 reseñas verificadas)
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
                Ficha verificada en Google Maps para cruce de datos SEO local en Argentina.
              </p>
            </div>

            {/* Acciones: Dejar mi reseña (Nuevo) + Ver Ficha */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="https://g.page/r/CQ05s4U8jZtwEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)',
                  color: '#07090e',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  padding: '0.625rem 1.15rem',
                  borderRadius: 10,
                  textDecoration: 'none',
                  boxShadow: '0 4px 18px rgba(0, 229, 255, 0.35)',
                  transition: 'all 0.25s ease',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 229, 255, 0.55)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 229, 255, 0.35)'
                }}
              >
                <span>⭐</span> <span>Dejar mi reseña</span>
              </a>

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
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.background = 'rgba(234, 67, 53, 1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = 'rgba(234, 67, 53, 0.85)'
                }}
              >
                <span>📍</span> <span>Ver Ficha en Google</span>
              </a>
            </div>
          </div>

          {/* Barra de control del Carrusel */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-faint)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>↔</span> Deslizá horizontalmente para ver más opiniones
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => scrollByCard('prev')}
                aria-label="Reseña anterior"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollByCard('next')}
                aria-label="Siguiente reseña"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Carrusel Horizontal de Reseñas de Google */}
          <div
            ref={carouselRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              setIsPaused(false)
              handleMouseUpOrLeave()
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '0.5rem',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: isDragging ? 'none' : 'auto',
            }}
          >
            {GOOGLE_REVIEWS.map((rev, i) => (
              <div
                key={i}
                style={{
                  flex: '0 0 clamp(290px, 31vw, 360px)',
                  scrollSnapAlign: 'start',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
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
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-pwa-install'))
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#00e5ff',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  📲 Instalar App (PWA)
                </button>
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
