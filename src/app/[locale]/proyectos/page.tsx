'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import TechSpecModal from '@/components/ui/TechSpecModal'
import CaseStudyModal from '@/components/ui/CaseStudyModal'
import { PROJECTS, PROJECT_SCREENSHOTS, getProjectText, type Project, type Locale } from '@/lib/projects'

type PageState = 'intro' | 'carousel'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

const cardVariants = {
  enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: (dir: number) => ({
    x: dir * -80,
    opacity: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export default function ProyectosPage() {
  const [pageState, setPageState]       = useState<PageState>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection]       = useState<1 | -1>(1)

  // Direct deep link support (?id=... or ?project=...)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const targetId = params.get('id') || params.get('project')
    if (targetId) {
      const idx = PROJECTS.findIndex(p => p.id === targetId)
      if (idx !== -1) {
        setCurrentIndex(idx)
        setPageState('carousel')
      }
    }
  }, [])

  const enterCarousel = useCallback(() => setPageState('carousel'), [])

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir)
    setCurrentIndex(prev => (prev + dir + PROJECTS.length) % PROJECTS.length)
  }, [])

  const selectProject = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex])

  const currentProject = PROJECTS[currentIndex] || PROJECTS[0]
  const previewImg = PROJECT_SCREENSHOTS[currentProject.id] || '/projects/kronitt.webp'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', minHeight: '100vh', overflow: 'hidden' }}>
      <div className="grain"    aria-hidden />
      <div className="vignette" aria-hidden />

      {/* Dynamic Fullscreen Website Preview Background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProject.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImg}
              alt={`${currentProject.name} website preview background`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
                filter: 'blur(5px) brightness(0.28) contrast(1.15)',
              }}
            />
            {/* Dark Ambient Vignette + Radial Tint matching active project color */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 50% 45%, ${currentProject.color}35 0%, rgba(6, 8, 16, 0.88) 60%, rgba(4, 6, 12, 0.98) 100%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
        <Navbar />

        <AnimatePresence mode="wait">
          {pageState === 'intro' ? (
            <IntroState key="intro" onEnter={enterCarousel} />
          ) : (
            <CarouselState
              key="carousel"
              currentIndex={currentIndex}
              direction={direction}
              onNavigate={navigate}
              onSelectProject={selectProject}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Intro ──────────────────────────────────────────────────────────── */
function IntroState({ onEnter }: { onEnter: () => void }) {
  const t = useTranslations('proyectosPage.intro')
  const [hov, setHov] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: EASE_OUT } }}
      transition={{ duration: 0.4 }}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--gutter)',
        gap: '1.25rem',
      }}
    >
      <motion.span
        className="type-label"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT }}
        style={{ color: 'var(--color-accent)' }}
      >
        {t('label')}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(2.5rem, 6.5vw, 5.5rem)',
          lineHeight: 0.98,
          letterSpacing: '-0.03em',
          color: 'var(--color-star)',
          margin: 0,
        }}
      >
        {t('heading')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT }}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '1rem',
          color: 'var(--color-muted)',
          maxWidth: 440,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {t('subcopy')}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.65, ease: EASE_OUT }}
        onClick={onEnter}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          marginTop: '0.5rem',
          padding: '0.8rem 2.2rem',
          border: '1px solid var(--color-accent)',
          borderRadius: 99,
          background: hov ? 'var(--color-accent)' : 'rgba(0, 229, 255, 0.08)',
          color: hov ? 'var(--color-on-accent)' : 'var(--color-accent)',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          boxShadow: hov ? '0 0 30px rgba(0,229,255,0.4)' : '0 0 15px rgba(0,229,255,0.15)',
          transition: 'all 0.25s ease',
        }}
      >
        {t('cta')}
      </motion.button>
    </motion.div>
  )
}

