'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV = [
  { href: '#servicios',  label: 'Servicios' },
  { href: '#proyectos',  label: 'Proyectos' },
  { href: '#contacto',   label: 'Contacto' },
]

function scrollTo(href: string) {
  const el = document.querySelector(href)
  if (!el) return
  const lenis = (window as any).__lenis
  lenis ? lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'background 0.45s var(--ease-expo), border-color 0.45s',
      background: scrolled ? 'rgba(9,9,14,0.78)' : 'transparent',
      backdropFilter: scrolled ? 'blur(18px) saturate(1.2)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(1.2)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
    }}>
      <nav className="site-container" style={{
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Wordmark */}
        <motion.a
          href="#" onClick={e => { e.preventDefault(); (window as any).__lenis?.scrollTo(0) }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
          style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.9375rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-star)', textDecoration: 'none',
            opacity: 0.88, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.88')}
        >
          kevdev
        </motion.a>

        {/* Desktop nav */}
        <motion.ul
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22,1,0.36,1] }}
          style={{ display: 'flex', gap: '2.75rem', listStyle: 'none' }}
          className="hidden sm:flex"
        >
          {NAV.map(item => (
            <li key={item.href}>
              <NavLink label={item.label} onClick={() => scrollTo(item.href)} />
            </li>
          ))}
        </motion.ul>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="sm:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer',
                   padding: 8, color: 'var(--color-star)', display: 'flex',
                   flexDirection: 'column', gap: 5 }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block', width: 22, height: 1.5, background: 'currentColor',
              transition: 'transform 0.3s, opacity 0.25s',
              opacity: i === 1 && open ? 0 : 1,
              transform: open
                ? i === 0 ? 'translateY(6.5px) rotate(45deg)'
                : i === 2 ? 'translateY(-6.5px) rotate(-45deg)' : 'none'
                : 'none',
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}
            style={{ overflow: 'hidden', background: 'rgba(9,9,14,0.96)',
                     backdropFilter: 'blur(20px)',
                     borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ul className="site-container" style={{
              listStyle: 'none', display: 'flex', flexDirection: 'column',
              gap: '1.5rem', paddingTop: '1.75rem', paddingBottom: '2rem',
            }}>
              {NAV.map(item => (
                <li key={item.href}>
                  <a href={item.href}
                    onClick={e => { e.preventDefault(); setOpen(false); scrollTo(item.href) }}
                    style={{ fontFamily: 'var(--font-ui)', fontSize: '1.125rem',
                             fontWeight: 500, color: 'var(--color-muted)',
                             textDecoration: 'none', letterSpacing: '0.04em',
                             transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-star)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
               fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 500,
               letterSpacing: '0.09em', textTransform: 'uppercase',
               color: hovered ? 'var(--color-star)' : 'var(--color-muted)',
               transition: 'color 0.25s var(--ease-expo)', position: 'relative' }}
    >
      {label}
      <span style={{ position: 'absolute', bottom: -4, left: 0, height: 1,
                     width: hovered ? '100%' : 0, background: 'var(--color-accent)',
                     transition: 'width 0.3s var(--ease-expo)' }} />
    </button>
  )
}
