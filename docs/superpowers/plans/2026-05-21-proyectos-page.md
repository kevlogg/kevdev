# Pagina de Proyectos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear la ruta `/proyectos` como pagina dedicada full-viewport con video loopeable de fondo, estado intro con hook text y estado carousel con navegacion por flechas, reemplazando la seccion `#proyectos` del homepage como destino de navegacion.

**Architecture:** Pagina Next.js App Router (`src/app/proyectos/page.tsx`) con estado interno `'intro' | 'carousel'` manejado con `useState`. Framer Motion `AnimatePresence` controla las transiciones entre estados y entre proyectos del carousel. El video `video-proyectos.mov` loopea como fondo fijo durante toda la experiencia.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Framer Motion, CSS custom properties del design system existente.

---

### Task 1: Crear archivo de datos compartidos

**Files:**
- Create: `src/lib/projects.ts`

- [ ] **Step 1: Crear el archivo con la interfaz y el array de proyectos**

```ts
// src/lib/projects.ts

export interface Project {
  name: string
  status: string
  statusDot: string
  tagline: string
  description: string
  tags: string[]
  year: string
  href: string
  color: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Kronitt',
    status: 'Listo para validar',
    statusDot: 'var(--color-accent)',
    tagline: 'Sistema de turnos y gestión para el sector estética.',
    description:
      'Reservas online, panel administrativo y automatizaciones de recordatorios. Pensado para barberías, peluquerías y centros de estética que quieren profesionalizar su operación y crecer.',
    tags: ['Web app', 'SaaS', 'Firebase', 'React'],
    year: '2025',
    href: 'https://kronitt.com.ar',
    color: '#a78bfa',
  },
  {
    name: 'Experience Fly',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'Landing inmersiva para una aerolínea de experiencias premium.',
    description:
      'Cockpit 3D interactivo con scroll, planificador de vuelos, sección de destinos y asistente IA integrado. Proyecto de diseño y desarrollo frontend de alto impacto visual.',
    tags: ['Next.js', 'Three.js', 'Framer Motion', 'IA'],
    year: '2025',
    href: 'https://experience-fly.vercel.app/',
    color: '#38bdf8',
  },
  {
    name: 'GrowAi',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'App de seguimiento de cultivo, diagnóstico y comunidad de nicho.',
    description:
      'Seguimiento de ciclos, registro de acciones, diagnóstico asistido por imágenes y comunidad integrada. Producto de nicho con visión de utilidad real y retención por engagement.',
    tags: ['Mobile web', 'Firebase', 'IA', 'Comunidad'],
    year: '2025',
    href: 'https://growai.com.ar',
    color: '#34d399',
  },
  {
    name: 'Bad Bee',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'Landing para una marca de miel artesanal.',
    description:
      'Sitio de presentación para Bad Bee, marca de miel con identidad visual fuerte. Diseño limpio, orientado a conversión y con foco en transmitir autenticidad del producto.',
    tags: ['Next.js', 'Landing', 'Branding'],
    year: '2025',
    href: 'https://v0-bad-bee-landing-page-ng5w.vercel.app/',
    color: '#fbbf24',
  },
  {
    name: 'Nexo',
    status: 'En construcción',
    statusDot: 'rgba(221,232,255,0.25)',
    tagline: 'App para parejas con sincronización en tiempo real.',
    description:
      'Estado emocional, mensajes, necesidades y gestos de amor sincronizados al instante. Construida con Firebase Realtime y notificaciones push para mantener la conexión activa entre dos personas.',
    tags: ['React', 'Firebase', 'Tiempo real', 'Mobile web'],
    year: '2025',
    href: 'https://nexo-seven-nu.vercel.app/',
    color: '#f472b6',
  },
  {
    name: 'Tienda de Astillas',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'E-commerce de productos artesanales en madera.',
    description:
      'Tienda online para una marca de productos de madera trabajada a mano. Catálogo de productos, carrito de compras y flujo de pago integrado. Identidad visual cálida y artesanal que transmite el valor del trabajo manual.',
    tags: ['Next.js', 'E-commerce', 'Landing', 'Branding'],
    year: '2025',
    href: 'https://tiendadeastillas.com.ar',
    color: '#fb923c',
  },
]
```

