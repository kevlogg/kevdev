'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PROJECTS, PROJECT_SCREENSHOTS, getProjectText, type Locale } from '@/lib/projects'

export default function Projects() {
  const t = useTranslations('projectsHome')
  const locale = useLocale() as Locale
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartRef = useRef<number>(0)

  // Screen size check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter projects by selected tag
  const filteredProjects = selectedTag === 'all'
    ? PROJECTS
    : PROJECTS.filter(p => p.tags.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase())))

  const total = filteredProjects.length

  // Reset index when filter changes
  useEffect(() => {
    setActiveIndex(0)
  }, [selectedTag])

  // Navigation handlers
  const nextProject = useCallback(() => {
    if (total === 0) return
    setActiveIndex(prev => (prev + 1) % total)
  }, [total])

  const prevProject = useCallback(() => {
    if (total === 0) return
    setActiveIndex(prev => (prev - 1 + total) % total)
  }, [total])

  // Auto-play slider (pauses on hover)
  useEffect(() => {
    if (isHovered || total <= 1) return
    const interval = setInterval(nextProject, 4500)
    return () => clearInterval(interval)
  }, [isHovered, nextProject, total])

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartRef.current - e.changedTouches[0].clientX
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) nextProject()
      else prevProject()
    }
  }

  // Calculate 3D coverflow card transform based on offset from active item
  const getCardStyle = (index: number) => {
    let diff = index - activeIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total

    const isCenter = diff === 0
    const absDiff = Math.abs(diff)

    // Hide cards beyond 2 steps away for performance and visual clarity
    if (absDiff > 2) {
      return {
        opacity: 0,
        pointerEvents: 'none' as const,
        transform: `translateX(${diff > 0 ? 500 : -500}px) scale(0.5)`,
        zIndex: 0,
      }
    }

    if (isMobile) {
      const translateX = diff * 175
      const scale = isCenter ? 1 : 0.82
      const rotateY = diff * -18
      return {
        opacity: absDiff === 2 ? 0.35 : isCenter ? 1 : 0.75,
        transform: `translateX(${translateX}px) translateZ(${isCenter ? 30 : -40}px) rotateY(${rotateY}deg) scale(${scale})`,
        zIndex: 20 - absDiff,
        filter: isCenter ? 'none' : 'brightness(0.6) blur(0.5px)',
      }
    }

    const translateX = diff * 260
    const scale = isCenter ? 1.05 : absDiff === 1 ? 0.88 : 0.74
    const rotateY = diff * -22
    const translateZ = isCenter ? 60 : absDiff === 1 ? -60 : -140

    return {
      opacity: absDiff === 2 ? 0.45 : isCenter ? 1 : 0.8,
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: 20 - absDiff,
      filter: isCenter ? 'none' : 'brightness(0.65) blur(0.5px)',
    }
  }

  const activeProject = filteredProjects[activeIndex] || PROJECTS[0]
  const activeText = getProjectText(activeProject, locale)

  return (
    <section
      id="proyectos"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          style={{ letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', display: 'block', marginBottom: '0.5rem' }}
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
          {t('headingLine1')} <span style={{ color: 'var(--color-accent)' }}>{t('headingLine2')}</span>
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
          gap: '0.4rem',
          flexWrap: 'wrap',
          marginBottom: isMobile ? '2rem' : '3rem',
          paddingInline: 'var(--gutter)',
        }}
      >
        {[
          { id: 'all', label: `Todos (${PROJECTS.length})` },
          { id: 'web', label: 'Web Apps' },
          { id: 'e-commerce', label: 'E-commerce' },
          { id: 'landing', label: 'Landings' },
          { id: 'ia', label: 'IA & SaaS' },
        ].map(filter => {
          const active = selectedTag === filter.id
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedTag(filter.id)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: isMobile ? '0.35rem 0.8rem' : '0.45rem 1.1rem',
                borderRadius: 99,
                border: `1px solid ${active ? 'var(--color-accent)' : 'rgba(255,255,255,0.12)'}`,
                background: active ? 'rgba(0, 229, 255, 0.12)' : 'rgba(10, 13, 22, 0.6)',
                color: active ? 'var(--color-accent)' : 'var(--color-muted)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* 3D Coverflow Deck Showcase Stage */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? 360 : 440,
          perspective: isMobile ? 800 : 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          marginBottom: '2rem',
        }}
      >
        {/* Coverflow Cards Container */}
        <div
          style={{
            position: 'relative',
            width: isMobile ? 260 : 340,
            height: isMobile ? 340 : 420,
            transformStyle: 'preserve-3d',
          }}
        >
          {filteredProjects.map((p, i) => {
            const projectText = getProjectText(p, locale)
            const style = getCardStyle(i)
            const isCenter = i === activeIndex
            const previewImg = PROJECT_SCREENSHOTS[p.id] || PROJECT_SCREENSHOTS['kronitt']

            return (
              <div
                key={p.id}
                onClick={() => setActiveIndex(i)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 16,
                  border: isCenter ? `1.5px solid ${p.color}` : `1px solid ${p.color}35`,
                  background: isCenter ? 'rgba(12, 16, 26, 0.98)' : 'rgba(10, 13, 22, 0.92)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: isCenter
                    ? `0 20px 50px rgba(0,0,0,0.9), 0 0 35px ${p.color}50`
                    : `0 10px 30px rgba(0,0,0,0.7), 0 0 15px ${p.color}15`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: isMobile ? '0.85rem' : '1.15rem',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s, filter 0.5s, box-shadow 0.3s, border-color 0.3s',
                  ...style,
                }}
              >
                {/* Background Ambient Glow */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '-15%',
                    right: '-15%',
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${p.color}${isCenter ? '35' : '15'} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />

                {/* Top: Web Browser Frame with Real Website Screenshot */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div
                    style={{
                      background: 'rgba(18, 22, 34, 0.95)',
                      borderRadius: '8px 8px 0 0',
                      padding: '0.35rem 0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff5f56' }} />
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffbd2e' }} />
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#27c93f' }} />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 4,
                        padding: '1px 6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: isMobile ? '0.5rem' : '0.6rem',
                        color: 'var(--color-faint)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.href ? p.href.replace('https://', '') : `${p.id}.com`}
                    </div>
                  </div>

                  {/* Screenshot Container */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: isMobile ? 135 : 175,
                      borderRadius: '0 0 6px 6px',
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
                        transform: isCenter ? 'scale(1.02)' : 'scale(1)',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, transparent 60%, rgba(10,13,22,0.92) 100%)',
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Details */}
                <div style={{ position: 'relative', zIndex: 2, marginTop: '0.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-star)' }}>
                        {p.year}
                      </span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: p.color, border: `1px solid ${p.color}50`, background: `${p.color}15`, borderRadius: 99, padding: '1px 5px', fontWeight: 600 }}>
                      {projectText.status}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: isMobile ? '1.15rem' : '1.35rem',
                      color: isCenter ? p.color : 'var(--color-star)',
                      lineHeight: 1.1,
                      margin: '0 0 0.2rem',
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.name}
                  </h3>

                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: isMobile ? '0.675rem' : '0.75rem',
                      color: 'var(--color-muted)',
                      margin: '0 0 0.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3,
                    }}
                  >
                    {projectText.tagline}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                      {projectText.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--color-faint)', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 4px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href="/proyectos"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: p.color,
                        textDecoration: 'none',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Ver →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Carousel Navigation & Counter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          marginBottom: '2.5rem',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <button
          onClick={prevProject}
          aria-label="Proyecto anterior"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1.5px solid rgba(0, 229, 255, 0.35)',
            background: 'rgba(10, 13, 22, 0.8)',
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

        {/* Counter */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--color-star)',
            letterSpacing: '0.12em',
            background: 'rgba(10, 13, 22, 0.8)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 99,
            padding: '0.35rem 1rem',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ color: 'var(--color-accent)' }}>{String(activeIndex + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
        </div>

        <button
          onClick={nextProject}
          aria-label="Proyecto siguiente"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1.5px solid rgba(0, 229, 255, 0.35)',
            background: 'rgba(10, 13, 22, 0.8)',
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

      {/* Primary CTA: Ver los 22 proyectos */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 20 }}>
        <Link
          href="/proyectos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.7rem 1.8rem' : '0.8rem 2.4rem',
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
