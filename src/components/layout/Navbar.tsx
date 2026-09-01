'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { motion, AnimatePresence } from 'framer-motion'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

/* ─── Data ──────────────────────────────────────────────────────────── */
const CONTACT_HREFS = [
  { key: 'whatsapp',  href: 'https://wa.me/5492235851419' },
  { key: 'instagram', href: 'https://www.instagram.com/kevd3v/' },
  { key: 'linkedin',  href: 'https://www.linkedin.com/in/kevin-loggia/' },
  { key: 'email',     href: 'mailto:kevdev.info@gmail.com' },
] as const

const STACK_ACCENT = [true, false, false, false, false, false]

/* ─── Variants ──────────────────────────────────────────────────────── */
const EASE_EXPO: [number,number,number,number] = [0.76, 0, 0.24, 1]
const EASE_OUT:  [number,number,number,number] = [0.22, 1, 0.36, 1]
const EASE_CINEMATIC: [number,number,number,number] = [0.16, 1, 0.3, 1]

const overlayV = {
  closed: {
    clipPath: 'inset(0% 0% 100% 0%)',
    transition: { duration: 0.75, ease: EASE_EXPO },
  },
  open: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 0.75, ease: EASE_EXPO },
  },
}

const itemV = {
  closed: (i: number) => ({
    x: 180 + i * 75,
    opacity: 0,
    scale: 0.92,
    filter: 'blur(12px)',
    skewX: -14,
  }),
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    skewX: 0,
    transition: {
      duration: 0.9,
      ease: EASE_CINEMATIC,
      delay: 0.15 + i * 0.13,
    },
  }),
}

const lineV = {
  closed: (i: number) => ({
    x: 140 + i * 60,
    scaleX: 0,
    opacity: 0,
  }),
  open: (i: number) => ({
    x: 0,
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.85,
      ease: EASE_CINEMATIC,
      delay: 0.12 + i * 0.13,
    },
  }),
}

const rightV = {
  closed: { y: 18, opacity: 0 },
  open: (i: number) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT, delay: 0.45 + i * 0.08 },
  }),
}

const footerV = {
  closed: { opacity: 0 },
  open:   { opacity: 1, transition: { duration: 0.5, delay: 0.65 } },
}

