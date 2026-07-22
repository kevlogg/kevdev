'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import { PROJECTS, type Project } from '@/lib/projects'

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
  const videoRef = useRef<HTMLVideoElement>(null)

  const enterCarousel = useCallback(() => setPageState('carousel'), [])

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir)
    setCurrentIndex(prev => (prev + dir + PROJECTS.length) % PROJECTS.length)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play()
  }, [currentIndex])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div className="grain"    aria-hidden />
      <div className="vignette" aria-hidden />

      <style>{`
        @media (max-width: 768px) {
          .project-bg-video-wrap {
            inset: auto !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 45vh !important;
            border-radius: 0 0 16px 16px;
          }
          .project-bg-video {
            min-width: unset !important;
            min-height: unset !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
        }
      `}</style>

      <div
        className="project-bg-video-wrap"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="project-bg-video"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        >
          <source src="/video-proyectos.mp4" type="video/mp4" />
        </video>
      </div>

      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6,8,16,0.55)',
          zIndex: 1,
        }}
      />

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
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Intro ──────────────────────────────────────────────────────────── */
function IntroState({ onEnter }: { onEnter: () => void }) {
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
        Proyectos
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(3rem, 7vw, 6rem)',
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          color: 'var(--color-star)',
          margin: 0,
        }}
      >
        Lo que construyo<br />habla por si solo.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT }}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '1rem',
          color: 'var(--color-muted)',
          maxWidth: 420,
          margin: 0,
        }}
      >
        9 productos reales. En produccion. Sin demos, sin relleno.
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
          padding: '0.75rem 2rem',
          border: '1px solid var(--color-accent)',
          borderRadius: 99,
          background: hov ? 'var(--color-accent)' : 'transparent',
          color: hov ? 'var(--color-on-accent)' : 'var(--color-accent)',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          cursor: 'pointer',
          transition: 'background 0.25s, color 0.25s',
        }}
      >
        Entrar a la galeria →
      </motion.button>
    </motion.div>
  )
}

/* ─── Carousel ───────────────────────────────────────────────────────── */
function CarouselState({ currentIndex, direction, onNavigate }: {
  currentIndex: number
  direction: 1 | -1
  onNavigate: (dir: 1 | -1) => void
}) {
  const lastNav    = useRef(0)
  const touchStart = useRef(0)

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
      <div style={{
        position: 'absolute',
        top: 'clamp(6rem, 10vh, 8rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--color-faint)',
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>
        {String(currentIndex + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
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
    </div>
  )
}

/* ─── Project Card ───────────────────────────────────────────────────── */
function ProjectCard({ project, direction }: { project: Project; direction: 1 | -1 }) {
  const colorAlpha = project.color + '4D'

  return (
    <motion.div
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{
        maxWidth: 680,
        width: '100%',
        textAlign: 'center',
        paddingInline: 'var(--gutter)',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.25rem',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: project.statusDot, flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.6875rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-faint)',
        }}>
          {project.status}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
          color: 'var(--color-faint)', marginLeft: '0.5rem',
        }}>
          {project.year}
        </span>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(3.5rem, 8vw, 7rem)',
        lineHeight: 0.95,
        letterSpacing: '-0.03em',
        color: project.color,
        margin: '0 0 0.75rem',
      }}>
        {project.name}
      </h2>

      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '1.0625rem',
        color: 'var(--color-muted)',
        margin: '0 0 1rem',
        lineHeight: 1.5,
      }}>
        {project.tagline}
      </p>

      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.9375rem',
        color: 'var(--color-faint)',
        lineHeight: 1.7,
        margin: '0 auto 1.5rem',
        maxWidth: 560,
      }}>
        {project.description}
      </p>

      <div style={{
        display: 'flex', flexWrap: 'wrap',
        gap: '0.375rem', justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        {project.tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            letterSpacing: '0.07em',
            color: project.color,
            border: `1px solid ${colorAlpha}`,
            borderRadius: 99,
            padding: '3px 10px',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {project.href && (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = project.color + '1A'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
          }}
          style={{
            display: 'inline-block',
            padding: '0.625rem 1.5rem',
            border: `1px solid ${project.color}`,
            borderRadius: 99,
            color: project.color,
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.04em',
            background: 'transparent',
            transition: 'background 0.25s',
          }}
        >
          Ver proyecto ↗
        </a>
      )}
    </motion.div>
  )
}

/* ─── Arrow Button ───────────────────────────────────────────────────── */
function ArrowButton({ direction, onClick }: {
  direction: 'left' | 'right'
  onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  const side = direction === 'left' ? 'left' : 'right'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={direction === 'left' ? 'Proyecto anterior' : 'Proyecto siguiente'}
      style={{
        position: 'absolute',
        [side]: 'clamp(1.5rem, 4vw, 3rem)',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
        background: 'none',
        color: hov ? 'var(--color-star)' : 'var(--color-faint)',
        fontSize: '1.125rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.25s, color 0.25s',
        flexShrink: 0,
      }}
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  )
}