- [ ] **Step 2: Verificar que TypeScript no reporta errores**

```bash
cd C:\development\kevdev && npx tsc --noEmit
```

Expected: sin errores (o solo errores preexistentes no relacionados).

- [ ] **Step 3: Commit**

```bash
git add src/lib/projects.ts
git commit -m "feat: add shared projects data with per-project color"
```

---

### Task 2: Actualizar Projects.tsx para usar datos compartidos

**Files:**
- Modify: `src/components/sections/Projects.tsx`

El objetivo es que `Projects.tsx` no duplique datos — importa el array desde `src/lib/projects.ts` y elimina la definicion local.

- [ ] **Step 1: Reemplazar el contenido de Projects.tsx**

Reemplazar el bloque `const PROJECTS = [...]` y la interfaz inline con la importacion del modulo compartido. El archivo queda asi:

```tsx
// src/components/sections/Projects.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
```

- [ ] **Step 2: Verificar que el homepage sigue funcionando**

```bash
npm run dev
```

Navegar a `http://localhost:3000` y confirmar que la seccion de proyectos se muestra igual que antes.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Projects.tsx
git commit -m "refactor: Projects.tsx imports data from src/lib/projects"
```

---

### Task 3: Modificar Navbar para navegacion cross-page

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

El Navbar necesita: (a) que "Proyectos" navegue a `/proyectos` via router, (b) que los demas items detecten si estan en una ruta distinta a `/` y usen `router.push` con el anchor en lugar de intentar scroll DOM.

- [ ] **Step 1: Agregar imports de Next.js navigation al inicio del archivo**

Despues de la linea `'use client'`, agregar:

```tsx
import { useRouter, usePathname } from 'next/navigation'
```

- [ ] **Step 2: Cambiar el href de Proyectos en NAV_ITEMS**

Reemplazar:
```tsx
{ href: '#proyectos', label: 'Proyectos', index: '02' },
```
Con:
```tsx
{ href: '/proyectos', label: 'Proyectos', index: '02' },
```

- [ ] **Step 3: Agregar hooks de router y pathname al componente Navbar**

Dentro de `export default function Navbar()`, luego de los `useState` existentes, agregar:

```tsx
const router   = useRouter()
const pathname = usePathname()
```

- [ ] **Step 4: Reemplazar la funcion scrollTo por handleNav**

Eliminar la funcion `scrollTo` que esta fuera del componente (lineas 30-41 del archivo original) y agregar dentro del componente, despues de los hooks, la nueva funcion:

```tsx
const handleNav = useCallback((href: string, cb?: () => void) => {
  cb?.()
  if (href.startsWith('/')) {
    // Ruta de pagina (ej: /proyectos)
    if (pathname !== href) router.push(href)
    return
  }
  // Anchor (ej: #servicios)
  if (pathname !== '/') {
    // Estamos en otra pagina: navegar al homepage con el anchor
    router.push('/' + href)
    return
  }
  // Misma pagina: scroll suave
  const el = document.querySelector(href)
  if (!el) return
  const lenis = (window as any).__lenis
  if (lenis) {
    lenis.start()
    lenis.scrollTo(el, { offset: -80 })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}, [pathname, router])
```

- [ ] **Step 5: Actualizar todas las llamadas de scrollTo a handleNav**

En el JSX del Navbar, reemplazar TODAS las ocurrencias de:
```tsx
onClick={() => scrollTo(item.href, close)}
```
Con:
```tsx
onClick={() => handleNav(item.href, close)}
```

(Solo hay una ocurrencia en el `motion.button` dentro del `NAV_ITEMS.map`)

- [ ] **Step 6: Verificar que el wordmark del Navbar sigue funcionando en /proyectos**

El wordmark tiene `onClick` que llama `(window as any).__lenis?.scrollTo(0)`. En `/proyectos` no hay Lenis montado, por lo que eso es inofensivo. Verificar que no rompe nada.

- [ ] **Step 7: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin nuevos errores.

- [ ] **Step 8: Verificar en browser**

Con `npm run dev` activo:
1. En el homepage, abrir el menu y click en "Proyectos" — debe navegar a `/proyectos`
2. En `/proyectos`, abrir el menu y click en "Servicios" — debe navegar a `/#servicios`
3. En el homepage, los otros items deben seguir haciendo scroll normal

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: Navbar navigates to /proyectos and handles cross-page anchors"
```

---

### Task 4: Crear la pagina /proyectos con video de fondo y estructura base

**Files:**
- Create: `src/app/proyectos/page.tsx`

Esta tarea crea el shell de la pagina: el video loopeable de fondo, el overlay de oscuridad, y el contenedor de contenido. Los estados intro/carousel se agregan en las tareas siguientes.

- [ ] **Step 1: Crear el directorio y el archivo**

```bash
mkdir src\app\proyectos
```

- [ ] **Step 2: Escribir el archivo con el shell basico**

```tsx
// src/app/proyectos/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import { PROJECTS, type Project } from '@/lib/projects'

type PageState = 'intro' | 'carousel'

export default function ProyectosPage() {
  const [pageState, setPageState]       = useState<PageState>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection]       = useState<1 | -1>(1)

  const enterCarousel = useCallback(() => setPageState('carousel'), [])

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir)
    setCurrentIndex(prev => (prev + dir + PROJECTS.length) % PROJECTS.length)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Ambient overlays */}
      <div className="grain"    aria-hidden />
      <div className="vignette" aria-hidden />

      {/* Video loopeable de fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/video-proyectos.mov" type="video/quicktime" />
        <source src="/video-proyectos.mov" type="video/mp4" />
      </video>

      {/* Overlay de oscuridad para legibilidad */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6,8,16,0.55)',
          zIndex: 1,
        }}
      />

      {/* Contenido */}
      <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
        <Navbar />

        <AnimatePresence mode="wait">
          {pageState === 'intro' ? (
            <IntroState key="intro" onEnter={enterCarousel} />
          ) : (
            <CarouselState
              key="carousel"
              currentIndex={currentIndex}
              direction={direction}
              onNavigate={navigate}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Placeholders temporales para verificar que compila ─── */
function IntroState({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onEnter} style={{ color: 'white' }}>Entrar</button>
    </div>
  )
}

function CarouselState({ currentIndex, direction, onNavigate }: {
  currentIndex: number
  direction: 1 | -1
  onNavigate: (dir: 1 | -1) => void
}) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Proyecto {currentIndex + 1}
      <button onClick={() => onNavigate(-1)}>←</button>
      <button onClick={() => onNavigate(1)}>→</button>
    </div>
  )
}
```

- [ ] **Step 3: Verificar que la pagina carga sin errores**

```bash
npm run dev
```

Navegar a `http://localhost:3000/proyectos`. Debe verse el video de fondo, el overlay oscuro, y los placeholders de IntroState y CarouselState.

