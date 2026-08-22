'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard':   'Dashboard',
  '/admin/clientes':    'Clientes',
  '/admin/estadisticas':'Estadísticas',
  '/admin/presupuesto': 'Presupuesto',
  '/admin/mensajes':    'Mensajes',
}

export default function AdminHeader() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname.startsWith(key),
  )?.[1] ?? 'Admin'

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-depth)',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.9375rem',
        fontWeight: 600,
        color: 'var(--color-star)',
      }}>
        {title}
      </span>

      <button
        onClick={logout}
        style={{
          background: 'none',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.04em',
          padding: '5px 12px',
          borderRadius: 6,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color       = 'var(--color-star)'
          e.currentTarget.style.borderColor = 'var(--color-border-hover)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color       = 'var(--color-muted)'
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      >
        Salir
      </button>
    </header>
  )
}
