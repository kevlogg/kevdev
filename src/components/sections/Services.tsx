'use client'

import { motion } from 'framer-motion'
import { stagger, fadeInUp, fadeInLeft, inView } from '@/lib/motion'

const SERVICES = [
  {
    num: '01',
    title: 'Landing pages',
    desc: 'Páginas de aterrizaje claras y modernas. Diseño enfocado en conversión y en transmitir el mensaje correcto.',
  },
  {
    num: '02',
    title: 'Web apps & paneles',
    desc: 'Aplicaciones web y dashboards para gestionar datos, usuarios o procesos. Interfaces útiles y escalables.',
  },
  {
    num: '03',
    title: 'Automatizaciones con IA',
    desc: 'Flujos que combinan APIs, integraciones e IA para automatizar tareas repetitivas y mejorar la operación.',
  },
  {
    num: '04',
    title: 'MVPs para validar',
    desc: 'Versiones mínimas viables para probar con usuarios reales antes de invertir en algo más grande.',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="section-y" style={{ position: 'relative', zIndex: 10 }}>
      <div className="site-container">

        {/* Header */}
        <motion.div {...inView} variants={stagger}
          style={{ marginBottom: 'clamp(3rem, 6vw, 5rem)', display: 'grid',
                   gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '2rem' }}>
          <div>
            <motion.span variants={fadeInUp} className="type-label"
              style={{ display: 'block', marginBottom: '1rem' }}>
              Qué hago
            </motion.span>
            <motion.h2 variants={fadeInUp} style={{
              fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic',
              fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 0.95,
              letterSpacing: '-0.02em', color: 'var(--color-star)',
            }}>
              Cuatro formas de<br />sumar valor real.
            </motion.h2>
          </div>
          <motion.p variants={fadeInUp} style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
            color: 'var(--color-faint)', maxWidth: '28ch', textAlign: 'right',
            lineHeight: 1.6,
          }} className="hidden sm:block">
            Negocio, validación<br />y ejecución — no solo código.
          </motion.p>
        </motion.div>

        {/* Línea separadora */}
        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 0 }} />

        {/* Lista de servicios */}
        <motion.div {...inView} variants={stagger}>
          {SERVICES.map((s, i) => (
            <ServiceRow key={s.num} service={s} index={i} last={i === SERVICES.length - 1} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ServiceRow({ service, index, last }: {
  service: typeof SERVICES[0]; index: number; last: boolean
}) {
  const [hov, setHov] = useState(false)

  return (
    <motion.div
      variants={fadeInUp}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '3rem 1fr auto',
        gap: 'clamp(1.5rem, 3vw, 2.5rem)',
        alignItems: 'center',
        padding: 'clamp(1.5rem, 3vw, 2rem) 0',
        borderBottom: last ? 'none' : '1px solid var(--color-border)',
        cursor: 'default',
        transition: 'background 0.3s',
      }}
    >
      {/* Número */}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
        letterSpacing: '0.08em', color: hov ? 'var(--color-accent)' : 'var(--color-faint)',
        transition: 'color 0.3s',
      }}>
        {service.num}
      </span>

      {/* Título + descripción */}
      <div>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 500,
          fontSize: 'clamp(1.375rem, 2.5vw, 1.875rem)',
          letterSpacing: '-0.015em', lineHeight: 1.1,
          color: hov ? 'var(--color-star)' : 'rgba(237,232,223,0.88)',
          transition: 'color 0.3s', marginBottom: '0.375rem',
        }}>
          {service.title}
        </p>
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
          color: 'var(--color-faint)', lineHeight: 1.6,
          maxWidth: '52ch',
          opacity: hov ? 1 : 0.7,
          transition: 'opacity 0.3s',
        }}>
          {service.desc}
        </p>
      </div>

      {/* Arrow */}
      <span style={{
        fontFamily: 'var(--font-ui)', fontSize: '1.125rem',
        color: 'var(--color-accent)',
        opacity: hov ? 1 : 0,
        transform: hov ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'opacity 0.3s, transform 0.3s var(--ease-expo)',
      }}>
        →
      </span>
    </motion.div>
  )
}

import { useState } from 'react'