- [ ] **Step 4: Commit**

```bash
git add src/app/proyectos/page.tsx
git commit -m "feat: add /proyectos page shell with looping video background"
```

---

### Task 5: Implementar el estado Intro

**Files:**
- Modify: `src/app/proyectos/page.tsx`

Reemplazar la funcion `IntroState` placeholder con la implementacion completa: label, headline, subtext y boton CTA con animaciones staggered.

- [ ] **Step 1: Agregar `motion` al import de framer-motion**

La linea existente:
```tsx
import { AnimatePresence } from 'framer-motion'
```
Cambiarla por:
```tsx
import { AnimatePresence, motion } from 'framer-motion'
```

- [ ] **Step 2: Reemplazar la funcion IntroState placeholder**

```tsx
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

function IntroState({ onEnter }: { onEnter: () => void }) {
  const [hov, setHov] = useState(false)

  return (
    <motion.div
      key="intro-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: EASE_OUT } }}
      transition={{ duration: 0.4 }}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--gutter)',
        gap: '1.25rem',
      }}
    >
      <motion.span
        className="type-label"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT }}
        style={{ color: 'var(--color-accent)' }}
      >
        02 — Proyectos
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(3rem, 7vw, 6rem)',
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          color: 'var(--color-star)',
          margin: 0,
        }}
      >
        Lo que construyo<br />habla por si solo.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT }}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '1rem',
          color: 'var(--color-muted)',
          maxWidth: 420,
          margin: 0,
        }}
      >
        6 productos reales. En produccion. Sin demos, sin relleno.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.65, ease: EASE_OUT }}
        onClick={onEnter}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          marginTop: '0.5rem',
          padding: '0.75rem 2rem',
          border: '1px solid var(--color-accent)',
          borderRadius: 99,
          background: hov ? 'var(--color-accent)' : 'transparent',
          color: hov ? 'var(--color-on-accent)' : 'var(--color-accent)',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          cursor: 'pointer',
          transition: 'background 0.25s, color 0.25s',
        }}
      >
        Entrar a la galeria →
      </motion.button>
    </motion.div>
  )
}
```

