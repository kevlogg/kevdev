'use client'

import { useState, FormEvent } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      /* layout.tsx useEffect will redirect to /admin/dashboard */
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? 'unknown'
      setError(`Error: ${code}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: 32,
      }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--color-accent)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 8,
            margin: '0 0 8px',
          }}>
            Panel de administración
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-star)',
            margin: 0,
          }}>
            Acceso privado
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-muted)',
              letterSpacing: '0.04em',
            }}>
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                background: 'rgba(221,232,255,0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9375rem',
                color: 'var(--color-star)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border)'  }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-muted)',
              letterSpacing: '0.04em',
            }}>
              Contraseña
            </span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                background: 'rgba(221,232,255,0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9375rem',
                color: 'var(--color-star)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border)'  }}
            />
          </label>

          {error && (
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: '#f87171',
              margin: 0,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              background: loading ? 'var(--color-accent-dim)' : 'var(--color-accent)',
              color: 'var(--color-on-accent)',
              border: 'none',
              borderRadius: 8,
              padding: '11px 20px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
