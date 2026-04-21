'use client'

import { motion } from 'framer-motion'
import { stagger, fadeInUp, fadeInLeft, inView } from '@/lib/motion'

const PILLARS = [
  { label: 'Producto', desc: 'Pienso en el usuario y en el negocio antes de tocar código.' },
  { label: 'Validación', desc: 'Construyo lo mínimo necesario para probar una hipótesis real.' },
  { label: 'Ejecución', desc: 'Entrego cosas que funcionan, no prototipos ni demos.' },
]

export default function Approach() {
  return (
    <section id="enfoque" className="section-y" style={{ position: 'relative', zIndex: 10 }}>
      <div className="site-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(3rem, 6vw, 6rem)',
          alignItems: 'start',
        }}>

          {/* Columna izquierda — manifiesto */}
          <motion.div {...inView} variants={stagger}>
            <motion.span variants={fadeInUp} className="type-label"
              style={{ display: 'block', marginBottom: '1rem' }}>
              Mi enfoque
            </motion.span>

            <motion.h2 variants={fadeInUp} style={{
              fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic',
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1,
              letterSpacing: '-0.02em', color: 'var(--color-star)',
              marginBottom: '1.75rem',
            }}>
              No trabajo solo<br />desde lo técnico.
            </motion.h2>

            <motion.p variants={fadeInUp} style={{
              fontFamily: 'var(--font-ui)', fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              color: 'var(--color-muted)', lineHeight: 1.75, maxWidth: '42ch',
            }}>
              Pienso producto, negocio y validación antes de escribir la primera línea de código.
              Priorizo claridad, utilidad y ejecución real.{' '}
              <span style={{ color: 'var(--color-star)' }}>
                Construyo cosas para usarse, no solo para verse bien.
              </span>
            </motion.p>
          </motion.div>

          {/* Columna derecha — pillars */}
          <motion.div {...inView} variants={stagger}
            style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {PILLARS.map((p, i) => (
              <PillarRow key={p.label} pillar={p} last={i === PILLARS.length - 1} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function PillarRow({ pillar, last }: { pillar: typeof PILLARS[0]; last: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      variants={fadeInUp}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 'clamp(1.25rem, 2.5vw, 1.75rem) 0',
        borderBottom: last ? 'none' : '1px solid var(--color-border)',
        display: 'grid', gridTemplateColumns: '7rem 1fr', gap: '1rem',
        alignItems: 'start',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 500,
        fontSize: '1.25rem', letterSpacing: '-0.01em',
        color: hov ? 'var(--color-accent)' : 'var(--color-star)',
        transition: 'color 0.3s',
      }}>
        {pillar.label}
      </span>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.9rem',
        color: 'var(--color-muted)', lineHeight: 1.65,
      }}>
        {pillar.desc}
      </p>
    </motion.div>
  )
}

import { useState } from 'react'
