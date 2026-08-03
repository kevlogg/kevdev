'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const LOCALE_LABEL: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
}

const LOCALE_FLAG: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  pt: '🇵🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
}

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('languageSwitcher')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function switchTo(next: Locale) {
    setOpen(false)
    router.replace(pathname, { locale: next })
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t('label')}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: compact ? '0.4rem 0.75rem' : '0.5rem 1rem',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          background: open ? 'var(--color-accent-dim)' : 'transparent',
          color: open ? 'var(--color-accent)' : 'var(--color-star)',
          fontFamily: 'var(--font-mono)',
          fontSize: compact ? '0.7rem' : '0.75rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: `border-color 0.25s ${EASE.join(',')}, color 0.25s`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--color-border-hover)'
          e.currentTarget.style.color = 'var(--color-accent)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          if (!open) e.currentTarget.style.color = 'var(--color-star)'
        }}
      >
        <span aria-hidden style={{ fontSize: '1em', lineHeight: 1 }}>
          {LOCALE_FLAG[locale]}
        </span>
        {locale.toUpperCase()}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              minWidth: '160px',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              background: 'var(--color-depth)',
              backdropFilter: 'blur(12px)',
              overflow: 'hidden',
              zIndex: 50,
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            }}
          >
            {routing.locales.map(l => (
              <button
                key={l}
                onClick={() => switchTo(l)}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  border: 'none',
                  background: l === locale ? 'var(--color-accent-dim)' : 'transparent',
                  color: l === locale ? 'var(--color-accent)' : 'var(--color-star)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  if (l !== locale) e.currentTarget.style.background = 'var(--color-surface)'
                }}
                onMouseLeave={e => {
                  if (l !== locale) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span aria-hidden style={{ fontSize: '1.1em', lineHeight: 1 }}>{LOCALE_FLAG[l]}</span>
                  {LOCALE_LABEL[l]}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.6 }}>
                  {l.toUpperCase()}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
