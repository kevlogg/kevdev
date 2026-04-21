'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const T = {
  headline: 0.9,
  bottom:   1.4,
  glow:     1.7,
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const fn = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener('mousemove', fn, { passive: true })
    return () => window.removeEventListener('mousemove', fn)
  }, [mouseX, mouseY])

  /* Fade content as user scrolls away — prevents overlap with next section */
  const { scrollY } = useScroll()
  const contentOpacity = useTransform(scrollY, [0, 320], [1, 0])
  const contentY       = useTransform(scrollY, [0, 320], [0, -48])

  function scrollTo(href: string) {
    const el = document.querySelector(href)
    if (!el) return
    const lenis = (window as any).__lenis
    lenis ? lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100svh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cursor glow */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T.glow, duration: 1.4 }}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 3,
          x: useTransform(springX, v => v - 320),
          y: useTransform(springY, v => v - 320),
        }}
      />

      {/* ── Content — fades + rises on scroll ─────────────────────── */}
      <motion.div
        style={{
          position: 'relative', zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: `clamp(6rem, 10vw, 7.5rem) var(--gutter) clamp(2.5rem, 4vw, 3.5rem)`,
          opacity: contentOpacity,
          y: contentY,
        }}
      >
        {/* Headline — enter animation + scroll fade handled by parent */}
        <motion.div
          style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: T.headline, ease: EASE }}
        >
          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontWeight:    800,
            fontSize:      'clamp(2.75rem, 7.5vw, 7rem)',
            lineHeight:    0.92,
            letterSpacing: '-0.03em',
            color:         'var(--color-star)',
            maxWidth:      '16ch',
          }}>
            Construyo{' '}
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontStyle:  'italic',
              fontWeight: 400,
              color:      'var(--color-accent)',
            }}>productos</span>
            <br />
            que funcionan.
          </h1>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: T.bottom, ease: EASE }}
          style={{
            display:        'flex',
            alignItems:     'flex-end',
            justifyContent: 'space-between',
            gap:            '2rem',
            flexWrap:       'wrap',
            paddingTop:     'clamp(2rem, 4vw, 3rem)',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 400,
            fontSize:   'clamp(0.875rem, 1.1vw, 0.9375rem)',
            lineHeight: 1.7,
            color:      'var(--color-muted)',
            maxWidth:   '36ch',
            margin:     0,
          }}>
            Landing pages, web apps, MVPs y automatizaciones.<br />
            Con foco en negocio, validación y ejecución real.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
            <CTADark onClick={() => scrollTo('#proyectos')}>Ver proyectos</CTADark>
            <CTAArrow onClick={() => scrollTo('#contacto')} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ─── Buttons ──────────────────────────────────────────────────────── */
function CTADark({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily:     'var(--font-ui)', fontWeight: 600,
        fontSize:       '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        padding:        '0.875rem 1.75rem',
        border:         `1px solid ${hov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius:   99, cursor: 'pointer',
        background:     hov ? 'rgba(6,8,16,0.85)' : 'rgba(6,8,16,0.72)',
        backdropFilter: 'blur(16px)',
        color:          hov ? 'var(--color-star)' : 'var(--color-muted)',
        transition:     'all 0.25s var(--ease-expo)',
        transform:      hov ? 'translateY(-1px)' : 'none',
      }}>
      {children}
    </button>
  )
}

function CTAArrow({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      aria-label="Contacto"
      style={{
        width:        '3rem', height: '3rem',
        borderRadius: '50%', border: 'none', cursor: 'pointer',
        display:      'flex', alignItems: 'center', justifyContent: 'center',
        background:   hov ? 'var(--color-accent-hi)' : 'var(--color-accent)',
        color:        'var(--color-on-accent)',
        fontSize:     '1.125rem', lineHeight: 1,
        transition:   'background 0.22s var(--ease-expo), transform 0.22s var(--ease-expo)',
        transform:    hov ? 'scale(1.1) rotate(-12deg)' : 'scale(1) rotate(0deg)',
        boxShadow:    hov ? '0 6px 28px rgba(34,211,238,0.32)' : '0 0 0 transparent',
        flexShrink:   0,
      }}>
      ↗
    </button>
  )
}
