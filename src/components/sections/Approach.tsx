'use client'

import { useState } from 'react'
import TunnelReveal from '@/components/ui/TunnelReveal'

const PILLARS = [
  { label: 'Producto',   desc: 'Pienso en el usuario y en el negocio antes de tocar código.' },
  { label: 'Validación', desc: 'Construyo lo mínimo necesario para probar una hipótesis real.' },
  { label: 'Ejecución',  desc: 'Entrego cosas que funcionan, no prototipos ni demos.' },
]

export default function Approach() {
  return (
    <section id="enfoque" style={{ position: 'relative', zIndex: 10, padding: 'clamp(5rem, 10vw, 9rem) 0' }}>
      <div style={{ maxWidth: 640, marginInline: 'auto', paddingInline: 'var(--gutter)', textAlign: 'center' }}>

        <TunnelReveal style={{ marginBottom: '1rem' }}>
          <span className="type-label">Mi enfoque</span>
        </TunnelReveal>

        <TunnelReveal delay={0.08} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'normal',
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1,
            letterSpacing: '-0.03em', color: 'var(--color-star)',
          }}>
            No trabajo solo<br />desde lo técnico.
          </h2>
        </TunnelReveal>

        <TunnelReveal delay={0.16} style={{ marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 'clamp(1rem, 1.5vw, 1.0625rem)',
            color: 'var(--color-muted)', lineHeight: 1.75,
            maxWidth: '42ch', marginInline: 'auto',
          }}>
            Pienso producto, negocio y validación antes de escribir la primera línea de código.{' '}
            <span style={{ color: 'var(--color-star)' }}>
              Construyo cosas para usarse, no solo para verse bien.
            </span>
          </p>
        </TunnelReveal>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {PILLARS.map((p, i) => (
          <PillarRow key={p.label} pillar={p} last={i === PILLARS.length - 1} />
        ))}
      </div>
    </section>
  )
}

function PillarRow({ pillar, last }: { pillar: typeof PILLARS[0]; last: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <TunnelReveal style={{ borderBottom: last ? 'none' : '1px solid var(--color-border)' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ padding: 'clamp(1.25rem, 2.5vw, 1.875rem) 0', textAlign: 'center' }}
      >
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-display)', fontWeight: 500,
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', letterSpacing: '-0.01em',
          color: hov ? 'var(--color-accent)' : 'var(--color-star)',
          transition: 'color 0.3s', marginBottom: '0.5rem',
        }}>{pillar.label}</span>
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.9rem',
          color: 'var(--color-muted)', lineHeight: 1.65,
          maxWidth: '38ch', marginInline: 'auto',
        }}>{pillar.desc}</p>
      </div>
    </TunnelReveal>
  )
}
