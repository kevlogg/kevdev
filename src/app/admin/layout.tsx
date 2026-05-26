'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader  from '@/components/admin/AdminHeader'

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

  /* Spinner while Firebase resolves session */
  if (loading) {
    return (
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
  }

  /* Render login page without chrome */
  if (isLoginPage) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-void)' }}>
        {children}
      </div>
    )
  }

  /* Block render until redirect fires for unauthenticated users */
  if (!user) return null

  return (
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
