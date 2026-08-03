'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { ProjectText, TechSpec } from '@/lib/projects'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

const FIELD_KEYS: (keyof TechSpec)[] = [
  'architecture', 'frameworks', 'languages', 'auth', 'payments', 'database', 'seo', 'hosting', 'other',
]

export default function TechSpecModal({
  project,
  onClose,
}: {
  project: ProjectText
  onClose: () => void
}) {
  const t = useTranslations('projectFields')
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const specGroups: { label?: string; spec: TechSpec }[] = project.techSpecs
    ? project.techSpecs.map(({ label, spec }) => ({ label, spec }))
    : project.techSpec
      ? [{ spec: project.techSpec }]
      : []

  if (specGroups.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(6,8,16,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--gutter)',
        }}
      >
        <motion.div
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-label={t('techSpecAriaOf', { name: project.name })}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 640,
            maxHeight: '85vh',
            overflowY: 'auto',
            background: 'rgba(14,16,26,0.97)',
            border: `1px solid ${project.color}33`,
            borderRadius: 20,
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6875rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: project.color,
              }}>
                {t('techSpecLabel')}
              </span>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: 'var(--color-star)',
                margin: '0.5rem 0 0',
              }}>
                {project.name}
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label={t('closeAria')}
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'none',
                color: 'var(--color-faint)',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {specGroups.map((group, groupIdx) => (
              <div key={group.label ?? groupIdx}>
                {group.label && (
                  <h4 style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: 'var(--color-star)',
                    margin: '0 0 1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: `1px solid ${project.color}33`,
                  }}>
                    {group.label}
                  </h4>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                  {FIELD_KEYS.map(key => {
                    const value = group.spec[key]
                    if (!value) return null
                    return (
                      <div key={key}>
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: project.color,
                          marginBottom: '0.3rem',
                        }}>
                          {t(`techSpec.${key}`)}
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.9375rem',
                          lineHeight: 1.6,
                          color: 'var(--color-muted)',
                          margin: 0,
                        }}>
                          {value}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
