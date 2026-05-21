# Pagina de Proyectos — Design Spec
**Date:** 2026-05-21

## Overview

Nueva ruta `/proyectos` que reemplaza la seccion `#proyectos` del homepage como destino de navegacion. Pagina full-viewport sin scroll, con video loopeando de fondo y dos estados internos: intro y carousel de proyectos.

---

## Arquitectura

### Ruta
- Archivo: `src/app/proyectos/page.tsx`
- Tipo: Next.js App Router page, client component

### Estado interno
```
type PageState = 'intro' | 'carousel'
type Direction = 1 | -1  // 1 = derecha, -1 = izquierda
```

### Datos de proyectos
Los datos del array `PROJECTS` se mueven de `Projects.tsx` a un archivo compartido `src/lib/projects.ts`. Se agrega campo `color` por proyecto.

```ts
interface Project {
  name: string
  status: string
  statusDot: string
  tagline: string
  description: string
  tags: string[]
  year: string
  href: string
  color: string  // nuevo
}
```

Colores por proyecto:
- Kronitt: `#a78bfa`
- Experience Fly: `#38bdf8`
- GrowAi: `#34d399`
- Bad Bee: `#fbbf24`
- Nexo: `#f472b6`
- Tienda de Astillas: `#fb923c`

---

## Video Background

- Archivo: `/video-proyectos.mov`
- Comportamiento: `autoPlay muted loop playsInline`
- CSS: `position: fixed`, `inset: 0`, `width: 100%`, `height: 100%`, `object-fit: cover`, `z-index: 0`
- Persiste durante toda la pagina (intro y carousel), sin interrupcion en la transicion entre estados

---

## Estado: Intro

### Layout
Full viewport centrado. Contenido en la zona iluminada por la lampara (centro del frame).

```
[label: 02 — Proyectos]
[headline: "Lo que construyo / habla por si solo."]
[subtext: "6 productos reales. En produccion. Sin demos, sin relleno."]
[boton CTA: "Entrar a la galeria →"]
```

### Estilos
- Label: `type-label`, `var(--color-accent)`, `letter-spacing: 0.14em`
- Headline: `var(--font-display)`, `font-weight: 800`, `font-size: clamp(3rem, 7vw, 6rem)`, `color: var(--color-star)`, `line-height: 0.95`, `letter-spacing: -0.03em`
- Subtext: `var(--font-ui)`, `1rem`, `var(--color-muted)`
- CTA button: `border: 1px solid var(--color-accent)`, `color: var(--color-accent)`, `background: transparent`. Hover: `background: var(--color-accent)`, `color: var(--color-on-accent)`

### Transicion a carousel
- Trigger: click en el boton CTA
- Animacion: fade out del bloque intro (opacity 0, 0.5s), luego setear estado a `'carousel'`
- Video no se interrumpe

---

## Estado: Carousel

### Layout
Full viewport. Tres zonas:

```
[contador: 01 / 06]           <- centrado, arriba
[← ]  [bloque de proyecto]  [ →]   <- centrado verticalmente
```

### Contador
- Posicion: `position: absolute`, `top: clamp(6rem, 10vh, 8rem)`, `left: 50%`, `transform: translateX(-50%)`
- Estilo: `var(--font-mono)`, `0.75rem`, `var(--color-faint)`, `letter-spacing: 0.1em`
- Formato: `"01 / 06"`

### Bloque de proyecto (centro)
`max-width: 680px`, centrado horizontal y vertical, `text-align: center`

