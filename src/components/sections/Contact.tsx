'use client'

import { motion } from 'framer-motion'
import { stagger, fadeInUp, inView } from '@/lib/motion'

const LINKS = [
  { label: 'WhatsApp', href: 'https://wa.me/5491100000000', external: true },
  { label: 'LinkedIn',  href: 'https://linkedin.com/in/kevinloggia', external: true },
  { label: 'Email',     href: 'mailto:hola@kevdev.ar', external: false },
]

export default function Contact() {
  return (
    <section id="contacto" className="section-y" style={{ position: 'relative', zIndex: 10 }}>
      <div className="site-container">

        {/* Línea separadora */}
        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 'clamp(3rem, 6vw, 5rem)' }} />

        <motion.div {...inView} variants={stagger}>

          <motion.span variants={fadeInUp} className="type-label"
            style={{ display: 'block', marginBottom: '1.25rem' }}>
            Hablemos
          </motion.span>

          <motion.h2 variants={fadeInUp} style={{
            fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: 0.94,
            letterSpacing: '-0.025em', color: 'var(--color-star)',
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
            maxWidth: '18ch',
          }}>
            Tenés una idea.<br />
            <span style={{ color: 'var(--color-accent)' }}>Construyámosla.</span>
          </motion.h2>

          <motion.p variants={fadeInUp} style={{
            fontFamily: 'var(--font-ui)', fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
            color: 'var(--color-muted)', lineHeight: 1.7, maxWidth: '48ch',
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
          }}>
            Si tenés una idea, un proceso para mejorar o un producto por lanzar, escribime.
            Sin formularios. Sin fricción.
          </motion.p>

          {/* Contact links */}
          <motion.div variants={fadeInUp}
            style={{ display: 'flex', gap: 'clamp(1rem, 3vw, 2rem)', flexWrap: 'wrap' }}>
            {LINKS.map(link => (
              <ContactLink key={link.label} link={link} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function ContactLink({ link }: { link: typeof LINKS[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={link.href}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'var(--font-ui)', fontWeight: 600,
        fontSize: '0.8125rem', letterSpacing: '0.09em', textTransform: 'uppercase',
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        color: hov ? 'var(--color-star)' : 'var(--color-muted)',
        transition: 'color 0.25s',
        paddingBottom: 2,
        borderBottom: `1px solid ${hov ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'}`,
        transition2: 'border-color 0.25s',
      } as React.CSSProperties}
    >
      {link.label}
      <span style={{
        opacity: hov ? 1 : 0,
        transform: hov ? 'translate(2px, -2px)' : 'none',
        transition: 'opacity 0.2s, transform 0.2s',
        fontSize: '0.75rem',
      }}>
        ↗
      </span>
    </a>
  )
}

import { useState } from 'react'
