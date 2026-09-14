'use client'

import { useRef, useEffect, useCallback } from 'react'

const FRAME_COUNT = 240

export default function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const stateRef  = useRef({ current: 0, target: 0, velocity: 0, raf: 0, looping: false })

  const renderFrame = useCallback((pos: number, ctx: CanvasRenderingContext2D) => {
    const images  = imagesRef.current
    const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, pos))
    const floor   = Math.floor(clamped)
    const ceil    = Math.min(FRAME_COUNT - 1, floor + 1)
    const frac    = clamped - floor

    const imgA = images[floor]
    const imgB = images[ceil]
    if (!imgA || !imgA.complete || !imgA.naturalWidth) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w   = ctx.canvas.width  / dpr
    const h   = ctx.canvas.height / dpr
    const ar  = imgA.naturalWidth / imgA.naturalHeight
    const cr  = w / h
    const rW  = cr > ar ? w       : h * ar
    const rH  = cr > ar ? w / ar  : h
    const ox  = (w - rW) / 2
    const oy  = (h - rH) / 2

    ctx.globalAlpha = 1
    ctx.drawImage(imgA, ox, oy, rW, rH)

    if (imgB && imgB.complete && imgB.naturalWidth && frac > 0.01 && ceil !== floor) {
      ctx.globalAlpha = frac
      ctx.drawImage(imgB, ox, oy, rW, rH)
      ctx.globalAlpha = 1
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const s = stateRef.current

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width  = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      renderFrame(s.current, ctx)
    }

    const loop = () => {
      const dist = s.target - s.current
      s.velocity += dist * 0.12
      s.velocity *= 0.78
      s.current  += s.velocity
      if (Math.abs(s.velocity) > 0.001 || Math.abs(dist) > 0.001) {
        renderFrame(s.current, ctx)
        s.raf = requestAnimationFrame(loop)
      } else {
        s.looping = false
      }
    }

    const startLoop = () => {
      if (!s.looping) { s.looping = true; s.raf = requestAnimationFrame(loop) }
    }

    const setScroll = (scrollY: number) => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      s.target = (scrollY / maxScroll) * (FRAME_COUNT - 1)
      startLoop()
    }

    // Hook Lenis (preferred) + native scroll fallback
    let lenisUnsub: (() => void) | null = null
    const tryLenis = () => {
      const lenis = (window as any).__lenis
      if (lenis?.on) {
        const h = ({ scroll }: { scroll: number }) => setScroll(scroll)
        lenis.on('scroll', h)
        lenisUnsub = () => lenis.off('scroll', h)
        return true
      }
      return false
    }
    if (!tryLenis()) {
      let n = 0
      const t = setInterval(() => { if (tryLenis() || ++n > 25) clearInterval(t) }, 200)
    }

    window.addEventListener('scroll', () => setScroll(window.scrollY), { passive: true })
    window.addEventListener('resize', resize, { passive: true })
    resize()

    return () => {
      cancelAnimationFrame(s.raf)
      lenisUnsub?.()
    }
  }, [renderFrame])

  // Progressive frame loading
  useEffect(() => {
    const images = imagesRef.current
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext('2d', { alpha: false }) ?? null

    const load = (i: number) => {
      if (images[i]) return
      const img = new Image()
      img.src    = `/frames/frame-${String(i + 1).padStart(4, '0')}.jpg`
      img.onload = () => { images[i] = img }
    }

    const img0 = new Image()
    img0.src    = '/frames/frame-0001.jpg'
    img0.onload = () => {
      images[0] = img0
      if (ctx) renderFrame(0, ctx)

      let next = 1
      const batch = () => {
        const end = Math.min(FRAME_COUNT, next + 20)
        for (let i = next; i < end; i++) load(i)
        next = end
        if (next < FRAME_COUNT) {
          'requestIdleCallback' in window
            ? requestIdleCallback(batch, { timeout: 2000 })
            : setTimeout(batch, 60)
        }
      }
      'requestIdleCallback' in window
        ? requestIdleCallback(batch, { timeout: 800 })
        : setTimeout(batch, 80)
    }
  }, [renderFrame])

  return (
    <>
      {/* Canvas background */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          overflow: 'hidden', backgroundColor: '#0c0f17', pointerEvents: 'none',
        }}
      >
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />
      </div>

      {/* Vignette + top gradient */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 95% 95% at 50% 50%, rgba(12,15,23,0.15) 0%, rgba(12,15,23,0.6) 100%)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(to bottom, rgba(12,15,23,0.65) 0%, transparent 100%)',
        }} />
      </div>
    </>
  )
}
