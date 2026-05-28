# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a private `/admin` panel protected by Firebase Auth to the existing Next.js 15 (App Router) kevdev site without touching any public routes.

**Architecture:** All admin routes live under `src/app/admin/`. A client-side layout component checks Firebase auth state on mount and redirects unauthenticated users to `/admin/login`. Firestore is used for persisting client data, checklist progress, and budget items.

**Tech Stack:** Next.js 15 App Router, TypeScript 5, Firebase v10 (Auth + Firestore), inline styles with CSS custom properties (matching existing codebase pattern), no new UI libraries.

---

## Codebase context

- **Framework:** Next.js 15 with App Router (`src/app/`)
- **Styling:** Tailwind v4 imported but components use **inline styles** with CSS variables. Follow the same pattern.
- **CSS variables (defined in `src/app/globals.css`):**
  - `--color-void: #060810` — main background
  - `--color-depth: #0b0d1a` — elevated surface / cards
  - `--color-surface: rgba(34,211,238,0.04)` — subtle surface tint
  - `--color-border: rgba(100,160,255,0.09)` — borders
  - `--color-border-hover: rgba(100,200,255,0.18)` — hover borders
  - `--color-star: #dde8ff` — primary text
  - `--color-muted: rgba(221,232,255,0.45)` — secondary text
  - `--color-faint: rgba(221,232,255,0.22)` — tertiary text
  - `--color-accent: #22d3ee` — cyan accent
  - `--color-accent-hi: #67e8f9` — accent hover
  - `--color-accent-dim: rgba(34,211,238,0.14)` — accent tint
  - `--color-on-accent: #030810` — text on accent bg
  - `--font-display`, `--font-ui`, `--font-serif`, `--font-mono`
- **Path alias:** `@/*` maps to `src/*`
- **Firebase:** Not yet installed. Must be added.

---

## File Structure

```
C:\development\kevdev\
├── .env.local                                  (modify — add Firebase env vars)
├── src/
│   ├── app/
│   │   └── admin/
│   │       ├── layout.tsx                      (create — auth-guarded shell)
│   │       ├── page.tsx                        (create — redirect to /admin/dashboard)
│   │       ├── login/
│   │       │   └── page.tsx                    (create — login form)
│   │       ├── dashboard/
│   │       │   └── page.tsx                    (create — metrics + pipeline)
│   │       ├── clientes/
│   │       │   ├── page.tsx                    (create — CRM table + add form)
│   │       │   └── [id]/
│   │       │       └── page.tsx                (create — client detail + checklist)
│   │       ├── presupuesto/
│   │       │   └── page.tsx                    (create — budget generator)
│   │       └── mensajes/
│   │           └── page.tsx                    (create — message templates)
│   ├── components/
│   │   └── admin/
│   │       ├── AdminSidebar.tsx                (create — collapsible sidebar nav)
│   │       └── AdminHeader.tsx                 (create — header with logout)
│   ├── hooks/
│   │   └── useAuth.ts                          (create — Firebase auth state)
│   └── lib/
│       ├── firebase.ts                         (create — Firebase app init)
│       ├── firestore.ts                        (create — types + CRUD helpers)
│       └── checklist-steps.ts                  (create — 13 hardcoded steps)
```

---

## Task 1: Install Firebase

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.local`

- [ ] **Step 1: Install Firebase SDK**

```bash
cd C:\development\kevdev
npm install firebase
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Add Firebase env vars to `.env.local`**

Open `.env.local` and append these lines (keep the existing VERCEL_OIDC_TOKEN line):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Get these values from Firebase Console > Project Settings > Your apps > Web app config.

- [ ] **Step 3: Verify TypeScript can see Firebase**

```bash
npx tsc --noEmit
```

