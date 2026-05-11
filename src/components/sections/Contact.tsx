'use client'

import { useState } from 'react'
import TunnelReveal from '@/components/ui/TunnelReveal'

const WA_HREF = 'https://wa.me/542235851419?text=Hola%20Kevin%2C%20te%20escribo%20desde%20kevdev.com'

const LINKS = [
  { label: 'WhatsApp', href: WA_HREF, external: true },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/kevin-loggia/', external: true },
  { label: 'Email',     href: 'mailto:loggia.1996@gmail.com', external: false },
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

        <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
              fontFamily: 'var(--font-ui)', fontWeight: 700,
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', letterSpacing: '0.04em',
              textDecoration: 'none',
              padding: 'clamp(0.875rem, 2vw, 1rem) clamp(1.75rem, 4vw, 2.5rem)',
              borderRadius: 99,
              background: 'var(--color-accent)',
              color: 'var(--color-on-accent)',
              boxShadow: '0 0 32px rgba(34,211,238,0.25)',
              transition: 'background 0.22s, box-shadow 0.22s, transform 0.22s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'var(--color-accent-hi)'
              el.style.boxShadow = '0 0 48px rgba(34,211,238,0.4)'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'var(--color-accent)'
              el.style.boxShadow = '0 0 32px rgba(34,211,238,0.25)'
              el.style.transform = 'none'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Escribime por WhatsApp
          </a>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(1rem, 3vw, 2rem)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {LINKS.map(link => <ContactLink key={link.label} link={link} />)}
        </div>
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
