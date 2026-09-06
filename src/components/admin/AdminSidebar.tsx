'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/dashboard',            label: 'Dashboard',         icon: '▦' },
  { href: '/admin/clientes',             label: 'Clientes',          icon: '◈' },
  { href: '/admin/convocatoria',         label: 'Convocatoria Impulso', icon: '🚀' },
  { href: '/admin/estadisticas/web',      label: 'Estadísticas Web',  icon: '🌐' },
  { href: '/admin/estadisticas/clientes', label: 'Métricas Clientes', icon: '💼' },
  { href: '/admin/presupuesto',          label: 'Presupuesto',       icon: '◎' },
  { href: '/admin/mensajes',             label: 'Mensajes',          icon: '◇' },
]

export default function AdminSidebar() {
  const pathname   = usePathname()
  const [open, setOpen] = useState(true)

  return (
    <>
      <aside style={{
        width: open ? 220 : 56,
        minHeight: '100vh',
        background: 'var(--color-depth)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.22,1,0.36,1)',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Logo + toggle */}
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          padding: open ? '0 16px' : '0',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          {open && (
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
            }}>
              kevdev
            </span>
          )}
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Colapsar sidebar' : 'Expandir sidebar'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              fontSize: '0.75rem',
              padding: '6px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color      = 'var(--color-star)'
              e.currentTarget.style.background = 'var(--color-accent-dim)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color      = 'var(--color-muted)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {open ? '←' : '→'}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!open ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: open ? '10px 16px' : '10px 0',
                  justifyContent: open ? 'flex-start' : 'center',
                  margin: '2px 8px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-accent)' : 'var(--color-muted)',
                  background: active ? 'var(--color-accent-dim)' : 'transparent',
                  borderLeft: active ? `2px solid var(--color-accent)` : '2px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color      = 'var(--color-star)'
                    e.currentTarget.style.background = 'rgba(221,232,255,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color      = 'var(--color-muted)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                {open && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile overlay toggle — shown only on small screens */}
      <style>{`
        @media (max-width: 640px) {
          aside { position: fixed; top: 0; left: 0; z-index: 50; }
        }
      `}</style>
    </>
  )
}
