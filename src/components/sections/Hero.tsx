'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import MacbookHero from './MacbookHero'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const T = {
  headline: 0.02,
  bottom:   0.35,
  glow:     0.5,
}

function BlurEmergeText({
  text,
  delayOffset = 0,
  style,
}: {
  text: string
  delayOffset?: number
  style?: React.CSSProperties
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: delayOffset,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        display: 'inline-block',
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {text}
    </motion.span>
  )
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
    
    // Registrar vista real de la página principal de kevdev
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: 'kevdev',
          eventType: 'pageview',
          path: window.location.pathname,
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
          source: document.referrer.includes('instagram') ? 'instagram' : 'directo',
        }),
      }).catch(() => {})
    } catch {}

    return () => window.removeEventListener('mousemove', fn)
  }, [mouseX, mouseY])

  function trackBtnClick(buttonId: string, label: string) {
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: 'kevdev',
          eventType: 'button_click',
          buttonId,
          path: window.location.pathname,
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
          metadata: { label },
        }),
      }).catch(() => {})
    } catch {}
  }

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
          background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)',
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
          padding: `clamp(10rem, 16vh, 15rem) var(--gutter) clamp(2.5rem, 4vw, 3.5rem)`,
          opacity: contentOpacity,
          y: contentY,
        }}
      >
        {/* Headline — CodePen Blur Emerge staggered animation */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            gap: '0.25rem',
          }}
        >
          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontWeight:    800,
            fontSize:      'clamp(2.75rem, 7.5vw, 7rem)',
            lineHeight:    0.92,
            letterSpacing: '-0.03em',
            color:         'var(--color-star)',
            maxWidth:      '16ch',
            textShadow:    '0 4px 28px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,1)',
          }}>
            <BlurEmergeText text={t('headlinePre')} delayOffset={T.headline} />{' '}
            <BlurEmergeText
              text={t('headlineItalic')}
              delayOffset={T.headline + 0.10}
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle:  'italic',
                fontWeight: 400,
                color:      'var(--color-accent)',
                textShadow: '0 0 32px rgba(0,229,255,0.4), 0 2px 16px rgba(0,0,0,0.95)',
              }}
            />
            <br />
            <BlurEmergeText text={t('headlinePost')} delayOffset={T.headline + 0.20} />
          </h1>

          {/* Decorative CSS-only 3D MacBook — sits right beside the headline */}
          <MacbookHero />
        </div>

        {/* Bottom bar — pure opacity fade-in to prevent flex height shift */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: EASE }}
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
                  letterSpacing: '0.08em',
                  color:         'var(--color-star)',
                  border:        '1px solid rgba(255,255,255,0.18)',
                  borderRadius:  99,
                  padding:       '0.35rem 0.85rem',
                  background:    'rgba(18,18,18,0.72)',
                  backdropFilter:'blur(16px)',
                  boxShadow:     '0 4px 16px rgba(0,0,0,0.5)',
                }}>
                  {chip}
                </span>
              ))}
            </div>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 400,
              fontSize:   'clamp(0.875rem, 1.1vw, 0.95rem)',
              lineHeight: 1.6,
              color:      'var(--color-star)',
              maxWidth:   '38ch',
              margin:     0,
              textShadow: '0 2px 16px rgba(0,0,0,0.95)',
            }}>
              {t('subcopy')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <CTADark onClick={() => { trackBtnClick('hero_cta_projects', 'Ver Proyectos'); scrollTo('#proyectos') }}>{t('ctaProjects')}</CTADark>
            <CTADiagnostico href="/diagnostico" onClick={() => trackBtnClick('hero_cta_diagnostico', 'Diagnóstico Comercial')}>{t('ctaDiagnostico')}</CTADiagnostico>
            <CTAArrow href={`https://wa.me/542235851419?text=${encodeURIComponent(t('whatsappMessage'))}`} onClick={() => trackBtnClick('hero_cta_whatsapp', 'Contacto WhatsApp')}>{t('ctaDemo')}</CTAArrow>
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
        fontFamily:     'var(--font-mono)', fontWeight: 600,
        fontSize:       '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        padding:        '0.875rem 1.75rem',
        border:         `1px solid ${hov ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius:   99, cursor: 'pointer',
        background:     hov ? 'rgba(18,18,18,0.85)' : 'rgba(18,18,18,0.65)',
        backdropFilter: 'blur(12px)',
        color:          hov ? 'var(--color-star)' : 'var(--color-muted)',
        transition:     'all 0.25s var(--ease-expo)',
        transform:      hov ? 'translateY(-1px)' : 'none',
      }}>
      {children}
    </button>
  )
}

function CTADiagnostico({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <Link href={href} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily:     'var(--font-mono)', fontWeight: 600,
        fontSize:       '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        padding:        '0.875rem 1.75rem',
        border:         `1px solid rgba(0,229,255,${hov ? '0.5' : '0.25'})`,
        borderRadius:   99, cursor: 'pointer',
        background:     hov ? 'rgba(0,229,255,0.1)' : 'rgba(0,229,255,0.04)',
        backdropFilter: 'blur(12px)',
        color:          hov ? 'var(--color-accent)' : 'rgba(0,229,255,0.85)',
        textDecoration: 'none',
        transition:     'all 0.25s var(--ease-expo)',
        transform:      hov ? 'translateY(-1px)' : 'none',
        display:        'inline-block',
      }}>
      {children}
    </Link>
  )
}

function CTAArrow({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick}
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
        boxShadow:    hov ? '0 6px 28px rgba(0,229,255,0.36)' : '0 0 0 transparent',
        flexShrink:   0,
      }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ flexShrink: 0 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span>{children}</span>
    </a>
  )
}
