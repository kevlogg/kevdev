'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PROJECTS, PROJECT_SCREENSHOTS, getProjectText, type Locale } from '@/lib/projects'

export default function Projects() {
  const t = useTranslations('projectsHome')
  const locale = useLocale() as Locale
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const touchStartRef = useRef<number>(0)
  const touchStartYRef = useRef<number>(0)
  const mouseStartXRef = useRef<number>(0)
  const lastWheelTimeRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Screen size check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter projects by category
  const filteredProjects = selectedCategory === 'all'
    ? PROJECTS
    : selectedCategory === 'saas'
      ? PROJECTS.filter(p => p.tags.some(tag => ['web app', 'saas', 'ia', 'pwa'].includes(tag.toLowerCase())))
      : selectedCategory === 'ecommerce'
        ? PROJECTS.filter(p => p.tags.some(tag => ['e-commerce', 'tienda'].includes(tag.toLowerCase())))
        : PROJECTS.filter(p => p.tags.some(tag => ['landing', 'portal', 'catálogo', 'servicios'].includes(tag.toLowerCase())))

  const total = filteredProjects.length

  // Reset index when filter changes
  useEffect(() => {
    setActiveIndex(0)
  }, [selectedCategory])

  // Navigation handlers
  const nextProject = useCallback(() => {
    if (total === 0) return
    setActiveIndex(prev => (prev + 1) % total)
  }, [total])

  const prevProject = useCallback(() => {
    if (total === 0) return
    setActiveIndex(prev => (prev - 1 + total) % total)
  }, [total])

  // Auto-play slider (pauses on hover or dragging)
  useEffect(() => {
    if (isHovered || isDragging || total <= 1) return
    const interval = setInterval(nextProject, 5000)
    return () => clearInterval(interval)
  }, [isHovered, isDragging, nextProject, total])

  // Mouse wheel horizontal scroll handler
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now()
    if (now - lastWheelTimeRef.current < 450) return

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(delta) > 20) {
      lastWheelTimeRef.current = now
      if (delta > 0) nextProject()
      else prevProject()
    }
  }

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartRef.current - e.changedTouches[0].clientX
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY

    // Only swipe if mostly horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX > 0) nextProject()
      else prevProject()
    }
  }

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    mouseStartXRef.current = e.clientX
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    const deltaX = mouseStartXRef.current - e.clientX
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) nextProject()
      else prevProject()
    }
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setIsHovered(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isHovered) return
      if (e.key === 'ArrowRight') nextProject()
      if (e.key === 'ArrowLeft') prevProject()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isHovered, nextProject, prevProject])

  // Card transform calculation
  const getCardStyle = (index: number) => {
    let diff = index - activeIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total

    const isCenter = diff === 0
    const absDiff = Math.abs(diff)

    // Hide cards beyond 2 steps away
    if (absDiff > 2) {
      return {
        opacity: 0,
        pointerEvents: 'none' as const,
        transform: `translateX(${diff > 0 ? 550 : -550}px) scale(0.6)`,
        zIndex: 0,
      }
    }

    if (isMobile) {
      const translateX = diff * 190
      const scale = isCenter ? 1 : 0.84
      return {
        opacity: absDiff === 2 ? 0.25 : isCenter ? 1 : 0.72,
        transform: `translateX(${translateX}px) scale(${scale})`,
        zIndex: 20 - absDiff,
        filter: isCenter ? 'none' : 'brightness(0.65) blur(0.4px)',
      }
    }

    const translateX = diff * 320
    const scale = isCenter ? 1.02 : absDiff === 1 ? 0.88 : 0.76
    return {
      opacity: absDiff === 2 ? 0.35 : isCenter ? 1 : 0.8,
      transform: `translateX(${translateX}px) scale(${scale})`,
      zIndex: 20 - absDiff,
      filter: isCenter ? 'none' : 'brightness(0.68) blur(0.3px)',
    }
  }

  const activeProject = filteredProjects[activeIndex] || PROJECTS[0]
  const activeColor = activeProject?.color || 'var(--color-accent)'

  return (
    <section
      id="proyectos"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: isMobile ? '3.5rem 0 4.5rem' : 'clamp(4.5rem, 7vw, 6.5rem) 0',
        overflow: 'hidden',
      }}
    >
      {/* Header & Subtitle */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingInline: 'var(--gutter)' }}>
        <span
          className="type-label"
          style={{
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            display: 'block',
            marginBottom: '0.5rem',
          }}
        >
          {t('label')}
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            color: 'var(--color-star)',
            letterSpacing: '-0.02em',
            margin: '0 0 0.5rem',
            lineHeight: 1.1,
          }}
        >
          {t('headingLine1')}{' '}
          <span style={{ color: 'var(--color-accent)' }}>{t('headingLine2')}</span>
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.95rem',
            color: 'var(--color-muted)',
            margin: 0,
          }}
        >
          {t('subcopy')}
        </p>
      </div>

      {/* Filter Category Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: isMobile ? '2rem' : '2.75rem',
          paddingInline: 'var(--gutter)',
          position: 'relative',
          zIndex: 25,
        }}
      >
        {[
          { id: 'all', label: `Todos (${PROJECTS.length})` },
          { id: 'saas', label: 'Web Apps & SaaS (3)' },
          { id: 'ecommerce', label: 'E-commerce (2)' },
          { id: 'landing', label: 'Landings & Portales (5)' },
        ].map(filter => {
          const active = selectedCategory === filter.id
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedCategory(filter.id)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: isMobile ? '0.4rem 0.85rem' : '0.5rem 1.15rem',
                borderRadius: 99,
                border: `1px solid ${active ? 'var(--color-accent)' : 'rgba(255,255,255,0.12)'}`,
                background: active ? 'rgba(0, 229, 255, 0.12)' : 'rgba(10, 13, 22, 0.65)',
                color: active ? 'var(--color-accent)' : 'var(--color-muted)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                backdropFilter: 'blur(8px)',
              }}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* Interactive Horizontal Scroll Stage */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? 470 : 540,
          perspective: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          marginBottom: '2rem',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Ambient Glow behind active card */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? 320 : 500,
            height: isMobile ? 320 : 450,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${activeColor}22 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'background 0.5s ease',
          }}
        />

        {/* Carousel Cards Container */}
        <div
          style={{
            position: 'relative',
            width: isMobile ? 290 : 380,
            height: isMobile ? 450 : 510,
            transformStyle: 'preserve-3d',
          }}
        >
          {filteredProjects.map((p, i) => {
            const projectText = getProjectText(p, locale)
            const style = getCardStyle(i)
            const isCenter = i === activeIndex
            const previewImg = PROJECT_SCREENSHOTS[p.id] || '/projects/kronitt.webp'
            const domain = p.href ? p.href.replace('https://', '') : `${p.id}.com`

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (!isCenter) setActiveIndex(i)
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 18,
                  border: isCenter ? `1.5px solid ${p.color}` : '1px solid rgba(255,255,255,0.08)',
                  background: isCenter ? 'rgba(12, 16, 26, 0.98)' : 'rgba(10, 13, 22, 0.94)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: isCenter
                    ? `0 24px 60px rgba(0,0,0,0.9), 0 0 35px ${p.color}45`
                    : '0 12px 30px rgba(0,0,0,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: isMobile ? '0.9rem' : '1.25rem',
                  overflow: 'hidden',
                  cursor: isCenter ? 'default' : 'pointer',
                  transition: 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.45s, filter 0.45s, box-shadow 0.3s, border-color 0.3s',
                  ...style,
                }}
              >
                {/* Browser Frame Header */}
                <div
                  style={{
                    background: 'rgba(18, 22, 34, 0.95)',
                    borderRadius: '10px 10px 0 0',
                    padding: '0.45rem 0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderBottom: 'none',
                  }}
                >
                  {/* Traffic lights */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5f56' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffbd2e' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#27c93f' }} />
                  </div>

                  {/* URL Pill */}
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    title={`Abrir ${domain} en nueva pestaña`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: isMobile ? '0.55rem' : '0.625rem',
                      color: 'var(--color-faint)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: isMobile ? 130 : 180,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => {
                      ;(e.currentTarget as HTMLAnchorElement).style.color = p.color
                    }}
                    onMouseLeave={e => {
                      ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-faint)'
                    }}
                  >
                    <span>{domain}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>↗</span>
                  </a>

                  {/* Live status badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.525rem',
                        color: '#10b981',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Live
                    </span>
                  </div>
                </div>

                {/* Screenshot Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: isMobile ? 150 : 190,
                    borderRadius: '0 0 8px 8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderTop: 'none',
                    background: 'radial-gradient(circle at 50% 30%, rgba(30, 41, 59, 0.6), rgba(10, 13, 22, 0.95))',
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImg}
                    alt={`${p.name} website preview`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/projects/kronitt.webp'
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      transform: isCenter ? 'scale(1.02)' : 'scale(1)',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to bottom, transparent 65%, rgba(10,13,22,0.92) 100%)',
                    }}
                  />

                  {/* Year Tag floating in image */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(6, 8, 16, 0.85)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '2px 7px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      color: 'var(--color-star)',
                    }}
                  >
                    {p.year}
                  </div>
                </div>

                {/* Project Details */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    marginTop: '0.85rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Title */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 800,
                          fontSize: isMobile ? '1.2rem' : '1.35rem',
                          color: isCenter ? p.color : 'var(--color-star)',
                          lineHeight: 1.15,
                          margin: 0,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {p.name}
                      </h3>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.55rem',
                          color: p.color,
                          border: `1px solid ${p.color}40`,
                          background: `${p.color}15`,
                          borderRadius: 99,
                          padding: '1px 6px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {projectText.status}
                      </span>
                    </div>

                    {/* Tagline */}
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontWeight: 600,
                        fontSize: isMobile ? '0.75rem' : '0.825rem',
                        color: 'var(--color-star)',
                        margin: '0 0 0.35rem',
                        lineHeight: 1.35,
                      }}
                    >
                      {projectText.tagline}
                    </p>

                    {/* Description */}
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: isMobile ? '0.675rem' : '0.725rem',
                        color: 'var(--color-muted)',
                        margin: '0 0 0.65rem',
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 2 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                      }}
                    >
                      {projectText.description}
                    </p>

                    {/* Tech Tags */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                      {projectText.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.55rem',
                            color: 'var(--color-faint)',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 4,
                            padding: '1px 5px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {p.href && (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          padding: '0.45rem 0.6rem',
                          borderRadius: 8,
                          border: `1px solid ${p.color}`,
                          background: `${p.color}18`,
                          color: p.color,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          letterSpacing: '0.04em',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget
                          el.style.background = p.color
                          el.style.color = '#000'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget
                          el.style.background = `${p.color}18`
                          el.style.color = p.color
                        }}
                      >
                        <span>Visitar web</span>
                        <span>↗</span>
                      </a>
                    )}

                    <Link
                      href={`/proyectos?id=${p.id}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        padding: '0.45rem 0.6rem',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'var(--color-star)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        letterSpacing: '0.02em',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget
                        el.style.borderColor = 'rgba(255,255,255,0.35)'
                        el.style.background = 'rgba(255,255,255,0.1)'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget
                        el.style.borderColor = 'rgba(255,255,255,0.15)'
                        el.style.background = 'rgba(255,255,255,0.04)'
                      }}
                    >
                      <span>Ver ficha</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Controls, Dots & Counter Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2.5rem',
          position: 'relative',
          zIndex: 25,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={prevProject}
            aria-label="Proyecto anterior"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1.5px solid rgba(0, 229, 255, 0.35)',
              background: 'rgba(10, 13, 22, 0.85)',
              backdropFilter: 'blur(8px)',
              color: 'var(--color-accent)',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
              boxShadow: '0 0 12px rgba(0,229,255,0.15)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--color-accent)'
              el.style.boxShadow = '0 0 20px rgba(0,229,255,0.4)'
              el.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(0, 229, 255, 0.35)'
              el.style.boxShadow = '0 0 12px rgba(0,229,255,0.15)'
              el.style.transform = 'scale(1)'
            }}
          >
            ←
          </button>

          {/* Counter Badge */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-star)',
              letterSpacing: '0.12em',
              background: 'rgba(10, 13, 22, 0.85)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 99,
              padding: '0.4rem 1.15rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ color: activeColor }}>{String(activeIndex + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
          </div>

          <button
            onClick={nextProject}
            aria-label="Proyecto siguiente"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1.5px solid rgba(0, 229, 255, 0.35)',
              background: 'rgba(10, 13, 22, 0.85)',
              backdropFilter: 'blur(8px)',
              color: 'var(--color-accent)',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
              boxShadow: '0 0 12px rgba(0,229,255,0.15)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--color-accent)'
              el.style.boxShadow = '0 0 20px rgba(0,229,255,0.4)'
              el.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(0, 229, 255, 0.35)'
              el.style.boxShadow = '0 0 12px rgba(0,229,255,0.15)'
              el.style.transform = 'scale(1)'
            }}
          >
            →
          </button>
        </div>

        {/* Project indicator pills */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {filteredProjects.map((p, idx) => {
            const isCurrent = idx === activeIndex
            return (
              <button
                key={p.id}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Ir al proyecto ${p.name}`}
                style={{
                  width: isCurrent ? 24 : 8,
                  height: 6,
                  borderRadius: 99,
                  background: isCurrent ? p.color : 'rgba(255,255,255,0.2)',
                  boxShadow: isCurrent ? `0 0 8px ${p.color}` : 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Primary CTA: Ver todos los proyectos */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 25 }}>
        <Link
          href="/proyectos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.75rem 1.9rem' : '0.85rem 2.5rem',
            borderRadius: 99,
            border: '1px solid var(--color-accent)',
            background: 'rgba(0, 229, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-ui)',
            fontSize: isMobile ? '0.825rem' : '0.9rem',
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