/* ─── Component ─────────────────────────────────────────────────────── */
export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const [hovered, setHovered]   = useState<number | null>(null)

  const router   = useRouter()
  const pathname = usePathname()

  const NAV_ITEMS = [
    { href: '#servicios', label: t('items.servicios'), index: '01' },
    { href: '/diseno-web', label: 'Diseño Web', index: '02' },
    { href: '/tiendas-online', label: 'Tiendas Online', index: '03' },
    { href: '/desarrollo-a-medida', label: 'A Medida', index: '04' },
    { href: '/proyectos', label: t('items.proyectos'), index: '05' },
    { href: '/contacto',  label: t('items.contacto'),  index: '06' },
    { href: '/vault',     label: t('items.vault'),     index: '07' },
  ]

  const stackLabels = t.raw('stackTags') as string[]
  const STACK_TAGS = stackLabels.map((label, i) => ({ label, accent: STACK_ACCENT[i] ?? false }))

  /* Scroll detection */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* Escape key */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  /* Lock scroll when open */
  useEffect(() => {
    const lenis = (window as any).__lenis
    if (open) {
      document.body.style.overflow = 'hidden'
      lenis?.stop()
    } else {
      document.body.style.overflow = ''
      lenis?.start()
    }
    return () => {
      document.body.style.overflow = ''
      lenis?.start()
    }
  }, [open])

  const close = useCallback(() => setOpen(false), [])

  const handleNav = useCallback((href: string, cb?: () => void) => {
    cb?.()
    if (href.startsWith('/')) {
      // Page route (e.g., /proyectos)
      if (pathname !== href) router.push(href)
      return
    }
    // Anchor (e.g., #servicios)
    if (pathname !== '/') {
      // Hard navigation so browser handles hash scroll natively (Lenis-safe)
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
      window.location.href = prefix + '/' + href
      return
    }
    // Same page: smooth scroll
    const el = document.querySelector(href)
    if (!el) return
    const lenis = (window as any).__lenis
    if (lenis) {
      lenis.start()
      lenis.scrollTo(el, { offset: -80 })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [pathname, router, locale])

  return (
    <>
      {/* ── Fixed bar ─────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'background 0.45s var(--ease-expo), border-color 0.45s',
        background: open
          ? 'transparent'
          : scrolled ? 'rgba(18,18,18,0.72)' : 'transparent',
        backdropFilter: !open && scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: !open && scrolled ? 'blur(12px)' : 'none',
        borderBottom: !open && scrolled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid transparent',
        pointerEvents: 'none',
      }}>
        <nav className="site-container" style={{
          height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'none',
        }}>

          {/* Wordmark / Kevdev Logo */}
          <motion.a
            href="#"
            onClick={e => { e.preventDefault(); close(); if (pathname !== '/') { router.push('/') } else { (window as any).__lenis?.scrollTo(0) } }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease: EASE_OUT }}
            style={{ textDecoration: 'none', position: 'relative', zIndex: 101, display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}
          >
            <img 
              src="/kevdev-logo.png" 
              alt="kevdev logo" 
              style={{ 
                height: 'clamp(36px, 4.5vw, 48px)', 
                width: 'auto', 
                maxHeight: 48,
                display: 'block',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 16px rgba(0,229,255,0.35)) brightness(1.1)',
              }} 
            />
          </motion.a>

          {/* Right group — language switcher + menu trigger, aligned together */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ duration: 0.7, delay: 1.15, ease: EASE_OUT }}
            style={{
              position: 'relative', zIndex: 101,
              display: 'flex', alignItems: 'center', gap: '1rem',
              pointerEvents: 'auto',
            }}
          >
            {!open && (
              <button
                type="button"
                onClick={() => handleNav('/vault')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#22d3ee',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 99,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.25s',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
                CURSOS
              </button>
            )}
            {!open && <LanguageSwitcher compact />}

            <button
              onClick={() => setOpen(v => !v)}
              aria-label={open ? t('closeAria') : t('openAria')}
              aria-expanded={open}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.5rem 0',
              }}
            >
              {/* Label */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--color-muted)', transition: 'color 0.25s',
              }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? 'close' : 'menu'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: EASE_OUT }}
                    style={{ display: 'inline-block' }}
                  >
                    {open ? t('closeLabel') : t('menuLabel')}
                  </motion.span>
                </AnimatePresence>
              </span>

              {/* Animated icon */}
              <BurgerIcon open={open} />
            </button>
          </motion.div>
        </nav>
      </header>

      {/* ── Full-screen overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            variants={overlayV}
            initial="closed"
            animate="open"
            exit="closed"
            style={{
              position: 'fixed', inset: 0, zIndex: 99,
              background: '#121212',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Inner grid */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              paddingTop: 68, /* navbar height */
              overflowY: 'auto',
            }}>
              <div style={{
                flex: 1, display: 'grid',
                gridTemplateColumns: '1fr',
                padding: 'clamp(1.25rem, 4vw, 3rem)',
                gap: '0',
              }}
              className="menu-grid"
              >
                {/* Left: nav items */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {NAV_ITEMS.map((item, i) => (
                    <div key={item.href}>
                      {/* Top separator */}
                      <motion.div
                        custom={i}
                        variants={lineV}
                        style={{
                          height: 1,
                          background: 'rgba(255,255,255,0.07)',
                          transformOrigin: 'left',
                        }}
                      />

                      {/* Nav row */}
                      <motion.div
                        custom={i}
                        variants={itemV}
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          padding: 'clamp(0.25rem, min(1vw, 1.2vh), 0.65rem) 0.75rem',
                          borderRadius: 12,
                          transition: 'background 0.3s ease, border-color 0.3s ease, filter 0.3s ease',
                          background: hovered === i
                            ? 'linear-gradient(90deg, rgba(6,182,212,0.14) 0%, rgba(99,102,241,0.06) 60%, transparent 100%)'
                            : 'transparent',
                          borderLeft: hovered === i ? '3px solid #22d3ee' : '3px solid transparent',
                          filter: hovered !== null && hovered !== i ? 'blur(1px)' : 'none',
                        }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <button
                          onClick={() => handleNav(item.href, close)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, display: 'flex', alignItems: 'center',
                            gap: 'clamp(0.75rem, 2vw, 1.5rem)',
                            width: '100%', textAlign: 'left',
                            transition: 'opacity 0.35s',
                            opacity: hovered === null || hovered === i ? 1 : 0.25,
                          }}
                        >
                          {/* Index */}
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.6875rem, 1.3vw, 0.8125rem)',
                            color: hovered === i ? '#22d3ee' : 'var(--color-accent)',
                            letterSpacing: '0.08em',
                            fontWeight: 700,
                            transition: 'all 0.3s ease',
                            opacity: hovered === i ? 1 : 0.6,
                            flexShrink: 0,
                            transform: hovered === i ? 'scale(1.15) translateX(2px)' : 'scale(1)',
                            textShadow: hovered === i ? '0 0 12px rgba(34,211,238,0.6)' : 'none',
                          }}>
                            {item.index}
                          </span>

                          {/* Label */}
                          <span style={{
                            fontFamily: 'var(--font-display)',
                            fontStyle: 'normal',
                            fontSize: 'clamp(1.5rem, min(7vw, 8vh), 5.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.0,
                            letterSpacing: '-0.03em',
                            color: hovered === i ? '#ffffff' : 'rgba(221,232,255,0.65)',
                            transition: 'all 0.3s var(--ease-expo)',
                            transform: hovered === i ? 'translateX(0.75rem)' : 'translateX(0)',
                            display: 'inline-block',
                            textShadow: hovered === i ? '0 0 28px rgba(34,211,238,0.45)' : 'none',
                          }}>
                            {item.label}
                          </span>

                          {/* Arrow Badge */}
                          <span style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                            color: '#22d3ee',
                            marginLeft: 'auto',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: hovered === i ? 'rgba(34,211,238,0.15)' : 'transparent',
                            border: hovered === i ? '1px solid rgba(34,211,238,0.4)' : '1px solid transparent',
                            boxShadow: hovered === i ? '0 0 16px rgba(34,211,238,0.3)' : 'none',
                            transition: 'all 0.3s var(--ease-expo)',
                            opacity: hovered === i ? 1 : 0,
                            transform: hovered === i ? 'translate(0, 0) scale(1.05)' : 'translate(-12px, 0) scale(0.8)',
                            flexShrink: 0,
                          }}>
                            ➜
                          </span>
                        </button>
                      </motion.div>
                    </div>
                  ))}

                  {/* Bottom separator */}
                  <motion.div
                    custom={NAV_ITEMS.length}
                    variants={lineV}
                    style={{
                      height: 1,
                      background: 'rgba(255,255,255,0.07)',
                      transformOrigin: 'left',
                    }}
                  />
                </div>

                {/* Right panel — hidden on mobile, visible on lg */}
                <div
                  className="menu-right"
                  style={{
                    display: 'none', /* shown via media query below */
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: 'clamp(2.5rem, 7vh, 5rem)',
                    paddingTop: 'clamp(2rem, 5vh, 4rem)',
                    paddingLeft: 'clamp(2rem, 4vw, 5rem)',
                    paddingBottom: 'clamp(1rem, 3vh, 2rem)',
                    borderLeft: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {/* Contact */}
                  <div>
                    <motion.p
                      custom={0} variants={rightV}
                      className="type-label"
                      style={{ marginBottom: '1.25rem', color: 'rgba(221,232,255,0.3)' }}
                    >
                      {t('contactLabel')}
                    </motion.p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {CONTACT_HREFS.map(({ key, href }, i) => (
                        <motion.a
                          key={key}
                          custom={i + 1}
                          variants={rightV}
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: 'var(--font-ui)', fontSize: '0.9375rem',
                            fontWeight: 500, color: 'var(--color-muted)',
                            textDecoration: 'none', letterSpacing: '0.02em',
                            display: 'flex', alignItems: 'center', gap: '0.65rem',
                            padding: '0.4rem 0.65rem',
                            borderRadius: 10,
                            transition: 'all 0.25s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#ffffff'
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                            e.currentTarget.style.transform = 'translateX(6px)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--color-muted)'
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.transform = 'translateX(0)'
                          }}
                        >
                          <ContactIcon type={key} />
                          <span>{t(`contactLinks.${key}`)}</span>
                        </motion.a>
                      ))}
                    </div>
                  </div>

                  {/* Stack */}
                  <div>
                    <motion.p
                      custom={4} variants={rightV}
                      className="type-label"
                      style={{ marginBottom: '1rem', color: 'rgba(221,232,255,0.3)' }}
                    >
                      {t('stackLabel')}
                    </motion.p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {STACK_TAGS.map((tag, i) => (
                        <motion.span
                          key={tag.label}
                          custom={i + 5}
                          variants={rightV}
                          style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                            padding: '0.35rem 0.75rem',
                            border: `1px solid ${tag.accent ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.13)'}`,
                            borderRadius: 99,
                            color: tag.accent ? 'var(--color-accent)' : 'rgba(221,232,255,0.55)',
                            letterSpacing: '0.04em',
                            background: tag.accent ? 'rgba(34,211,238,0.07)' : 'transparent',
                          }}
                        >
                          {tag.label}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <motion.div custom={11} variants={rightV}>
                    <LanguageSwitcher />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* ── Bottom bar ────────────────────────────────── */}
            <motion.div
              variants={footerV}
              initial="closed"
              animate="open"
              exit="closed"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: 'clamp(1rem, 2vw, 1.25rem) clamp(2rem, 5vw, 4rem)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '0.5rem',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                color: 'rgba(221,232,255,0.25)', letterSpacing: '0.08em',
              }}>
                kev.dev · {t('role')}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                color: 'rgba(34,211,238,0.35)', letterSpacing: '0.08em',
              }}>
                {t('location')} · {new Date().getFullYear()}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Responsive styles ──────────────────────────────────────── */}
      <style>{`
        @media (min-width: 900px) {
          .menu-grid {
            grid-template-columns: 1fr 0.38fr !important;
          }
          .menu-right {
            display: flex !important;
          }
        }
      `}</style>
    </>
  )
}