/* ─── Carousel ───────────────────────────────────────────────────────── */
function CarouselState({
  currentIndex,
  direction,
  onNavigate,
  onSelectProject,
}: {
  currentIndex: number
  direction: 1 | -1
  onNavigate: (dir: 1 | -1) => void
  onSelectProject: (index: number) => void
}) {
  const lastNav    = useRef(0)
  const touchStart = useRef(0)

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNavigate(1)
      if (e.key === 'ArrowLeft') onNavigate(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onNavigate])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const now = Date.now()
    if (now - lastNav.current < 650) return
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(delta) < 15) return
    lastNav.current = now
    onNavigate(delta > 0 ? 1 : -1)
  }, [onNavigate])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const delta = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) onNavigate(delta > 0 ? 1 : -1)
  }, [onNavigate])

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Top Counter Bar */}
      <div style={{
        position: 'absolute',
        top: 'clamp(5.5rem, 9vh, 7.5rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--color-star)',
        letterSpacing: '0.12em',
        background: 'rgba(10, 13, 22, 0.85)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 99,
        padding: '0.35rem 1rem',
        backdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap',
        zIndex: 20,
      }}>
        <span style={{ color: 'var(--color-accent)' }}>{String(currentIndex + 1).padStart(2, '0')}</span> / {String(PROJECTS.length).padStart(2, '0')}
      </div>

      <ArrowButton direction="left"  onClick={() => onNavigate(-1)} />

      <AnimatePresence mode="wait" custom={direction}>
        <ProjectCard
          key={currentIndex}
          project={PROJECTS[currentIndex]}
          direction={direction}
        />
      </AnimatePresence>

      <ArrowButton direction="right" onClick={() => onNavigate(1)} />

      {/* Bottom Horizontal Quick-Switcher Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(1rem, 3.5vh, 2.5rem)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center',
          maxWidth: '92vw',
          overflowX: 'auto',
          padding: '0.4rem 0.65rem',
          background: 'rgba(10, 13, 22, 0.82)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 99,
          backdropFilter: 'blur(12px)',
          zIndex: 25,
          scrollbarWidth: 'none',
        }}
      >
        {PROJECTS.map((p, idx) => {
          const isCurrent = idx === currentIndex
          return (
            <button
              key={p.id}
              onClick={() => onSelectProject(idx)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                fontWeight: isCurrent ? 700 : 500,
                padding: '0.3rem 0.65rem',
                borderRadius: 99,
                border: `1px solid ${isCurrent ? p.color : 'transparent'}`,
                background: isCurrent ? `${p.color}25` : 'transparent',
                color: isCurrent ? p.color : 'var(--color-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {p.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Project Card ───────────────────────────────────────────────────── */
function ProjectCard({ project: rawProject, direction }: { project: Project; direction: 1 | -1 }) {
  const t = useTranslations('proyectosPage')
  const locale = useLocale() as Locale
  const project = getProjectText(rawProject, locale)
  const colorAlpha = project.color + '4D'
  const [showSpec, setShowSpec] = useState(false)
  const [hovSpec, setHovSpec] = useState(false)
  const [showCase, setShowCase] = useState(false)
  const [hovCase, setHovCase] = useState(false)

  return (
    <motion.div
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{
        maxWidth: 720,
        width: '100%',
        textAlign: 'center',
        paddingInline: 'var(--gutter)',
        position: 'relative',
        zIndex: 15,
      }}
    >
      {/* Status & Year bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#10b981', flexShrink: 0,
          boxShadow: '0 0 10px #10b981',
        }} />
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.725rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#10b981', fontWeight: 700,
        }}>
          {project.status}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.725rem',
          color: 'var(--color-faint)', marginLeft: '0.5rem',
        }}>
          {project.year}
        </span>
      </div>

      {/* Project Title */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(2.4rem, 6.5vw, 5rem)',
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color: project.color,
        margin: '0 0 0.75rem',
      }}>
        {project.name}
      </h2>

      {/* Tagline */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 'clamp(1rem, 2vw, 1.15rem)',
        fontWeight: 600,
        color: 'var(--color-star)',
        margin: '0 0 0.85rem',
        lineHeight: 1.4,
      }}>
        {project.tagline}
      </p>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.9375rem',
        color: 'var(--color-muted)',
        lineHeight: 1.65,
        margin: '0 auto 1.5rem',
        maxWidth: 580,
      }}>
        {project.description}
      </p>

      {/* Technology chips */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        gap: '0.4rem', justifyContent: 'center',
        marginBottom: '1.75rem',
      }}>
        {project.tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.05em',
            color: project.color,
            border: `1px solid ${colorAlpha}`,
            background: `${project.color}10`,
            borderRadius: 99,
            padding: '4px 12px',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Live Project Link Button */}
      {project.href && (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = project.color
            el.style.color = '#000'
            el.style.boxShadow = `0 0 25px ${project.color}60`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = 'transparent'
            el.style.color = project.color
            el.style.boxShadow = 'none'
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.75rem',
            border: `1.5px solid ${project.color}`,
            borderRadius: 99,
            color: project.color,
            fontFamily: 'var(--font-ui)',
            fontSize: '0.9rem',
            fontWeight: 700,
            textDecoration: 'none',
            letterSpacing: '0.04em',
            background: 'transparent',
            transition: 'all 0.25s ease',
          }}
        >
          <span>{t('viewProject')}</span>
          <span>↗</span>
        </a>
      )}

      {/* Tech Spec & Case Study Buttons */}
      {(project.techSpec || project.techSpecs || project.caseStudy) && (
        <div style={{ marginTop: '1.15rem', display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {(project.techSpec || project.techSpecs) && (
            <button
              onClick={() => setShowSpec(true)}
              onMouseEnter={() => setHovSpec(true)}
              onMouseLeave={() => setHovSpec(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.25rem',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 99,
                background: hovSpec ? 'rgba(255,255,255,0.08)' : 'none',
                color: hovSpec ? 'var(--color-star)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                borderColor: hovSpec ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
              }}
            >
              {t('techSpecBtn')}
            </button>
          )}

          {project.caseStudy && (
            <button
              onClick={() => setShowCase(true)}
              onMouseEnter={() => setHovCase(true)}
              onMouseLeave={() => setHovCase(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.25rem',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 99,
                background: hovCase ? 'rgba(255,255,255,0.08)' : 'none',
                color: hovCase ? 'var(--color-star)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                borderColor: hovCase ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
              }}
            >
              {t('caseStudyBtn')}
            </button>
          )}
        </div>
      )}

      {showSpec && (project.techSpec || project.techSpecs) && (
        <TechSpecModal project={project} onClose={() => setShowSpec(false)} />
      )}

      {showCase && project.caseStudy && (
        <CaseStudyModal project={project} onClose={() => setShowCase(false)} />
      )}
    </motion.div>
  )
}

