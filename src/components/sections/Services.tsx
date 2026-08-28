'use client'

import { useState, useRef } from 'react'
import {
  motion, AnimatePresence,
  useScroll, useTransform, useMotionValueEvent,
} from 'framer-motion'
import { useTranslations } from 'next-intl'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const SERVICES_META = [
  { num: '01', stack: 'Next.js  ·  Figma  ·  Framer Motion' },
  { num: '02', stack: 'React  ·  Node.js  ·  Firebase' },
  { num: '03', stack: 'n8n  ·  OpenAI  ·  Make' },
  { num: '04', stack: 'FlutterFlow  ·  Firebase  ·  IA' },
]

type ServiceItem = {
  num: string
  stack: string
  title: string
  desc: string
  detail: string
  tag: string
}

const N = SERVICES_META.length   // 4

export default function Services() {
  const t = useTranslations('services')
  const items = t.raw('items') as { title: string; desc: string; detail: string; tag: string }[]
  const SERVICES: ServiceItem[] = SERVICES_META.map((meta, i) => ({ ...meta, ...items[i] }))

  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLElement>(null)

  /* ── Scroll progress over the full 4×100vh section ─────────────── */
  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset:  ['start start', 'end end'],
  })

  /* Active item driven by scroll */
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(Math.floor(v * N), N - 1)
    setActive(idx)
  })

  /* Extra fixed darkening — only visible while section is pinned */
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.96, 1],
    [0,  0.42,  0.42, 0],
  )

  return (
    <>
      {/* ── Extra video darkening (fixed, section-scoped) ─────────── */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 5,
          background: 'rgba(18,18,18,1)',
          pointerEvents: 'none',
          opacity: overlayOpacity,
        }}
      />

      {/* ── Outer section — sets the scroll height ────────────────── */}
      <section
        ref={containerRef}
        id="servicios"
        style={{
          position: 'relative',
          zIndex: 10,
          height: `${N * 100}vh`,
        }}
      >
        {/* ── Sticky viewport ───────────────────────────────────────── */}
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '5rem',      /* clear navbar (68px) */
          paddingBottom: '2rem',
          overflow: 'hidden',
        }}>
          <div className="site-container">

            {/* Header */}
            <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              <span className="type-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                {t('label')}
              </span>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(1.875rem, 3.5vw, 2.875rem)',
                lineHeight: 1.0, letterSpacing: '-0.03em',
                color: 'var(--color-star)', margin: 0,
                textShadow: '0 4px 24px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,1)',
              }}>
                {t('headingPre')}{' '}
                <span style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontWeight: 400, color: 'var(--color-accent)',
                  textShadow: '0 0 32px rgba(0,229,255,0.4), 0 2px 16px rgba(0,0,0,0.95)',
                }}>{t('headingItalic')}</span>
              </h2>
            </div>

            {/* Two-column layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(3rem, 6vw, 7rem)',
              alignItems: 'start',
            }}
              className="services-grid"
            >
              {/* Left: item list */}
              <div>
                {SERVICES.map((s, i) => (
                  <ServiceItem
                    key={s.num}
                    service={s}
                    active={active === i}
                    done={i < active}
                    isLast={i === N - 1}
                    scrollYProgress={scrollYProgress}
                    index={i}
                  />
                ))}
              </div>

              {/* Right: animated detail panel */}
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{   opacity: 0, y: -12 }}
                    transition={{ duration: 0.38, ease: EASE }}
                  >
                    <ServiceDetail service={SERVICES[active]} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Progress bar — bottom */}
            <div style={{
              marginTop: 'clamp(2rem, 4vw, 3rem)',
              height: 1,
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 99,
              overflow: 'hidden',
            }}>
              <motion.div style={{
                height: '100%',
                background: 'var(--color-accent)',
                width: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
              }} />
            </div>

          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}