Nota: `useState` ya esta importado en el archivo desde el Task 4.

- [ ] **Step 3: Verificar en browser**

Navegar a `http://localhost:3000/proyectos`. Verificar:
- Las animaciones staggered del intro se ejecutan al cargar
- El boton cambia de color en hover
- Click en el boton transiciona al estado carousel (placeholder por ahora)

- [ ] **Step 4: Commit**

```bash
git add src/app/proyectos/page.tsx
git commit -m "feat: add intro state with staggered animations to /proyectos"
```

---

### Task 6: Implementar el carousel completo

**Files:**
- Modify: `src/app/proyectos/page.tsx`

Reemplazar los placeholders de `CarouselState`, `ProjectCard` y `ArrowButton` con la implementacion completa.

- [ ] **Step 1: Reemplazar la funcion CarouselState placeholder**

```tsx
function CarouselState({ currentIndex, direction, onNavigate }: {
  currentIndex: number
  direction: 1 | -1
  onNavigate: (dir: 1 | -1) => void
}) {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Contador */}
      <div style={{
        position: 'absolute',
        top: 'clamp(5.5rem, 10vh, 7rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--color-faint)',
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>
        {String(currentIndex + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
      </div>

      {/* Flecha izquierda */}
      <ArrowButton direction="left" onClick={() => onNavigate(-1)} />

      {/* Tarjeta del proyecto con transicion */}
      <AnimatePresence mode="wait" custom={direction}>
        <ProjectCard
          key={currentIndex}
          project={PROJECTS[currentIndex]}
          direction={direction}
        />
      </AnimatePresence>

      {/* Flecha derecha */}
      <ArrowButton direction="right" onClick={() => onNavigate(1)} />
    </div>
  )
}
```

- [ ] **Step 2: Agregar la funcion ProjectCard**

