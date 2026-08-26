import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()
  return (
    <footer style={{
      position: 'relative', zIndex: 10,
      borderTop: '1px solid var(--color-border)',
      padding: 'clamp(1.5rem, 3vw, 2rem) 0',
    }}>
      <div className="site-container" style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '0.375rem',
      }}>
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.75rem',
          letterSpacing: '0.08em', color: 'var(--color-faint)',
        }}>
          {t('copyright', { year })}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
          color: 'var(--color-faint)', letterSpacing: '0.04em',
        }}>
          {t('role')}
        </span>
      </div>
    </footer>
  )
}
