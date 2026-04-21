'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Options {
  strength?:   number  // px de movimiento máximo (default 20)
  lerpFactor?: number  // velocidad de lerp 0-1 (default 0.06)
  invert?:     boolean // invierte dirección (default false)
}

export function useMouseParallax({ strength = 20, lerpFactor = 0.06, invert = false }: Options = {}) {
  const ref    = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const current = useRef({ x: 0, y: 0 })
  const target  = useRef({ x: 0, y: 0 })

  const onMouseMove = useCallback((e: MouseEvent) => {
    const cx = e.clientX / window.innerWidth  - 0.5
    const cy = e.clientY / window.innerHeight - 0.5
    const dir = invert ? -1 : 1
    target.current = { x: cx * strength * dir, y: cy * strength * dir }
  }, [strength, invert])

  useEffect(() => {
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * lerpFactor
      current.current.y += (target.current.y - current.current.y) * lerpFactor
      if (ref.current) {
        ref.current.style.transform =
          `translate3d(${current.current.x.toFixed(3)}px,${current.current.y.toFixed(3)}px,0)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [onMouseMove, lerpFactor])

  return ref
}