```tsx
const cardVariants = {
  enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  },
  exit: (dir: number) => ({
    x: dir * -80,
    opacity: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  }),
}

function ProjectCard({ project, direction }: { project: Project; direction: 1 | -1 }) {
  const [hov, setHov] = useState(false)
  // Color con 30% de opacidad para los bordes de las tags (hex + '4D')
  const colorAlpha = project.color + '4D'

  return (
    <motion.div
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{
        maxWidth: 680,
        width: '100%',
        textAlign: 'center',
        paddingInline: 'var(--gutter)',
      }}
    >
      {/* Status + año */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.25rem',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: project.statusDot, flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.6875rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-faint)',
        }}>
          {project.status}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
          color: 'var(--color-faint)', marginLeft: '0.5rem',
        }}>
          {project.year}
        </span>
      </div>

      {/* Nombre */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(3.5rem, 8vw, 7rem)',
        lineHeight: 0.95,
        letterSpacing: '-0.03em',
        color: project.color,
        margin: '0 0 0.75rem',
      }}>
        {project.name}
      </h2>

      {/* Tagline */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '1.0625rem',
        color: 'var(--color-muted)',
        margin: '0 0 1rem',
        lineHeight: 1.5,
      }}>
        {project.tagline}
      </p>

      {/* Descripcion */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.9375rem',
        color: 'var(--color-faint)',
        lineHeight: 1.7,
        margin: '0 auto 1.5rem',
        maxWidth: 560,
      }}>
        {project.description}
      </p>

      {/* Tags */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        gap: '0.375rem', justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        {project.tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            letterSpacing: '0.07em',
            color: project.color,
            border: `1px solid ${colorAlpha}`,
            borderRadius: 99,
            padding: '3px 10px',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Link */}
      {project.href && (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = project.color + '1A'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
          }}
          style={{
            display: 'inline-block',
            padding: '0.625rem 1.5rem',
            border: `1px solid ${project.color}`,
            borderRadius: 99,
            color: project.color,
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.04em',
            background: 'transparent',
            transition: 'background 0.25s',
          }}
        >
          Ver proyecto ↗
        </a>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 3: Agregar la funcion ArrowButton**

```tsx
function ArrowButton({ direction, onClick }: {
  direction: 'left' | 'right'
  onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  const side = direction === 'left' ? 'left' : 'right'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={direction === 'left' ? 'Proyecto anterior' : 'Proyecto siguiente'}
      style={{
        position: 'absolute',
        [side]: 'clamp(1.5rem, 4vw, 3rem)',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
        background: 'none',
        color: hov ? 'var(--color-star)' : 'var(--color-faint)',
        fontSize: '1.125rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.25s, color 0.25s',
        flexShrink: 0,
      }}
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  )
}
```

- [ ] **Step 4: Verificar en browser**

En `http://localhost:3000/proyectos`:
1. Click en "Entrar a la galeria" — debe aparecer el primer proyecto (Kronitt) con nombre en violeta
2. Click en flecha derecha — debe aparecer Experience Fly con nombre en celeste, con animacion slide
3. Click en flecha izquierda — regresa a Kronitt con animacion slide en direccion opuesta
4. Navegar hasta el ultimo proyecto y hacer click en → — debe volver al primero (wrap circular)
5. Los tags de cada proyecto deben tener el color del proyecto
6. El link "Ver proyecto ↗" debe tener el color del proyecto
7. El contador muestra "01 / 06", "02 / 06", etc.

- [ ] **Step 5: Commit**

```bash
git add src/app/proyectos/page.tsx
git commit -m "feat: add full carousel with per-project colors and directional transitions"
```

---

### Task 7: Verificacion final e integracion completa

**Files:**
- No new files

Verificacion exhaustiva de todos los flujos antes del merge.

- [ ] **Step 1: Verificar TypeScript sin errores**

```bash
cd C:\development\kevdev && npx tsc --noEmit
```

Expected: exit code 0 o solo errores preexistentes.

- [ ] **Step 2: Verificar build de produccion**

```bash
npm run build
```

Expected: build exitoso sin errores de compilacion.

- [ ] **Step 3: Checklist de flujos en browser**

Con `npm run dev`:

**Homepage (`/`):**
- [ ] La seccion de proyectos sigue mostrando los 6 proyectos en grid
- [ ] Abrir el menu → click "Proyectos" → navega a `/proyectos`
- [ ] Abrir el menu → click "Servicios" → hace scroll a `#servicios` en el homepage

**Pagina de proyectos (`/proyectos`):**
- [ ] El video loopea de fondo sin interrupciones
- [ ] El estado intro se muestra con animaciones al cargar
- [ ] El overlay de oscuridad hace el texto legible
- [ ] Click en "Entrar a la galeria" → transicion suave al carousel
- [ ] Abrir el menu desde `/proyectos` → click "Servicios" → navega a `/#servicios`
- [ ] Abrir el menu desde `/proyectos` → click "Proyectos" → el drawer se cierra sin navegar (ya estamos en la pagina)
- [ ] Cada uno de los 6 proyectos muestra su color individual en nombre, tags y boton
- [ ] Las transiciones slide cambian de direccion segun la flecha presionada
- [ ] El wrap circular funciona en ambos extremos
- [ ] El link "Ver proyecto ↗" abre en nueva pestana

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "feat: /proyectos page - fullscreen carousel with video and per-project branding"
```
