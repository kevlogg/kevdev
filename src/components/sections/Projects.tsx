'use client'

import { useState } from 'react'
import TunnelReveal from '@/components/ui/TunnelReveal'
import { PROJECTS, type Project } from '@/lib/projects'

export default function Projects() {
  return (
    <section id="proyectos" style={{ position: 'relative', zIndex: 10, padding: 'clamp(5rem, 10vw, 9rem) 0' }}>
      <div style={{ maxWidth: 820, marginInline: 'auto', paddingInline: 'var(--gutter)' }}>
        <TunnelReveal style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span className="type-label">Proyectos reales</span>
        </TunnelReveal>

        <TunnelReveal delay={0.08} style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'normal',
            fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 0.95,
            letterSpacing: '-0.03em', color: 'var(--color-star)',
          }}>
            Ejecución real,<br />no portfolios ficticios.
          </h2>
        </TunnelReveal>
      </div>

      <div id="proyectos-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.25rem',
        paddingInline: 'var(--gutter)',
      }}>
        <style>{`
          @media (max-width: 900px) { #proyectos-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 560px) { #proyectos-grid { grid-template-columns: 1fr !important; } }
        `}</style>
        {PROJECTS.map((p, i) => (
          <TunnelReveal key={p.name} delay={i * 0.1}>
            <ProjectCard project={p} />
          </TunnelReveal>
        ))}
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [hov, setHov] = useState(false)
  const Tag = project.href ? 'a' : 'div'

  return (
    <Tag
      {...(project.href ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 'clamp(1.75rem, 3vw, 2.5rem)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'var(--color-border)'}`,
        borderRadius: 10,
        background: hov ? 'rgba(255,255,255,0.03)' : 'rgba(6,8,16,0.45)',
        backdropFilter: 'blur(12px)',
        transition: 'border-color 0.35s, background 0.35s',
        cursor: project.href ? 'pointer' : 'default',
        textAlign: 'center',
        height: '100%',
        textDecoration: 'none',
        display: 'block',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: project.statusDot, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-faint)' }}>
          {project.status}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)', marginLeft: '0.5rem' }}>
          {project.year}
        </span>
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--color-star)', marginBottom: '0.625rem' }}>
        {project.name}
      </h3>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
        {project.tagline}
      </p>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
        {project.description}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', justifyContent: 'center' }}>
        {project.tags.map(tag => (
          <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', letterSpacing: '0.07em', color: 'var(--color-faint)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 99, padding: '3px 10px' }}>
            {tag}
          </span>
        ))}
      </div>
    </Tag>
  )
}
