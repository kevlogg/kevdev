'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { stagger, fadeInUp, scaleIn, inView } from '@/lib/motion'

const PROJECTS = [
  {
    name: 'Kronitt',
    status: 'Listo para validar',
    statusDot: 'var(--color-accent)',
    tagline: 'Sistema de turnos y gestión para el sector estética.',
    description:
      'Reservas online, panel administrativo y automatizaciones de recordatorios. Pensado para barberías, peluquerías y centros de estética que quieren profesionalizar su operación y crecer.',
    tags: ['Web app', 'SaaS', 'Firebase', 'React'],
    year: '2025',
  },
  {
    name: 'GrowAi',
    status: 'En construcción',
    statusDot: 'rgba(237,232,223,0.3)',
    tagline: 'App de seguimiento de cultivo, diagnóstico y comunidad de nicho.',
    description:
      'Seguimiento de ciclos, registro de acciones, diagnóstico asistido por imágenes y comunidad integrada. Producto de nicho con visión de utilidad real y retención por engagement.',
    tags: ['Mobile web', 'Firebase', 'IA', 'Comunidad'],
    year: '2025',
  },
]

export default function Projects() {
  return (
    <section id="proyectos" className="section-y" style={{ position: 'relative', zIndex: 10 }}>
      <div className="site-container">

        <motion.div {...inView} variants={stagger}
          style={{ marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <motion.span variants={fadeInUp} className="type-label"
            style={{ display: 'block', marginBottom: '1rem' }}>
            Proyectos reales
          </motion.span>
          <motion.h2 variants={fadeInUp} style={{
            fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 0.95,
            letterSpacing: '-0.02em', color: 'var(--color-star)',
          }}>
            Ejecución real,<br />no portfolios ficticios.
          </motion.h2>
        </motion.div>

        <motion.div {...inView} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                   gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
          {PROJECTS.map(p => <ProjectCard key={p.name} project={p} />)}
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  const [hov, setHov] = useState(false)

  return (
    <motion.article
      variants={scaleIn}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 'clamp(1.75rem, 3vw, 2.5rem)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'var(--color-border)'}`,
        borderRadius: 12,
        background: hov ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.02)',
        transition: 'border-color 0.35s, background 0.35s',
        cursor: 'default',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%',
                         background: project.statusDot, display: 'inline-block',
                         flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem',
                         letterSpacing: '0.1em', textTransform: 'uppercase',
                         color: 'var(--color-faint)' }}>
            {project.status}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                       color: 'var(--color-faint)' }}>
          {project.year}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 500,
        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
        letterSpacing: '-0.02em', lineHeight: 1,
        color: 'var(--color-star)', marginBottom: '0.625rem',
      }}>
        {project.name}
      </h3>

      {/* Tagline */}
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.9375rem',
        color: 'var(--color-muted)', lineHeight: 1.5,
        marginBottom: '1rem',
      }}>
        {project.tagline}
      </p>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
        color: 'var(--color-faint)', lineHeight: 1.7,
        marginBottom: '1.75rem',
      }}>
        {project.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {project.tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
            letterSpacing: '0.07em',
            color: 'var(--color-faint)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4, padding: '3px 8px',
          }}>
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  )
}
