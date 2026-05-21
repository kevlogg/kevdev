'use client'

import Link from 'next/link'
import TunnelReveal from '@/components/ui/TunnelReveal'
import { PROJECTS } from '@/lib/projects'

export default function Projects() {
  return (
    <section id="proyectos" style={{ position: 'relative', zIndex: 10, padding: 'clamp(5rem, 10vw, 9rem) 0' }}>
      <div style={{ maxWidth: 680, marginInline: 'auto', paddingInline: 'var(--gutter)', textAlign: 'center' }}>
        <TunnelReveal style={{ marginBottom: '1rem' }}>
          <span className="type-label">Proyectos reales</span>
        </TunnelReveal>

        <TunnelReveal delay={0.08} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 0.95,
            letterSpacing: '-0.03em', color: 'var(--color-star)',
          }}>
            Ejecución real,<br />no portfolios ficticios.
          </h2>
        </TunnelReveal>

        <TunnelReveal delay={0.16} style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '1rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
            8 productos en producción. Sin demos, sin relleno.
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
              background: var(--color-accent) !important;
              color: var(--color-on-accent, #060810) !important;
            }
          `}</style>
          <Link
            href="/proyectos"
            className="proyectos-cta"
            style={{
              display: 'inline-block',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-accent)',
              background: 'transparent',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.9375rem',
              padding: '0.75rem 2.25rem',
              borderRadius: 6,
              textDecoration: 'none',
              letterSpacing: '0.02em',
              transition: 'background 0.25s, color 0.25s',
            }}
          >
            Entrar a la galería →
          </Link>
        </TunnelReveal>
      </div>
    </section>
  )
}