Expected: no errors related to firebase (may have pre-existing errors — that's fine).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install firebase sdk"
```

---

## Task 2: Firebase initialization

**Files:**
- Create: `src/lib/firebase.ts`

- [ ] **Step 1: Create `src/lib/firebase.ts`**

```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/firebase.ts
git commit -m "feat(admin): add firebase initialization"
```

---

## Task 3: Firestore types and CRUD helpers

**Files:**
- Create: `src/lib/firestore.ts`

- [ ] **Step 1: Create `src/lib/firestore.ts`**

```typescript
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

/* ─── Types ─────────────────────────────────────────────────────────── */

export type EstadoCliente =
  | 'prospecto' | 'contactado' | 'demo'
  | 'negociacion' | 'cerrado' | 'entregado'

export interface Cliente {
  id?: string
  creadoEn: Timestamp
  nombre: string
  rubro: string
  contacto: string
  telefono: string
  instagram: string
  estado: EstadoCliente
  notas: string
}

export interface ChecklistProgreso {
  clienteId: string
  stepId: number
  completado: boolean
  updatedAt: Timestamp
}

export interface PresupuestoItem {
  id?: string
  nombre: string
  precio: number
  esDefault: boolean
}

/* ─── Clientes ───────────────────────────────────────────────────────── */

export async function getClientes(): Promise<Cliente[]> {
  const q = query(collection(db, 'clientes'), orderBy('creadoEn', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente))
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const snap = await getDoc(doc(db, 'clientes', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Cliente
}

export async function addCliente(
  data: Omit<Cliente, 'id' | 'creadoEn'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'clientes'), {
    ...data,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function updateCliente(
  id: string,
  data: Partial<Omit<Cliente, 'id' | 'creadoEn'>>,
): Promise<void> {
  await updateDoc(doc(db, 'clientes', id), data)
}

/* ─── Checklist ──────────────────────────────────────────────────────── */

export async function getChecklistProgreso(
  clienteId: string,
): Promise<Record<number, boolean>> {
  const q = query(
    collection(db, 'checklistProgreso'),
    where('clienteId', '==', clienteId),
  )
  const snap = await getDocs(q)
  const result: Record<number, boolean> = {}
  snap.docs.forEach(d => {
    const data = d.data() as ChecklistProgreso
    result[data.stepId] = data.completado
  })
  return result
}

export async function toggleChecklistStep(
  clienteId: string,
  stepId: number,
  completado: boolean,
): Promise<void> {
  const q = query(
    collection(db, 'checklistProgreso'),
    where('clienteId', '==', clienteId),
    where('stepId', '==', stepId),
  )
  const snap = await getDocs(q)

  if (snap.empty) {
    await addDoc(collection(db, 'checklistProgreso'), {
      clienteId,
      stepId,
      completado,
      updatedAt: serverTimestamp(),
    })
  } else {
    await updateDoc(snap.docs[0].ref, { completado, updatedAt: serverTimestamp() })
  }
}

/* ─── Presupuesto ────────────────────────────────────────────────────── */

export async function getPresupuestoItems(): Promise<PresupuestoItem[]> {
  const snap = await getDocs(collection(db, 'presupuestoItems'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PresupuestoItem))
}

export async function addPresupuestoItem(
  data: Omit<PresupuestoItem, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'presupuestoItems'), data)
  return ref.id
}

export async function updatePresupuestoItem(
  id: string,
  data: Partial<Omit<PresupuestoItem, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'presupuestoItems', id), data)
}

export async function deletePresupuestoItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'presupuestoItems', id))
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/firestore.ts
git commit -m "feat(admin): add firestore types and CRUD helpers"
```

---

## Task 4: Hardcoded checklist steps

**Files:**
- Create: `src/lib/checklist-steps.ts`

- [ ] **Step 1: Create `src/lib/checklist-steps.ts`**

```typescript
export interface ChecklistStep {
  id: number
  texto: string
  etapa: string
}

