'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { motion, AnimatePresence } from 'framer-motion'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

/* ─── Data ──────────────────────────────────────────────────────────── */
const CONTACT_HREFS = [
  { key: 'instagram', href: 'https://www.instagram.com/kevd3v/' },
  { key: 'linkedin',  href: 'https://www.linkedin.com/in/kevin-loggia/' },
  { key: 'email',     href: 'mailto:kevdev.info@gmail.com' },
] as const

const STACK_ACCENT = [true, false, false, false, false, false]

/* ─── Variants ──────────────────────────────────────────────────────── */
const EASE_EXPO: [number,number,number,number] = [0.76, 0, 0.24, 1]
const EASE_OUT:  [number,number,number,number] = [0.22, 1, 0.36, 1]

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
  closed: { y: 72, opacity: 0 },
  open: (i: number) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.75, ease: EASE_OUT, delay: 0.18 + i * 0.09 },
  }),
}

const lineV = {
  closed: { scaleX: 0 },
  open: (i: number) => ({
    scaleX: 1,
    transition: { duration: 0.65, ease: EASE_OUT, delay: 0.14 + i * 0.09 },
  }),
}

const rightV = {
  closed: { y: 18, opacity: 0 },
  open: (i: number) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.55, ease: EASE_OUT, delay: 0.35 + i * 0.07 },
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
    { href: '/proyectos', label: t('items.proyectos'), index: '02' },
    { href: '#enfoque',   label: t('items.enfoque'),   index: '03' },
    { href: '#contacto',  label: t('items.contacto'),  index: '04' },
    { href: '/vault',     label: t('items.vault'),     index: '05' },
  ]

  const CONTACT_LINKS = CONTACT_HREFS.map(({ key, href }) => ({
    label: t(`contactLinks.${key}`),
    href,
  }))

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
                VAULT
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
              overflow: 'hidden',
            }}
          >
            {/* Inner grid */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              paddingTop: 68, /* navbar height */
            }}>
              <div style={{
                flex: 1, display: 'grid',
                gridTemplateColumns: '1fr',
                padding: 'clamp(2rem, 5vw, 4rem)',
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
                        style={{ overflow: 'hidden', padding: 'clamp(0.4rem, min(1.5vw, 1.8vh), 1rem) 0' }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <motion.button
                          custom={i}
                          variants={itemV}
                          onClick={() => handleNav(item.href, close)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, display: 'flex', alignItems: 'baseline',
                            gap: 'clamp(0.75rem, 2vw, 1.5rem)',
                            width: '100%', textAlign: 'left',
                            transition: 'opacity 0.35s',
                            opacity: hovered === null || hovered === i ? 1 : 0.2,
                          }}
                        >
                          {/* Index */}
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.625rem, 1.2vw, 0.75rem)',
                            color: 'var(--color-accent)',
                            letterSpacing: '0.06em',
                            transition: 'opacity 0.3s',
                            opacity: hovered === i ? 1 : 0.5,
                            flexShrink: 0,
                            paddingBottom: '0.25rem',
                          }}>
                            {item.index}
                          </span>

                          {/* Label */}
                          <span style={{
                            fontFamily: 'var(--font-display)',
                            fontStyle: 'normal',
                            fontSize: 'clamp(2rem, min(8.5vw, 11vh), 7.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.0,
                            letterSpacing: '-0.03em',
                            color: hovered === i
                              ? 'var(--color-star)'
                              : 'rgba(221,232,255,0.55)',
                            transition: 'color 0.3s var(--ease-expo), transform 0.3s var(--ease-expo)',
                            transform: hovered === i ? 'translateX(0.5rem)' : 'translateX(0)',
                            display: 'inline-block',
                          }}>
                            {item.label}
                          </span>

                          {/* Arrow */}
                          <span style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                            color: 'var(--color-accent)',
                            marginLeft: 'auto',
                            transition: 'opacity 0.3s, transform 0.3s var(--ease-expo)',
                            opacity: hovered === i ? 1 : 0,
                            transform: hovered === i ? 'translate(0, 0)' : 'translate(-8px, 4px)',
                            alignSelf: 'center',
                            flexShrink: 0,
                          }}>
                            ↗
                          </span>
                        </motion.button>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {CONTACT_LINKS.map((link, i) => (
                        <motion.a
                          key={link.label}
                          custom={i + 1}
                          variants={rightV}
                          href={link.href}
                          target={link.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: 'var(--font-ui)', fontSize: '1.0625rem',
                            fontWeight: 500, color: 'var(--color-muted)',
                            textDecoration: 'none', letterSpacing: '0.02em',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--color-star)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--color-muted)'
                          }}
                        >
                          {link.label}
                          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>↗</span>
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