/* ─── Arrow Button ───────────────────────────────────────────────────── */
function ArrowButton({ direction, onClick }: {
  direction: 'left' | 'right'
  onClick: () => void
}) {
  const t = useTranslations('proyectosPage')
  const [hov, setHov] = useState(false)
  const side = direction === 'left' ? 'left' : 'right'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={direction === 'left' ? t('prevAria') : t('nextAria')}
      style={{
        position: 'absolute',
        [side]: 'clamp(0.5rem, 3vw, 3rem)',
        top: '50%',
        transform: `translateY(-50%) scale(${hov ? 1.08 : 1})`,
        width: 'clamp(42px, 7vw, 54px)',
        height: 'clamp(42px, 7vw, 54px)',
        borderRadius: '50%',
        border: `1.5px solid ${hov ? 'var(--color-accent)' : 'rgba(255,255,255,0.35)'}`,
        background: hov ? 'rgba(0, 229, 255, 0.15)' : 'rgba(10,12,20,0.65)',
        backdropFilter: 'blur(8px)',
        boxShadow: hov ? '0 0 25px rgba(0,229,255,0.35)' : '0 2px 12px rgba(0,0,0,0.35)',
        color: hov ? 'var(--color-accent)' : 'var(--color-star)',
        fontSize: 'clamp(1rem, 3vw, 1.35rem)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s ease',
        flexShrink: 0,
        zIndex: 25,
      }}
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  )
}