export const CHECKLIST_STEPS: ChecklistStep[] = [
  { id: 1,  texto: 'Analizar perfil de Instagram del cliente',   etapa: 'Prospección'  },
  { id: 2,  texto: 'Enviar mensaje inicial de contacto',          etapa: 'Prospección'  },
  { id: 3,  texto: 'Confirmar interés del cliente',               etapa: 'Contacto'     },
  { id: 4,  texto: 'Construir demo personalizada',                etapa: 'Demo'         },
  { id: 5,  texto: 'Enviar demo con mensaje profesional',         etapa: 'Demo'         },
  { id: 6,  texto: 'Hacer seguimiento a las 48hs',                etapa: 'Demo'         },
  { id: 7,  texto: 'Presentar plan y presupuesto',                etapa: 'Presupuesto'  },
  { id: 8,  texto: 'Resolver objeciones o dudas',                 etapa: 'Negociación'  },
  { id: 9,  texto: 'Enviar contrato digital',                     etapa: 'Cierre'       },
  { id: 10, texto: 'Confirmar primer pago',                       etapa: 'Cierre'       },
  { id: 11, texto: 'Publicar sitio con dominio',                  etapa: 'Entrega'      },
  { id: 12, texto: 'Dar acceso al panel admin',                   etapa: 'Entrega'      },
  { id: 13, texto: 'Pedir referido o reseña a los 7 días',        etapa: 'Post-venta'   },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/checklist-steps.ts
git commit -m "feat(admin): add hardcoded checklist steps"
```

---

## Task 5: useAuth hook

**Files:**
- Create: `src/hooks/useAuth.ts`

- [ ] **Step 1: Create `src/hooks/useAuth.ts`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const logout = () => signOut(auth)

  return { user, loading, logout }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat(admin): add useAuth hook"
```

---

## Task 6: AdminSidebar and AdminHeader components

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/AdminHeader.tsx`

- [ ] **Step 1: Create `src/components/admin/AdminSidebar.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/dashboard',   label: 'Dashboard',    icon: '▦' },
  { href: '/admin/clientes',    label: 'Clientes',     icon: '◈' },
  { href: '/admin/presupuesto', label: 'Presupuesto',  icon: '◎' },
  { href: '/admin/mensajes',    label: 'Mensajes',     icon: '◇' },
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
```

- [ ] **Step 2: Create `src/components/admin/AdminHeader.tsx`**

```typescript
'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard':   'Dashboard',
  '/admin/clientes':    'Clientes',
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx src/components/admin/AdminHeader.tsx
git commit -m "feat(admin): add AdminSidebar and AdminHeader components"
```

---

## Task 7: Admin layout with auth guard

**Files:**
- Create: `src/app/admin/layout.tsx`

- [ ] **Step 1: Create `src/app/admin/layout.tsx`**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/layout.tsx
git commit -m "feat(admin): add auth-guarded admin layout"
```

---

## Task 8: Login page

**Files:**
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create `src/app/admin/login/page.tsx`**

```typescript
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
    } catch {
      setError('Credenciales incorrectas')
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Test the login page manually**

```bash
cd C:\development\kevdev
npm run dev
```

Navigate to `http://localhost:3000/admin/login`. Verify:
- The form renders correctly on the dark background
- Submitting with wrong credentials shows "Credenciales incorrectas"
- Submitting with correct credentials redirects to `/admin/dashboard` (returns 404 until Task 10)
- Unauthenticated navigation to `/admin` redirects to `/admin/login`

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login/page.tsx
git commit -m "feat(admin): add login page"
```

---

## Task 9: Admin root redirect

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create `src/app/admin/page.tsx`**

```typescript
import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/dashboard')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat(admin): redirect /admin to /admin/dashboard"
```

---

## Task 10: Dashboard page

**Files:**
- Create: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Create `src/app/admin/dashboard/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getClientes, type Cliente, type EstadoCliente } from '@/lib/firestore'

const ETAPAS: EstadoCliente[] = [
  'prospecto', 'contactado', 'demo', 'negociacion', 'cerrado', 'entregado',
]

const ETAPA_LABELS: Record<EstadoCliente, string> = {
  prospecto:   'Prospecto',
  contactado:  'Contactado',
  demo:        'Demo',
  negociacion: 'Negociación',
  cerrado:     'Cerrado',
  entregado:   'Entregado',
}

