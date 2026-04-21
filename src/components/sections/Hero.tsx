'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { stagger, fadeInUp, fadeIn } from '@/lib/motion'

const STACK = ['React', 'Node.js', 'Firebase', 'FlutterFlow', 'IA', 'Automatización']

export default function Hero() {
  // Cursor glow
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 })

  useEffect(() => {
    const fn = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener('mousemove', fn, { passive: true })
    return () => window.removeEventListener('mousemove', fn)
  }, [mouseX, mouseY])

  function scrollTo(href: string) {
    const el = document.querySelector(href)
    if (!el) return
    const lenis = (window as any).__lenis
    lenis ? lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section style={{
      position: 'relative', minHeight: '100svh',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end', paddingBottom: 'clamp(3rem, 6vw, 5rem)',
      overflow: 'hidden',
    }}>
      {/* Cursor glow — luz ámbar que sigue el mouse */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 480, height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 3,
          x: useTransform(springX, v => v - 240),
          y: useTransform(springY, v => v - 240),
          filter: 'blur(0px)',
        }}
      />

      {/* Contenido */}
      <div className="site-container" style={{ position: 'relative', zIndex: 10 }}>

        {/* Label superior */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22,1,0.36,1] }}
          style={{ marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}
        >
          <span className="type-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                           background: 'var(--color-accent)', opacity: 0.9 }} />
            Digital Product Builder · Buenos Aires
          </span>
        </motion.div>

        {/* Headline — la pieza central */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          {/* Línea 1 — serif italic grande */}
          <motion.h1 variants={fadeInUp} style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 'clamp(3.5rem, 9.5vw, 8.5rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
            color: 'var(--color-star)',
            display: 'block',
          }}>
            Construyo
          </motion.h1>

          {/* Línea 2 — con acento en "productos" */}
          <motion.div variants={fadeInUp} style={{
            display: 'flex', alignItems: 'baseline', flexWrap: 'wrap',
            gap: '0 0.3em',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(3.5rem, 9.5vw, 8.5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.025em',
              color: 'var(--color-accent)',
            }}>
              productos
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(3.5rem, 9.5vw, 8.5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.025em',
              color: 'var(--color-star)',
            }}>
              que
            </span>
          </motion.div>

          {/* Línea 3 */}
          <motion.span variants={fadeInUp} style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 'clamp(3.5rem, 9.5vw, 8.5rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
            color: 'var(--color-star)',
            display: 'block',
          }}>
            funcionan.
          </motion.span>
        </motion.div>

        {/* Fila inferior: descriptor + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.75, ease: [0.22,1,0.36,1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1.5rem, 4vw, 3rem)',
            alignItems: 'end',
          }}
        >
          {/* Descriptor */}
          <div>
            <p style={{
              fontFamily: 'var(--font-ui)', fontWeight: 400,
              fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
              lineHeight: 1.7, color: 'var(--color-muted)',
              maxWidth: '46ch',
            }}>
              Landing pages, web apps, MVPs y automatizaciones.
              <br />Con foco en negocio, validación y ejecución real.
            </p>

            {/* Stack tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
              {STACK.map(tech => (
                <span key={tech} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                  letterSpacing: '0.06em',
                  color: 'var(--color-faint)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 4, padding: '3px 8px',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.color = 'var(--color-muted)'
                    el.style.borderColor = 'rgba(255,255,255,0.14)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.color = 'var(--color-faint)'
                    el.style.borderColor = 'rgba(255,255,255,0.07)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            <CTAPrimary onClick={() => scrollTo('#contacto')}>
              Hablemos
            </CTAPrimary>
            <CTAGhost onClick={() => scrollTo('#proyectos')}>
              Ver proyectos
            </CTAGhost>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{
          position: 'absolute', bottom: 'clamp(1.5rem, 3vw, 2.5rem)',
          right: 'var(--gutter)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 8, zIndex: 10,
        }}
      >
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.625rem',
                       letterSpacing: '0.14em', textTransform: 'uppercase',
                       color: 'var(--color-faint)', writingMode: 'vertical-rl' }}>
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--color-faint), transparent)' }}
        />
      </motion.div>
    </section>
  )
}

function CTAPrimary({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'var(--font-ui)', fontWeight: 600,
        fontSize: '0.8125rem', letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '0.875rem 1.875rem', border: 'none', borderRadius: 6, cursor: 'pointer',
        background: hov ? '#d4b47a' : 'var(--color-accent)',
        color: '#09090e',
        transition: 'background 0.25s var(--ease-expo), transform 0.2s',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? '0 4px 24px rgba(201,169,110,0.22)' : 'none',
      }}>
      {children}
    </button>
  )
}

function CTAGhost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'var(--font-ui)', fontWeight: 500,
        fontSize: '0.8125rem', letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '0.875rem 1.875rem', cursor: 'pointer', borderRadius: 6,
        background: 'transparent',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
        color: hov ? 'var(--color-star)' : 'var(--color-muted)',
        transition: 'all 0.25s var(--ease-expo)',
      }}>
      {children}
    </button>
  )
}

// useState needed for button hover — add import
import { useState } from 'react'