Orden visual de arriba a abajo:
1. **Status row:** dot + status text + year — `type-label`, `var(--color-faint)`
2. **Nombre:** `var(--font-display)`, `font-weight: 800`, `clamp(3.5rem, 8vw, 7rem)`, color del proyecto, `letter-spacing: -0.03em`, `line-height: 0.95`
3. **Tagline:** `var(--font-ui)`, `1.0625rem`, `var(--color-muted)`, margin-top `0.75rem`
4. **Descripcion:** `var(--font-ui)`, `0.9375rem`, `var(--color-faint)`, `line-height: 1.7`, max 4 lineas, margin-top `1rem`
5. **Tags:** pills con `border: 1px solid <project-color con 30% opacity>`, `color: <project-color>`, `var(--font-mono)`, `0.625rem`, margin-top `1.5rem`
6. **Link:** boton outline `"Ver proyecto ↗"`, `border: 1px solid <project-color>`, `color: <project-color>`, margin-top `2rem`. Hover: fondo con 10% opacity del color del proyecto

### Flechas de navegacion
- Posicion: `position: absolute`, centradas verticalmente (`top: 50%`, `transform: translateY(-50%)`)
- Izquierda: `left: clamp(1.5rem, 4vw, 3rem)`
- Derecha: `right: clamp(1.5rem, 4vw, 3rem)`
- Estilo: `background: none`, `border: 1px solid rgba(255,255,255,0.1)`, `border-radius: 50%`, `width: 48px`, `height: 48px`, icono `←` / `→`
- Color en reposo: `var(--color-faint)`. Hover: `var(--color-star)` + borde `rgba(255,255,255,0.25)`
- Wrap circular: desde el ultimo proyecto avanza al primero y viceversa

### Transicion entre proyectos
- Trigger: click en flecha izquierda o derecha
- Animacion con Framer Motion `AnimatePresence` + `mode="wait"`, `key={currentIndex}`
- Exit: `x: -80 * direction`, `opacity: 0`, duracion `0.35s`
- Enter: `x: 80 * direction` → `x: 0`, `opacity: 0 → 1`, duracion `0.35s`
- Ease: `[0.22, 1, 0.36, 1]` (ease-expo del sitio)
- El color del proyecto cambia junto con el contenido (no por separado)

---

## Navbar — Cambios

### En `src/components/layout/Navbar.tsx`
- Item "Proyectos" cambia de `href: '#proyectos'` a `href: '/proyectos'`
- La funcion `scrollTo` se modifica: detecta `window.location.pathname`. Si no es `/`, hace `router.push('/' + href)` (ejemplo: `/#servicios`) en lugar de intentar hacer scroll al elemento
- El item "Proyectos" usa `router.push('/proyectos')` y cierra el drawer
- Requiere `useRouter` de `next/navigation` en el componente Navbar

### Comportamiento en la pagina `/proyectos`
- El Navbar se renderiza igual
- Los otros items del menu (`#servicios`, `#enfoque`, `#contacto`) detectan que no estan en `/` y navegan a `/#servicios`, `/#enfoque`, `/#contacto`
- El item "Proyectos" en el menu, si ya estamos en `/proyectos`, solo cierra el drawer sin navegar
- El scroll del browser en `/proyectos` esta bloqueado (`overflow: hidden` en el elemento raiz de la pagina)

---

## Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `src/lib/projects.ts` | Crear — datos compartidos de proyectos con campo `color` |
| `src/app/proyectos/page.tsx` | Crear — pagina nueva |
| `src/components/layout/Navbar.tsx` | Modificar — item Proyectos navega a `/proyectos` |
| `src/components/sections/Projects.tsx` | Modificar — importar datos desde `src/lib/projects.ts` |

---

## Consideraciones tecnicas

- El video `.mov` puede no reproducirse en algunos navegadores (Safari lo soporta bien, Chrome tambien para MJPEG). Si hay problemas de compatibilidad, considerar agregar un fallback WebM.
- `playsInline` es necesario en iOS para evitar que el video abra en pantalla completa.
- El componente de la pagina es `'use client'` por el estado y las animaciones.
- Lenis scroll no es necesario en esta pagina (no hay scroll). No montar `LenisProvider` en el layout de `/proyectos` o asegurarse de que no interfiera.
- `overflow: hidden` en el body/html de esta pagina para evitar scroll accidental.
