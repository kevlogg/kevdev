'use client'

import { useState } from 'react'
import TunnelReveal from '@/components/ui/TunnelReveal'

const LINKS = [
  { label: 'WhatsApp', href: 'https://wa.me/5491100000000', external: true },
  { label: 'LinkedIn',  href: 'https://linkedin.com/in/kevinloggia', external: true },
  { label: 'Email',     href: 'mailto:hola@kevdev.ar', external: false },
]

export default function Contact() {
  return (
    <section id="contacto" style={{ position: 'relative', zIndex: 10, padding: 'clamp(5rem, 10vw, 9rem) 0' }}>
      <div style={{ maxWidth: 640, marginInline: 'auto', paddingInline: 'var(--gutter)', textAlign: 'center' }}>

        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 'clamp(3rem, 6vw, 5rem)' }} />

        <TunnelReveal style={{ marginBottom: '1.25rem' }}>
          <span className="type-label">Hablemos</span>
        </TunnelReveal>

        <TunnelReveal delay={0.08} style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'normal',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 0.96,
            letterSpacing: '-0.03em', color: 'var(--color-star)',
          }}>
            Tenés una idea.<br />
            <span style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
              color: 'var(--color-accent)',
            }}>Construyámosla.</span>
          </h2>
        </TunnelReveal>

        <TunnelReveal delay={0.16} style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
            color: 'var(--color-muted)', lineHeight: 1.7,
            maxWidth: '42ch', marginInline: 'auto',
          }}>
            Si tenés una idea, un proceso para mejorar o un producto por lanzar, escribime.
            Sin formularios. Sin fricción.
          </p>
        </TunnelReveal>

        <TunnelReveal delay={0.22}>
          <div style={{ display: 'flex', gap: 'clamp(1rem, 3vw, 2rem)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {LINKS.map(link => <ContactLink key={link.label} link={link} />)}
          </div>
        </TunnelReveal>
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
        fontSize: '0.8125rem', letterSpacing: '0.08em', textTransform: 'uppercase',
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        color: hov ? 'var(--color-star)' : 'var(--color-muted)',
        background: hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 99, padding: '0.625rem 1.25rem',
        transition: 'color 0.25s, border-color 0.25s, background 0.25s',
      }}
    >
      {link.label}
      {link.external && (
        <span style={{ opacity: hov ? 1 : 0.4, transform: hov ? 'translate(2px,-2px)' : 'none', transition: 'opacity 0.2s, transform 0.2s', fontSize: '0.7rem' }}>↗</span>
      )}
    </a>
  )
}
