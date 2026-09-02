'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PROJECTS, getProjectText, type Locale } from '@/lib/projects'

// Real website preview screenshots captured from live deployments
const PROJECT_SCREENSHOTS: Record<string, string> = {
  'kronitt': '/projects/kronitt.png',
  'experience-fly': '/projects/experience-fly.png',
  'growai': '/projects/growai.png',
  'bad-bee': '/projects/bad-bee.png',
  'nexo': '/projects/nexo.png',
  'dulce-hogar': '/projects/dulce-hogar.png',
  'mundialito': '/projects/mundialito.png',
  'andreac-tejidos': '/projects/dulce-hogar.png',
  'la-rodante-del-desierto': '/projects/la-rodante-del-desierto.png',
  'calvos-compresores': '/projects/calvos-compresores.png',
  'orimar': '/projects/calvos-compresores.png',
}

export default function Projects() {
  const t = useTranslations('projectsHome')
  const locale = useLocale() as Locale
  const [rotationY, setRotationY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const startXRef = useRef(0)
  const startRotRef = useRef(0)

  const n = PROJECTS.length

  // Screen size listener
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-orbit animation loop (pauses during drag or hover)
  useEffect(() => {
    let animId: number
    const animate = () => {
      if (!isDragging && !hoveredId) {
        setRotationY(prev => prev + (isMobile ? 0.08 : 0.1))
      }
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [isDragging, hoveredId, isMobile])

  // Drag handlers with controlled sensitivity
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    startXRef.current = e.clientX
    startRotRef.current = rotationY
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId) } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startXRef.current
    // Controlled low sensitivity on mobile for smooth drag
    const sensitivity = isMobile ? 0.08 : 0.28
    setRotationY(startRotRef.current + deltaX * sensitivity)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId) } catch {}
  }

  const radius = isMobile ? 220 : 440

  return (
    <section
      id="proyectos"
      style={{
        position: 'relative',
        zIndex: 10,
        padding: isMobile ? '2.5rem 0' : 'clamp(4rem, 6vw, 6rem) 0',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .projects-3d-card {
          width: 230px;
          height: 290px;
          padding: 0.85rem;
        }
        .projects-card-img-wrap {
          height: 85px;
        }
        .projects-card-title {
          font-size: 1.15rem;
        }
        .projects-card-tagline {
          font-size: 0.725rem;
        }
        @media (max-width: 767px) {
          .projects-3d-card {
            width: 145px !important;
            height: 195px !important;
            padding: 0.5rem !important;
            border-radius: 10px !important;
          }
          .projects-card-img-wrap {
            height: 52px !important;
          }
          .projects-card-title {
            font-size: 0.8rem !important;
            line-height: 1.05 !important;
            margin-bottom: 0.1rem !important;
          }
          .projects-card-tagline {
            font-size: 0.575rem !important;
            line-height: 1.25 !important;
          }
        }
      `}</style>

      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.25rem' : '2.5rem', paddingInline: 'var(--gutter)' }}>
        <span className="type-label" style={{ letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
          {t('label')}
        </span>
      </div>

      {/* 3D Cylindrical Ring Carousel Container */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: '100%',
          height: isMobile ? 215 : 330,
          perspective: isMobile ? 650 : 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'pan-y',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: isMobile ? 145 : 230,
            height: isMobile ? 195 : 290,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotationY}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s linear',
          }}
        >
          {PROJECTS.map((p, i) => {
            const projectText = getProjectText(p, locale)
            const angle = (i / n) * 360
            const isHovered = hoveredId === p.id
            const previewImg = PROJECT_SCREENSHOTS[p.id] || PROJECT_SCREENSHOTS['kronitt']

            return (
              <div
                key={p.id}
                className="projects-3d-card"
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: isHovered ? `1.5px solid ${p.color}` : `1px solid ${p.color}45`,
                  background: isHovered ? 'rgba(12, 16, 26, 0.96)' : 'rgba(10, 13, 22, 0.92)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: isHovered
                    ? `0 16px 40px rgba(0,0,0,0.92), 0 0 30px ${p.color}60`
                    : `0 8px 24px rgba(0,0,0,0.7), 0 0 16px ${p.color}18`,
                  transform: `rotateY(${angle}deg) translateZ(${radius + (isHovered ? 15 : 0)}px) scale(${isHovered ? 1.04 : 1})`,
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  zIndex: isHovered ? 30 : 1,
                  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s, border-color 0.3s, background 0.3s',
                }}
              >
                {/* Background radial accent glow */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-20%',
                    width: isMobile ? 100 : 140,
                    height: isMobile ? 100 : 140,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${p.color}${isHovered ? '45' : '25'} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'background 0.3s',
                  }}
                />

                {/* Top: Compact Browser Mockup with Real Website Screenshot */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  {/* Browser Bar */}
                  <div
                    style={{
                      background: 'rgba(18, 22, 34, 0.95)',
                      borderRadius: '5px 5px 0 0',
                      padding: isMobile ? '0.15rem 0.3rem' : '0.3rem 0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#ff5f56' }} />
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#ffbd2e' }} />
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#27c93f' }} />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 2,
                        padding: '1px 3px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: isMobile ? '0.4rem' : '0.5rem',
                        color: 'var(--color-faint)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.href ? p.href.replace('https://', '') : `${p.id}.com`}
                    </div>
                  </div>

                  {/* Website Preview Screenshot */}
                  <div
                    className="projects-card-img-wrap"
                    style={{
                      position: 'relative',
                      width: '100%',
                      borderRadius: '0 0 4px 4px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderTop: 'none',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImg}
                      alt={`${p.name} website preview`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.4s ease-out',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, transparent 55%, rgba(10,13,22,0.9) 100%)',
                      }}
                    />
                  </div>
                </div>

                {/* Content: Title, Tagline & Pinned Link */}
                <div style={{ position: 'relative', zIndex: 2, marginTop: isMobile ? '0.25rem' : '0.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.45rem' : '0.6rem', color: 'var(--color-star)' }}>
                        {p.year}
                      </span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.4rem' : '0.525rem', color: p.color, border: `1px solid ${p.color}50`, background: `${p.color}15`, borderRadius: 99, padding: '1px 3px', fontWeight: 600 }}>
                      {projectText.status}
                    </span>
                  </div>

                  <h3
                    className="projects-card-title"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      color: isHovered ? p.color : 'var(--color-star)',
                      lineHeight: 1.1,
                      margin: '0 0 0.15rem',
                      letterSpacing: '-0.02em',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      transition: 'color 0.25s',
                    }}
                  >
                    {p.name}
                  </h3>

                  <p
                    className="projects-card-tagline"
                    style={{
                      fontFamily: 'var(--font-ui)',
                      color: 'var(--color-muted)',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {projectText.tagline}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '0.25rem' }}>
                    <Link
                      href="/proyectos"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: isMobile ? '0.5rem' : '0.625rem',
                        fontWeight: 700,
                        color: p.color,
                        textDecoration: 'none',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        textShadow: `0 0 6px ${p.color}50`,
                      }}
                    >
                      Ver proyecto →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Primary CTA Button: Ver Proyectos */}
      <div style={{ textAlign: 'center', marginTop: isMobile ? '1.5rem' : '2.5rem' }}>
        <Link
          href="/proyectos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.6rem 1.5rem' : '0.75rem 2.25rem',
            borderRadius: 99,
            border: '1px solid var(--color-accent)',
            background: 'rgba(0, 229, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-ui)',
            fontSize: isMobile ? '0.775rem' : '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textDecoration: 'none',
            boxShadow: '0 0 24px rgba(0, 229, 255, 0.2)',
            transition: 'all 0.25s var(--ease-expo)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = 'var(--color-accent)'
            el.style.color = 'var(--color-on-accent)'
            el.style.boxShadow = '0 0 32px rgba(0, 229, 255, 0.45)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(0, 229, 255, 0.08)'
            el.style.color = 'var(--color-accent)'
            el.style.boxShadow = '0 0 24px rgba(0, 229, 255, 0.2)'
          }}
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  )
}
