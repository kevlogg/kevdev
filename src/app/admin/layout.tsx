'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader  from '@/components/admin/AdminHeader'
import '../globals.css'

/**
 * `/admin` vive fuera del segmento `[locale]`, así que no hereda su layout
 * raíz (que es el único que trae <html>/<body> y globals.css). Por eso este
 * layout debe ser raíz también: sin <html>/<body> propios, Next renderiza
 * el admin sin Tailwind, sin fuentes y sin los tokens de color del tema.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname.startsWith('/admin/login')

  useEffect(() => {
    if (loading) return
    if (!user && !isLoginPage) router.replace('/admin/login')
    if (user  &&  isLoginPage) router.replace('/admin/dashboard')
  }, [user, loading, isLoginPage, router])

  let body: React.ReactNode

  if (loading) {
    /* Spinner while Firebase resolves session */
    body = (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-void)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 24,
          height: 24,
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'admin-spin 0.7s linear infinite',
        }} />
        <style>{`
          @keyframes admin-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  } else if (isLoginPage) {
    /* Render login page without chrome */
    body = (
      <div style={{ minHeight: '100vh', background: 'var(--color-void)' }}>
        {children}
      </div>
    )
  } else if (!user) {
    /* Block render until redirect fires for unauthenticated users */
    body = null
  } else {
    body = (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-void)' }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <AdminHeader />
          <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {body}
      </body>
    </html>
  )
}
