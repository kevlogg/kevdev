'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import MacbookHero from './MacbookHero'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const T = {
  headline: 0.9,
  bottom:   1.4,
  glow:     1.7,
}

export default function Hero() {
  const t = useTranslations('hero')
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
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            gap: '0.25rem',
          }}
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
            {t('headlinePre')}{' '}
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontStyle:  'italic',
              fontWeight: 400,
              color:      'var(--color-accent)',
            }}>{t('headlineItalic')}</span>
            <br />
            {t('headlinePost')}
          </h1>

          {/* Decorative CSS-only 3D MacBook — sits right beside the headline */}
          <MacbookHero />
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: T.bottom, ease: EASE }}
          style={{
            display:        'flex',
            flexDirection:  'column',
            gap:            '2rem',
            paddingTop:     'clamp(2rem, 4vw, 3rem)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {t.raw('chips').map((chip: string) => (
                <span key={chip} style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      'clamp(0.625rem, 0.9vw, 0.75rem)',
                  letterSpacing: '0.05em',
                  color:         'rgba(221,232,255,0.55)',
                  border:        '1px solid rgba(255,255,255,0.13)',
                  borderRadius:  99,
                  padding:       '0.3rem 0.75rem',
                }}>
                  {chip}
                </span>
              ))}
            </div>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 400,
              fontSize:   'clamp(0.8rem, 1vw, 0.875rem)',
              lineHeight: 1.6,
              color:      'var(--color-muted)',
              maxWidth:   '36ch',
              margin:     0,
            }}>
              {t('subcopy')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <CTADark onClick={() => scrollTo('#proyectos')}>{t('ctaProjects')}</CTADark>
            <CTADiagnostico href="/diagnostico">{t('ctaDiagnostico')}</CTADiagnostico>
            <CTAArrow href={`https://wa.me/542235851419?text=${encodeURIComponent(t('whatsappMessage'))}`}>{t('ctaDemo')}</CTAArrow>
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

function CTADiagnostico({ href, children }: { href: string; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily:     'var(--font-ui)', fontWeight: 600,
        fontSize:       '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        padding:        '0.875rem 1.75rem',
        border:         `1px solid rgba(79,195,247,${hov ? '0.4' : '0.2'})`,
        borderRadius:   99, cursor: 'pointer',
        background:     hov ? 'rgba(79,195,247,0.08)' : 'rgba(79,195,247,0.04)',
        backdropFilter: 'blur(16px)',
        color:          hov ? 'var(--cyan)' : 'rgba(79,195,247,0.7)',
        textDecoration: 'none',
        transition:     'all 0.25s var(--ease-expo)',
        transform:      hov ? 'translateY(-1px)' : 'none',
        display:        'inline-block',
      }}>
      {children}
    </Link>
  )
}

function CTAArrow({ href, children }: { href: string; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={href} target="_blank" rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:      'flex', alignItems: 'center', gap: '0.5rem',
        padding:      '0 1.25rem',
        height:       '3rem',
        borderRadius: '99px', border: 'none', cursor: 'pointer',
        background:   hov ? 'var(--color-accent-hi)' : 'var(--color-accent)',
        color:        'var(--color-on-accent)',
        fontFamily:   'var(--font-ui)',
        fontSize:     '0.875rem',
        fontWeight:   700,
        letterSpacing:'0.01em',
        textDecoration: 'none',
        whiteSpace:   'nowrap',
        transition:   'background 0.22s var(--ease-expo), transform 0.22s var(--ease-expo), box-shadow 0.22s',
        transform:    hov ? 'scale(1.04)' : 'scale(1)',
        boxShadow:    hov ? '0 6px 28px rgba(34,211,238,0.32)' : '0 0 0 transparent',
        flexShrink:   0,
      }}>
      {children}
    </a>
  )
}
