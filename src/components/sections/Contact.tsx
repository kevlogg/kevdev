'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const LINK_HREFS = [
  { key: 'instagram', href: 'https://www.instagram.com/kevdev.ok/', external: true },
  { key: 'linkedin',  href: 'https://www.linkedin.com/in/kevin-loggia/', external: true },
  { key: 'email',     href: 'mailto:loggia.1996@gmail.com', external: false },
] as const

export default function Contact() {
  const t = useTranslations('contact')
  const WA_HREF = `https://wa.me/542235851419?text=${encodeURIComponent(t('whatsappMessage'))}`
  const LINKS = LINK_HREFS.map(l => ({
    key: l.key,
    label: t(`links.${l.key}`),
    href: l.href,
    external: l.external,
  }))
  return (
    <section id="contacto" style={{ position: 'relative', zIndex: 10, padding: 'clamp(5rem, 10vw, 9rem) 0' }}>
      <div style={{ maxWidth: 640, marginInline: 'auto', paddingInline: 'var(--gutter)', textAlign: 'center' }}>

        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 'clamp(3rem, 6vw, 5rem)' }} />

        <div style={{ marginBottom: '1.25rem' }}>
          <span className="type-label">{t('label')}</span>
        </div>

        <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'normal',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 0.96,
            letterSpacing: '-0.03em', color: 'var(--color-star)',
            textShadow: '0 4px 28px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,1)',
          }}>
            {t('headingPre')}<br />
            <span style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
              color: 'var(--color-accent)',
              textShadow: '0 0 32px rgba(0,229,255,0.4), 0 2px 16px rgba(0,0,0,0.95)',
            }}>{t('headingItalic')}</span>
          </h2>
        </div>

        <div style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
            color: 'var(--color-star)', lineHeight: 1.7,
            maxWidth: '42ch', marginInline: 'auto',
            textShadow: '0 2px 16px rgba(0,0,0,0.95)',
          }}>
            {t('paragraph')}
          </p>
        </div>

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
              background: '#25D366',
              color: '#000000',
              boxShadow: '0 0 32px rgba(37,211,102,0.35)',
              transition: 'background 0.22s, box-shadow 0.22s, transform 0.22s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = '#22bf5b'
              el.style.boxShadow = '0 0 48px rgba(37,211,102,0.55)'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = '#25D366'
              el.style.boxShadow = '0 0 32px rgba(37,211,102,0.35)'
              el.style.transform = 'none'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('whatsappCta')}
          </a>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(0.75rem, 2vw, 1.25rem)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {LINKS.map(link => <ContactLink key={link.key} link={link} />)}
        </div>

      </div>
    </section>
  )
}

const LINK_CONFIG = {
  instagram: {
    color: '#F472B6',
    bg: '#1C1322',
    border: '1.5px solid rgba(244, 114, 182, 0.5)',
    hoverBg: 'linear-gradient(135deg, #e6683c 0%, #dc2743 50%, #cc2366 100%)',
    hoverBorder: '1.5px solid #E1306C',
    shadow: '0 6px 28px rgba(225, 48, 108, 0.45)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  linkedin: {
    color: '#38BDF8',
    bg: '#0F172A',
    border: '1.5px solid rgba(56, 189, 248, 0.5)',
    hoverBg: '#0A66C2',
    hoverBorder: '1.5px solid #0A66C2',
    shadow: '0 6px 28px rgba(10, 102, 194, 0.45)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ flexShrink: 0 }}>
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
      </svg>
    ),
  },
  email: {
    color: '#F87171',
    bg: '#221418',
    border: '1.5px solid rgba(248, 113, 113, 0.5)',
    hoverBg: '#EA4335',
    hoverBorder: '1.5px solid #EA4335',
    shadow: '0 6px 28px rgba(234, 67, 53, 0.45)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
} as const

function ContactLink({ link }: { link: { key: 'instagram' | 'linkedin' | 'email'; label: string; href: string; external: boolean } }) {
  const [hov, setHov] = useState(false)
  const config = LINK_CONFIG[link.key]

  return (
    <a
      href={link.href}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'var(--font-ui)', fontWeight: 700,
        fontSize: '0.8125rem', letterSpacing: '0.08em', textTransform: 'uppercase',
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
        color: hov ? '#ffffff' : config.color,
        background: hov ? config.hoverBg : config.bg,
        border: hov ? config.hoverBorder : config.border,
        boxShadow: hov ? config.shadow : '0 4px 18px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 99, padding: '0.625rem 1.35rem',
        transition: 'all 0.25s var(--ease-expo)',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
    >
      {config.icon}
      <span>{link.label}</span>
      {link.external && (
        <span style={{ opacity: hov ? 1 : 0.6, transform: hov ? 'translate(2px,-2px)' : 'none', transition: 'opacity 0.2s, transform 0.2s', fontSize: '0.75rem' }}>↗</span>
      )}
    </a>
  )
}
