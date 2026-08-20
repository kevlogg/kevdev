'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import TunnelReveal from '@/components/ui/TunnelReveal'
import { PROJECTS } from '@/lib/projects'

export default function Projects() {
  const t = useTranslations('projectsHome')
  return (
    <section id="proyectos" style={{ position: 'relative', zIndex: 10, padding: 'clamp(5rem, 10vw, 9rem) 0' }}>
      <div style={{ maxWidth: 680, marginInline: 'auto', paddingInline: 'var(--gutter)', textAlign: 'center' }}>
        <TunnelReveal style={{ marginBottom: '1rem' }}>
          <span className="type-label">{t('label')}</span>
        </TunnelReveal>

        <TunnelReveal delay={0.08} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 0.95,
            letterSpacing: '-0.03em', color: 'var(--color-star)',
            textShadow: '0 4px 28px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,1)',
          }}>
            {t('headingLine1')}<br />{t('headingLine2')}
          </h2>
        </TunnelReveal>

        <TunnelReveal delay={0.16} style={{ marginBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '1rem',
            color: 'var(--color-star)', lineHeight: 1.6,
            textShadow: '0 2px 16px rgba(0,0,0,0.95)',
          }}>
            {t('subcopy')}
          </p>
        </TunnelReveal>

        <TunnelReveal delay={0.22} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {PROJECTS.map(p => (
              <span key={p.name} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                color: p.color,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                {p.name}
              </span>
            ))}
          </div>
        </TunnelReveal>

        <TunnelReveal delay={0.3}>
          <style>{`
            .proyectos-cta:hover {
              opacity: 0.85 !important;
            }
          `}</style>
          <Link
            href="/proyectos"
            className="proyectos-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-on-accent, #060810)',
              background: 'var(--color-accent)',
              fontFamily: 'var(--font-ui)',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.875rem 2.5rem',
              borderRadius: 6,
              textDecoration: 'none',
              letterSpacing: '0.02em',
              transition: 'opacity 0.2s',
            }}
          >
            {t('cta')}
          </Link>
        </TunnelReveal>
      </div>
    </section>
  )
}