/* ─── Burger Icon ───────────────────────────────────────────────────── */
function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span style={{
      display: 'flex', flexDirection: 'column',
      gap: 5, width: 22, cursor: 'pointer',
    }}>
      <motion.span
        animate={{
          y:       open ?  6.5 : 0,
          rotate:  open ? 45 : 0,
          opacity: 1,
        }}
        transition={{ duration: 0.38, ease: EASE_EXPO }}
        style={{ display: 'block', height: 1.5, background: 'var(--color-star)',
                 borderRadius: 1, transformOrigin: 'center' }}
      />
      <motion.span
        animate={{ opacity: open ? 0 : 1, x: open ? 6 : 0 }}
        transition={{ duration: 0.22 }}
        style={{ display: 'block', height: 1.5, background: 'var(--color-star)',
                 borderRadius: 1 }}
      />
      <motion.span
        animate={{
          y:      open ? -6.5 : 0,
          rotate: open ? -45 : 0,
          opacity: 1,
        }}
        transition={{ duration: 0.38, ease: EASE_EXPO }}
        style={{ display: 'block', height: 1.5, background: 'var(--color-star)',
                 borderRadius: 1, transformOrigin: 'center' }}
      />
    </span>
  )
}

/* ─── Contact SVG Icon Component ────────────────────────────────────── */
function ContactIcon({ type }: { type: string }) {
  const iconStyle = { width: 18, height: 18, flexShrink: 0, transition: 'transform 0.25s ease' }

  switch (type) {
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ ...iconStyle, color: '#25D366' }}>
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.488 1.333 5.006L2 22l5.129-1.342c1.464.798 3.116 1.218 4.881 1.219h.004c5.507 0 9.991-4.479 9.991-9.986 0-2.667-1.038-5.174-2.925-7.062A9.923 9.923 0 0 0 12.012 2zm.003 16.516h-.003a8.31 8.31 0 0 1-4.237-1.164l-.304-.18-3.04.796.81-2.964-.198-.315a8.28 8.28 0 0 1-1.272-4.476c.002-4.582 3.73-8.308 8.313-8.308 2.22 0 4.306.865 5.875 2.435a8.257 8.257 0 0 1 2.43 5.877c-.002 4.584-3.73 8.309-8.309 8.309zm4.555-6.222c-.25-.125-1.477-.728-1.706-.811-.229-.083-.396-.125-.562.125-.167.25-.646.811-.792.977-.146.166-.292.187-.542.062a6.837 6.837 0 0 1-2.012-1.24 7.534 7.534 0 0 1-1.391-1.733c-.146-.25-.016-.385.109-.509.112-.112.25-.292.375-.438.125-.146.167-.25.25-.416.083-.166.042-.312-.021-.437-.063-.125-.562-1.354-.77-1.854-.203-.487-.41-.421-.562-.429-.146-.007-.312-.007-.479-.007s-.438.062-.667.312c-.229.25-.875.854-.875 2.083s.896 2.417 1.021 2.583c.125.167 1.763 2.693 4.27 3.777.596.257 1.062.411 1.425.526.598.19 1.142.163 1.572.099.48-.071 1.477-.604 1.686-1.187.208-.583.208-1.083.146-1.187-.063-.105-.229-.167-.479-.292z"/>
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ ...iconStyle, color: '#E4405F' }}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ ...iconStyle, color: '#0A66C2' }}>
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    case 'email':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ ...iconStyle, color: '#38BDF8' }}>
          <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/>
        </svg>
      )
    default:
      return null
  }
}
