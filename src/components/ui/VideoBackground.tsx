'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useIntro } from '@/context/IntroContext'

const FRAME_COUNT = 240

export default function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const frameStateRef = useRef({ current: 0, target: 0, velocity: 0, raf: 0, looping: false })
  const { phase, setPhase } = useIntro()

  // ─── hero1 intro playback ───────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video || phase !== 'INTRO_PLAYING') return

    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      setPhase('INTRO_ENDED')
    }

    // Make sure all mute attributes are set (browser policy)
    video.muted = true
    video.volume = 0
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')

    video.addEventListener('ended', done, { once: true })
    // Safety net: if the video somehow stalls >30s, proceed anyway
    const safety = setTimeout(done, 30_000)

    const tryPlay = () => {
      video
        .play()
        .then(() => {
          // Playing fine — wait for 'ended' event
        })
        .catch(() => {
          // Autoplay blocked: show static poster and move on after 1 frame so
          // the user at least sees the poster before content appears.
          requestAnimationFrame(done)
        })
    }

    if (video.readyState >= 2) {
      tryPlay()
    } else {
      video.load()
      video.addEventListener('canplay', tryPlay, { once: true })
    }

    return () => {
      clearTimeout(safety)
      video.removeEventListener('ended', done)
      video.removeEventListener('canplay', tryPlay)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ─── hero2 canvas frame scrubber ────────────────────────────────────────────
  const renderFrame = useCallback((framePos: number, ctx: CanvasRenderingContext2D) => {
    const images = imagesRef.current
    const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, framePos))
    const floorIdx = Math.floor(clamped)
    const ceilIdx = Math.min(FRAME_COUNT - 1, floorIdx + 1)
    const fraction = clamped - floorIdx

    const imgA = images[floorIdx]
    const imgB = images[ceilIdx]

    if (imgA && imgA.complete && imgA.naturalWidth > 0) {
      const w = ctx.canvas.width / (window.devicePixelRatio || 1)
      const h = ctx.canvas.height / (window.devicePixelRatio || 1)
      const ratio = imgA.naturalWidth / imgA.naturalHeight
      const cr = w / h
      const rW = cr > ratio ? w : h * ratio
      const rH = cr > ratio ? w / ratio : h
      const ox = (w - rW) / 2
      const oy = (h - rH) / 2

      ctx.globalAlpha = 1
      ctx.drawImage(imgA, ox, oy, rW, rH)

      if (imgB && imgB.complete && imgB.naturalWidth > 0 && fraction > 0.01 && ceilIdx !== floorIdx) {
        ctx.globalAlpha = fraction
        ctx.drawImage(imgB, ox, oy, rW, rH)
        ctx.globalAlpha = 1
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const state = frameStateRef.current
    const images = imagesRef.current

    // Resize canvas to fill viewport at device pixel ratio
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
      renderFrame(state.current, ctx)
    }

    // Animation loop with spring easing
    const loop = () => {
      const dist = state.target - state.current
      state.velocity += dist * 0.12
      state.velocity *= 0.78
      state.current += state.velocity

      if (Math.abs(state.velocity) > 0.001 || Math.abs(dist) > 0.001) {
        renderFrame(state.current, ctx)
        state.raf = requestAnimationFrame(loop)
      } else {
        state.looping = false
      }
    }

    const startLoop = () => {
      if (!state.looping) {
        state.looping = true
        state.raf = requestAnimationFrame(loop)
      }
    }

    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll))
      state.target = progress * (FRAME_COUNT - 1)
      startLoop()
    }

    // Progressive image loading — load first frame immediately, rest in idle batches
    const loadFrames = () => {
      const loadOne = (i: number) => {
        if (images[i]) return
        const img = new Image()
        const num = String(i + 1).padStart(4, '0')
        img.src = `/frames/frame-${num}.jpg`
        img.onload = () => { images[i] = img }
        img.onerror = () => { images[i] = images[0] ?? null }
      }

      // Frame 0 first
      const img0 = new Image()
      img0.src = '/frames/frame-0001.jpg'
      img0.onload = () => {
        images[0] = img0
        renderFrame(0, ctx)

        let next = 1
        const batch = () => {
          const end = Math.min(FRAME_COUNT, next + 20)
          for (let i = next; i < end; i++) loadOne(i)
          next = end
          if (next < FRAME_COUNT) {
            if ('requestIdleCallback' in window) {
              requestIdleCallback(batch, { timeout: 2000 })
            } else {
              setTimeout(batch, 60)
            }
          }
        }

        if ('requestIdleCallback' in window) {
          requestIdleCallback(batch, { timeout: 800 })
        } else {
          setTimeout(batch, 80)
        }
      }
    }

    resize()
    loadFrames()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize, { passive: true })

    return () => {
      cancelAnimationFrame(state.raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
    }
  }, [renderFrame])

  // ─── Derived visibility ─────────────────────────────────────────────────────
  const introVisible = phase === 'INTRO_PLAYING' || phase === 'INTRO_ENDED'

  return (
    <>
      {/* ── hero2 canvas background (always rendered, z:0) ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: '#0c0f17',
          pointerEvents: 'none',
        }}
      >
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />
      </div>

      {/* ── hero1 fullscreen intro overlay ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: phase === 'INTRO_PLAYING' ? 99999 : 2,
          opacity: introVisible ? 1 : 0,
          pointerEvents: introVisible ? 'auto' : 'none',
          transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          backgroundColor: '#0c0f17',
        }}
      >
        <video
          ref={videoRef}
          src="/hero1.mp4"
          poster="/frames/frame-0001.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* ── Vignette + top gradient overlay ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 95% 95% at 50% 50%, rgba(12,15,23,0.18) 0%, rgba(12,15,23,0.62) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 160,
            background: 'linear-gradient(to bottom, rgba(12,15,23,0.65) 0%, transparent 100%)',
          }}
        />
      </div>
    </>
  )
}