const ETAPA_COLORS: Record<EstadoCliente, string> = {
  prospecto:   'rgba(148,163,184,0.6)',
  contactado:  'rgba(96,165,250,0.8)',
  demo:        'rgba(251,191,36,0.8)',
  negociacion: 'rgba(251,146,60,0.8)',
  cerrado:     'rgba(74,222,128,0.8)',
  entregado:   'rgba(34,211,238,0.9)',
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: 'var(--color-depth)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        color: 'var(--color-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 8,
        margin: '0 0 8px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        fontWeight: 700,
        color: 'var(--color-star)',
        margin: 0,
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getClientes().then(data => {
      setClientes(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>
        Cargando...
      </div>
    )
  }

  const total     = clientes.length
  const enProceso = clientes.filter(c => !['cerrado', 'entregado'].includes(c.estado)).length
  const cerrados  = clientes.filter(c => ['cerrado', 'entregado'].includes(c.estado)).length
  const recientes = [...clientes].slice(0, 5)
  const maxPipeline = Math.max(...ETAPAS.map(e => clientes.filter(c => c.estado === e).length), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 900 }}>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16,
      }}>
        <Stat label="Total clientes" value={total} />
        <Stat label="En proceso"     value={enProceso} />
        <Stat label="Cerrados"       value={cerrados} />
      </div>

      {/* Pipeline */}
      <section style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--color-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          margin: '0 0 20px',
        }}>
          Pipeline por etapa
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ETAPAS.map(etapa => {
            const count = clientes.filter(c => c.estado === etapa).length
            const pct   = (count / maxPipeline) * 100
            return (
              <div key={etapa} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-muted)',
                  width: 100,
                  flexShrink: 0,
                }}>
                  {ETAPA_LABELS[etapa]}
                </span>
                <div style={{
                  flex: 1,
                  height: 6,
                  background: 'rgba(221,232,255,0.06)',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: ETAPA_COLORS[etapa],
                    borderRadius: 99,
                    transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                  }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-faint)',
                  width: 24,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recientes */}
      <section style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Clientes recientes
          </h2>
          <Link href="/admin/clientes" style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--color-accent)',
            textDecoration: 'none',
          }}>
            Ver todos
          </Link>
        </div>
        {recientes.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>
            Sin clientes aún.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recientes.map(c => (
              <Link
                key={c.id}
                href={`/admin/clientes/${c.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--color-border)',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-star)' }}>
                  {c.nombre}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: ETAPA_COLORS[c.estado],
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {ETAPA_LABELS[c.estado]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify and test**

```bash
npx tsc --noEmit
npm run dev
```

Navigate to `http://localhost:3000/admin/dashboard` after logging in. Verify metrics render and pipeline shows (empty data is fine).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/dashboard/page.tsx
git commit -m "feat(admin): add dashboard page with metrics and pipeline"
```

---

## Task 11: CRM - Clientes page

**Files:**
- Create: `src/app/admin/clientes/page.tsx`

- [ ] **Step 1: Create `src/app/admin/clientes/page.tsx`**

```typescript
'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import {
  getClientes, addCliente,
  type Cliente, type EstadoCliente,
} from '@/lib/firestore'

const ESTADOS: EstadoCliente[] = [
  'prospecto', 'contactado', 'demo', 'negociacion', 'cerrado', 'entregado',
]

const ESTADO_LABELS: Record<EstadoCliente, string> = {
  prospecto:   'Prospecto',
  contactado:  'Contactado',
  demo:        'Demo',
  negociacion: 'Negociación',
  cerrado:     'Cerrado',
  entregado:   'Entregado',
}

const ESTADO_COLORS: Record<EstadoCliente, string> = {
  prospecto:   '#94a3b8',
  contactado:  '#60a5fa',
  demo:        '#fbbf24',
  negociacion: '#fb923c',
  cerrado:     '#4ade80',
  entregado:   '#22d3ee',
}

const EMPTY_FORM = {
  nombre: '', rubro: '', contacto: '', telefono: '', instagram: '',
  estado: 'prospecto' as EstadoCliente, notas: '',
}

export default function ClientesPage() {
  const [clientes,  setClientes]  = useState<Cliente[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<EstadoCliente | 'todos'>('todos')
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const data = await getClientes()
    setClientes(data)
    setLoading(false)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await addCliente(form)
    setForm(EMPTY_FORM)
    setShowForm(false)
    await load()
    setSaving(false)
  }

  const visible = filter === 'todos'
    ? clientes
    : clientes.filter(c => c.estado === filter)

  const inputStyle = {
    background: 'rgba(221,232,255,0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-star)',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['todos', ...ESTADOS] as const).map(e => (
            <button
              key={e}
              onClick={() => setFilter(e)}
              style={{
                padding: '5px 12px',
                borderRadius: 99,
                border: `1px solid ${filter === e ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: filter === e ? 'var(--color-accent-dim)' : 'transparent',
                color: filter === e ? 'var(--color-accent)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {e === 'todos' ? 'Todos' : ESTADO_LABELS[e as EstadoCliente]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-on-accent)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          <input placeholder="Nombre *" required value={form.nombre}    onChange={e => setForm(f => ({ ...f, nombre:    e.target.value }))} style={inputStyle} />
          <input placeholder="Rubro"             value={form.rubro}     onChange={e => setForm(f => ({ ...f, rubro:     e.target.value }))} style={inputStyle} />
          <input placeholder="Contacto"          value={form.contacto}  onChange={e => setForm(f => ({ ...f, contacto:  e.target.value }))} style={inputStyle} />
          <input placeholder="Teléfono"          value={form.telefono}  onChange={e => setForm(f => ({ ...f, telefono:  e.target.value }))} style={inputStyle} />
          <input placeholder="Instagram"         value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} style={inputStyle} />
          <select
            value={form.estado}
            onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoCliente }))}
            style={{ ...inputStyle }}
          >
            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
          </select>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer', color: 'var(--color-muted)' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-on-accent)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Cargando...</p>
      ) : visible.length === 0 ? (
        <p style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Sin clientes.</p>
      ) : (
        <div style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nombre', 'Rubro', 'Contacto', 'Estado'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--color-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(c => (
                <tr
                  key={c.id}
                  style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(221,232,255,0.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.9375rem',
                        color: 'var(--color-star)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {c.nombre}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {c.rubro || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {c.contacto || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: ESTADO_COLORS[c.estado],
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {ESTADO_LABELS[c.estado]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/clientes/page.tsx
git commit -m "feat(admin): add clientes CRM page"
```

---

## Task 12: Client detail page with checklist

**Files:**
- Create: `src/app/admin/clientes/[id]/page.tsx`

- [ ] **Step 1: Create `src/app/admin/clientes/[id]/page.tsx`**

```typescript
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getCliente, updateCliente, getChecklistProgreso, toggleChecklistStep,
  type Cliente, type EstadoCliente,
} from '@/lib/firestore'
import { CHECKLIST_STEPS } from '@/lib/checklist-steps'

const ESTADOS: EstadoCliente[] = [
  'prospecto', 'contactado', 'demo', 'negociacion', 'cerrado', 'entregado',
]

const ESTADO_LABELS: Record<EstadoCliente, string> = {
  prospecto:   'Prospecto',
  contactado:  'Contactado',
  demo:        'Demo',
  negociacion: 'Negociación',
  cerrado:     'Cerrado',
  entregado:   'Entregado',
}

export default function ClienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [cliente,   setCliente]   = useState<Cliente | null>(null)
  const [progreso,  setProgreso]  = useState<Record<number, boolean>>({})
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [form,      setForm]      = useState<Partial<Cliente>>({})
  const notasTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      const [c, p] = await Promise.all([
        getCliente(id),
        getChecklistProgreso(id),
      ])
      if (!c) { router.replace('/admin/clientes'); return }
      setCliente(c)
      setForm(c)
      setProgreso(p)
      setLoading(false)
    }
    load()
  }, [id, router])

  async function saveField(field: keyof Cliente, value: string) {
    setSaving(true)
    await updateCliente(id, { [field]: value })
    setCliente(prev => prev ? { ...prev, [field]: value } : prev)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function handleNotasChange(value: string) {
    setForm(f => ({ ...f, notas: value }))
    if (notasTimer.current) clearTimeout(notasTimer.current)
    notasTimer.current = setTimeout(() => saveField('notas', value), 900)
  }

  async function handleChecklistToggle(stepId: number) {
    const next = !progreso[stepId]
    setProgreso(p => ({ ...p, [stepId]: next }))
    await toggleChecklistStep(id, stepId, next)
  }

  if (loading) {
    return <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Cargando...</p>
  }

  if (!cliente) return null

  const completados  = CHECKLIST_STEPS.filter(s => progreso[s.id]).length
  const progressPct  = Math.round((completados / CHECKLIST_STEPS.length) * 100)

  const inputStyle = {
    background: 'rgba(221,232,255,0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-star)',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-star)', margin: '0 0 4px' }}>
            {cliente.nombre}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {cliente.rubro}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#4ade80', letterSpacing: '0.06em' }}>
              Guardado
            </span>
          )}
          <select
            value={form.estado ?? cliente.estado}
            onChange={e => {
              const v = e.target.value as EstadoCliente
              setForm(f => ({ ...f, estado: v }))
              saveField('estado', v)
            }}
            style={{ ...inputStyle, width: 'auto' }}
          >
            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
          </select>
        </div>
      </div>

      {/* Data card */}
      <section style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Datos del cliente
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {(
            [
              { field: 'nombre',    label: 'Nombre'    },
              { field: 'rubro',     label: 'Rubro'     },
              { field: 'contacto',  label: 'Contacto'  },
              { field: 'telefono',  label: 'Teléfono'  },
              { field: 'instagram', label: 'Instagram' },
            ] as { field: keyof Cliente; label: string }[]
          ).map(({ field, label }) => (
            <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {label}
              </span>
              <input
                value={(form[field] as string) ?? ''}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                onBlur={e => saveField(field, e.target.value)}
                style={inputStyle}
              />
            </label>
          ))}
        </div>

        {/* Notas */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Notas {saving && <span style={{ color: 'var(--color-accent)' }}>(guardando...)</span>}
          </span>
          <textarea
            value={form.notas ?? ''}
            onChange={e => handleNotasChange(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
        </label>
      </section>

      {/* Checklist */}
      <section style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Checklist de venta
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)' }}>
            {completados}/{CHECKLIST_STEPS.length} — {progressPct}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(221,232,255,0.06)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'var(--color-accent)',
            borderRadius: 99,
            transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHECKLIST_STEPS.map(step => {
            const done = !!progreso[step.id]
            return (
              <button
                key={step.id}
                onClick={() => handleChecklistToggle(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 8,
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(221,232,255,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Checkbox */}
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `2px solid ${done ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: done ? 'var(--color-accent-dim)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  fontSize: '0.6875rem',
                  color: 'var(--color-accent)',
                }}>
                  {done && '✓'}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.875rem',
                    color: done ? 'var(--color-faint)' : 'var(--color-star)',
                    textDecoration: done ? 'line-through' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {step.texto}
                  </span>
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--color-faint)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}>
                  {step.etapa}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/clientes/[id]/page.tsx
git commit -m "feat(admin): add client detail page with checklist"
```

---

## Task 13: Presupuesto page

**Files:**
- Create: `src/app/admin/presupuesto/page.tsx`

- [ ] **Step 1: Create `src/app/admin/presupuesto/page.tsx`**

```typescript
'use client'

import { useEffect, useState, FormEvent } from 'react'
import {
  getPresupuestoItems, addPresupuestoItem,
  updatePresupuestoItem, deletePresupuestoItem,
  type PresupuestoItem,
} from '@/lib/firestore'

type Modalidad = 'unico' | 'mensual'

const EMPTY_ITEM: Omit<PresupuestoItem, 'id'> = { nombre: '', precio: 0, esDefault: false }

function formatPrecio(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default function PresupuestoPage() {
  const [items,     setItems]     = useState<PresupuestoItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_ITEM)
  const [saving,    setSaving]    = useState(false)
  const [modalidad, setModalidad] = useState<Modalidad>('unico')
  const [copied,    setCopied]    = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await getPresupuestoItems()
    setItems(data)
    setLoading(false)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await addPresupuestoItem(form)
    setForm(EMPTY_ITEM)
    setShowForm(false)
    await load()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await deletePresupuestoItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const total = items.reduce((acc, i) => acc + i.precio, 0)

  function buildTexto() {
    const lines = items.map(i =>
      `• ${i.nombre}: ${formatPrecio(i.precio)}`
    )
    const label = modalidad === 'mensual' ? 'Mensual' : 'Pago único'
    return [
      `Presupuesto kevdev — ${label}`,
      '',
      ...lines,
      '',
      `TOTAL: ${formatPrecio(total)}`,
    ].join('\n')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildTexto())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle = {
    background: 'rgba(221,232,255,0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-star)',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* Modalidad toggle */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
          {(['unico', 'mensual'] as Modalidad[]).map(m => (
            <button
              key={m}
              onClick={() => setModalidad(m)}
              style={{
                padding: '6px 16px',
                background: modalidad === m ? 'var(--color-accent-dim)' : 'transparent',
                border: 'none',
                color: modalidad === m ? 'var(--color-accent)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {m === 'unico' ? 'Pago único' : 'Mensual'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-on-accent)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Agregar ítem
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <label style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre *</span>
            <input placeholder="Ej: Landing page" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={inputStyle} />
          </label>
          <label style={{ width: 130, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Precio (ARS) *</span>
            <input type="number" min={0} required value={form.precio || ''} onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))} style={inputStyle} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer', color: 'var(--color-muted)' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)', border: 'none', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '...' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      {/* Items list */}
      {loading ? (
        <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Cargando...</p>
      ) : (
        <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          {items.length === 0 ? (
            <p style={{ padding: 20, fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>Sin ítems.</p>
          ) : (
            <>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <span style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-star)' }}>
                    {item.nombre}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-accent)' }}>
                    {formatPrecio(item.precio)}
                  </span>
                  <button
                    onClick={() => item.id && handleDelete(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-faint)', fontSize: '0.875rem', padding: '2px 6px', borderRadius: 4, transition: 'color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-faint)' }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                  Total {modalidad === 'mensual' ? 'mensual' : 'único'}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {formatPrecio(total)}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Copy button */}
      {items.length > 0 && (
        <button
          onClick={handleCopy}
          style={{
            alignSelf: 'flex-start',
            background: copied ? '#4ade8020' : 'transparent',
            border: `1px solid ${copied ? '#4ade80' : 'var(--color-border)'}`,
            color: copied ? '#4ade80' : 'var(--color-muted)',
            borderRadius: 8,
            padding: '10px 20px',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '¡Copiado!' : 'Copiar presupuesto'}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/presupuesto/page.tsx
git commit -m "feat(admin): add presupuesto generator page"
```

---

## Task 14: Mensajes page

**Files:**
- Create: `src/app/admin/mensajes/page.tsx`

- [ ] **Step 1: Create `src/app/admin/mensajes/page.tsx`**

```typescript
'use client'

import { useState } from 'react'

interface Plantilla {
  titulo: string
  texto: (nombre: string, demo: string) => string
}

const PLANTILLAS: Plantilla[] = [
  {
    titulo: 'Demo cercana',
    texto: (nombre, demo) =>
      `Hola ${nombre}! Te comparto la demo que armé para tu negocio: ${demo}\n\nEs completamente personalizada para vos. Cualquier duda o cambio que quieras hacerle, avisame.`,
  },
  {
    titulo: 'Demo profesional',
    texto: (nombre, demo) =>
      `Hola ${nombre}, soy Kevin. Armé esta demo especialmente para tu negocio: ${demo}\n\nEl objetivo es que puedas ver concretamente cómo quedaría tu sitio. Si querés avanzar o tenés preguntas, estoy disponible.`,
  },
  {
    titulo: 'Seguimiento 48hs',
    texto: (nombre, demo) =>
      `Hola ${nombre}! Te escribo por la demo que te envié hace un par de días: ${demo}\n\n¿Pudiste verla? Quería saber si te generó alguna duda o si te interesa que hablemos.`,
  },
  {
    titulo: 'Pedido de referido',
    texto: (nombre, _demo) =>
      `Hola ${nombre}! Espero que estés disfrutando el sitio. Si conocés a alguien que pueda necesitar algo similar, te agradecería mucho que me recomiendes. Un saludo!`,
  },
]

function PlantillaCard({ plantilla, nombre, demo }: { plantilla: Plantilla; nombre: string; demo: string }) {
  const [copied, setCopied] = useState(false)
  const texto = plantilla.texto(nombre || '[nombre]', demo || '[link demo]')

  async function handleCopy() {
    await navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: 'var(--color-depth)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {plantilla.titulo}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#4ade8020' : 'transparent',
            border: `1px solid ${copied ? '#4ade80' : 'var(--color-border)'}`,
            color: copied ? '#4ade80' : 'var(--color-muted)',
            borderRadius: 6,
            padding: '4px 12px',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.9375rem',
        color: 'var(--color-star)',
        lineHeight: 1.65,
        margin: 0,
        whiteSpace: 'pre-wrap',
        opacity: nombre ? 1 : 0.5,
      }}>
        {texto}
      </p>
    </div>
  )
}

export default function MensajesPage() {
  const [nombre, setNombre] = useState('')
  const [demo,   setDemo]   = useState('')

  const inputStyle = {
    background: 'rgba(221,232,255,0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-star)',
    outline: 'none',
    flex: 1,
  }

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Inputs */}
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 20,
      }}>
        <label style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Nombre del cliente
          </span>
          <input
            placeholder="Ej: María"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={inputStyle}
            onFocus={e  => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
            onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
          />
        </label>
        <label style={{ flex: 2, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Link de la demo
          </span>
          <input
            placeholder="https://mi-demo.vercel.app"
            value={demo}
            onChange={e => setDemo(e.target.value)}
            style={inputStyle}
            onFocus={e  => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
            onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
          />
        </label>
      </div>

      {/* Templates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PLANTILLAS.map(p => (
          <PlantillaCard key={p.titulo} plantilla={p} nombre={nombre} demo={demo} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run full build to check for errors**

```bash
npm run build
```

Expected: build completes with no TypeScript or Next.js errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/mensajes/page.tsx
git commit -m "feat(admin): add mensajes templates page"
```

---

## Post-implementation checklist

- [ ] **Firestore security rules:** In the Firebase Console, set the following rules under Firestore > Rules. Replace `TU_UID_AQUI` with your actual Firebase user UID (visible in Firebase Console > Authentication > Users after you create the user):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == 'TU_UID_AQUI';
    }
  }
}
```

- [ ] **Create Firebase user:** In Firebase Console > Authentication > Users, click "Add user" and create your email/password account. Copy the UID for the security rules above.

- [ ] **Set Vercel env vars:** In Vercel dashboard > Project > Settings > Environment Variables, add all `NEXT_PUBLIC_FIREBASE_*` variables for the production environment.

- [ ] **Final smoke test:**
  - Log in at `/admin/login` with the Firebase user credentials
  - Add a test client in `/admin/clientes`
  - Open the client detail and tick checklist items
  - Add budget items in `/admin/presupuesto` and copy the formatted output
  - Enter a name and demo link in `/admin/mensajes` and verify templates update
  - Log out and confirm you're redirected to `/admin/login`
  - Confirm public routes (`/`, `/proyectos`) are completely unaffected

---

## Spec coverage check

| Requirement | Task |
|---|---|
| Firebase Auth email+password | Task 5, 8 |
| No public registration | Login page has no register form |
| Protect /admin routes | Task 7 (layout auth guard) |
| Redirect to /admin/login if no session | Task 7 |
| Persist session with onAuthStateChanged | Task 5 |
| /admin/login | Task 8 |
| /admin redirect to /admin/dashboard | Task 9 |
| /admin/dashboard with metrics + pipeline | Task 10 |
| /admin/clientes CRM | Task 11 |
| /admin/clientes/[id] detail + checklist | Task 12 |
| /admin/presupuesto budget generator | Task 13 |
| /admin/mensajes templates | Task 14 |
| Firestore: clientes collection | Tasks 3, 11, 12 |
| Firestore: checklistProgreso | Tasks 3, 12 |
| Firestore: presupuestoItems | Tasks 3, 13 |
| 13 hardcoded checklist steps | Task 4 |
| Sidebar collapsible | Task 6 |
| Header with logout | Task 6 |
| Dark mode, flat design, consistent with kevdev | All tasks (uses same CSS variables) |
| Firestore security rules (single UID) | Post-implementation checklist |
| Loading state (no flash) | Task 7 (spinner while Firebase resolves) |
| No changes to public routes | No public files modified |