/* ─── Left item ──────────────────────────────────────────────────────── */
function ServiceItem({
  service, active, done, isLast, scrollYProgress, index,
}: {
  service: ServiceItem
  active: boolean
  done: boolean
  isLast: boolean
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
  index: number
}) {
  /* Progress line fill — fills as this item's slot scrolls */
  const lo = index / N
  const hi = (index + 1) / N
  const lineH = useTransform(scrollYProgress, [lo, hi], ['0%', '100%'])

  return (
    <div style={{
      position: 'relative',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      borderBottom: isLast ? '1px solid rgba(255,255,255,0.07)' : 'none',
      display: 'flex',
      gap: '1.25rem',
    }}>
      {/* Animated left line */}
      <div style={{
        position: 'relative',
        width: 2,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.07)',
        alignSelf: 'stretch',
      }}>
        <motion.div style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: lineH,
          background: active
            ? 'var(--color-accent)'
            : done ? 'rgba(34,211,238,0.4)' : 'transparent',
        }} />
      </div>

      {/* Content */}
      <div style={{
        padding: 'clamp(1.25rem, 2.5vw, 1.875rem) 0',
        flex: 1,
        opacity: active ? 1 : done ? 0.55 : 0.38,
        transition: 'opacity 0.4s',
      }}>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
          letterSpacing: '0.12em',
          color: active ? 'var(--color-accent)' : 'var(--color-faint)',
          marginBottom: '0.5rem',
          transition: 'color 0.3s',
        }}>
          {service.num}
        </span>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.5rem, 2.75vw, 2.375rem)',
          letterSpacing: '-0.025em', lineHeight: 1.07,
          color: 'var(--color-star)', margin: 0,
        }}>
          {service.title}
        </h3>

        <motion.div
          animate={{ height: active ? 'auto' : 0, opacity: active ? 1 : 0 }}
          transition={{ duration: 0.42, ease: EASE }}
          style={{ overflow: 'hidden' }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
            color: 'var(--color-muted)', lineHeight: 1.75,
            margin: '0.75rem 0 0', maxWidth: '36ch',
          }}>
            {service.desc}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

import Link from 'next/link'

const SERVICE_HREFS: Record<string, { href: string; label: string }> = {
  '01': { href: '/diseno-web', label: 'Ver servicio de Diseño Web →' },
  '02': { href: '/desarrollo-a-medida', label: 'Ver servicio de Desarrollo a Medida →' },
  '03': { href: '/tiendas-online', label: 'Ver servicio de Tiendas Online →' },
  '04': { href: '/desarrollo-a-medida', label: 'Ver servicio de MVPs →' },
}

/* ─── Right detail panel ─────────────────────────────────────────────── */
function ServiceDetail({ service }: { service: ServiceItem }) {
  const serviceTarget = SERVICE_HREFS[service.num] || { href: '/diseno-web', label: 'Ver detalles →' }

  return (
    <div style={{
      position: 'relative',
      padding: 'clamp(2rem, 3.5vw, 3rem)',
      background: 'rgba(18,18,18,0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderTop: '1px solid rgba(0,229,255,0.4)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Large faint number */}
      <span aria-hidden style={{
        position: 'absolute',
        bottom: '-1.5rem', right: '1.5rem',
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: '11rem', lineHeight: 1,
        letterSpacing: '-0.05em',
        color: 'rgba(255,255,255,0.025)',
        userSelect: 'none', pointerEvents: 'none',
      }}>
        {service.num}
      </span>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.625rem',
          fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--color-accent)',
        }}>
          {service.tag}
        </span>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.75rem, 2.75vw, 2.5rem)',
          letterSpacing: '-0.03em', lineHeight: 1.06,
          color: 'var(--color-star)',
          margin: '0.875rem 0 1.5rem',
        }}>
          {service.title}
        </h3>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '1.5rem' }} />

        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.9375rem',
          lineHeight: 1.8, color: 'var(--color-muted)',
          margin: '0 0 1.5rem',
        }}>
          {service.detail}
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href={serviceTarget.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(34, 211, 238, 0.1)',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              color: '#22d3ee',
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '0.625rem 1.25rem',
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {serviceTarget.label}
          </Link>
        </div>

        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
          letterSpacing: '0.06em', color: 'var(--color-faint)',
        }}>
          {service.stack}
        </span>
      </div>
    </div>
  )
}
