'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const FRAME_COUNT = 240

export default function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [firstFrameReady, setFirstFrameReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationFrameId: number
    let currentFrame = 0
    let targetFrame = 0
    let velocity = 0

    const images: HTMLImageElement[] = []
    imagesRef.current = images
    let loadedCount = 0

    // Preload all 240 extracted frames of heronew.mp4 for 0-latency scroll scrubbing
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      const frameNum = String(i + 1).padStart(4, '0')
      img.src = `/frames/frame-${frameNum}.jpg`
      img.onload = () => {
        loadedCount++
        if (loadedCount === 1) {
          setFirstFrameReady(true)
          renderFrame(0)
        }
      }
      images[i] = img
    }

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
      renderFrame(currentFrame)
    }

    const getDrawDimensions = (img: HTMLImageElement) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const imgRatio = (img.naturalWidth || 1920) / (img.naturalHeight || 1080)
      const canvasRatio = w / h
      let renderW = w
      let renderH = h
      let offsetX = 0
      let offsetY = 0

      if (canvasRatio > imgRatio) {
        renderH = w / imgRatio
        offsetY = (h - renderH) / 2
      } else {
        renderW = h * imgRatio
        offsetX = (w - renderW) / 2
      }

      return { offsetX, offsetY, renderW, renderH }
    }

    // Sub-frame liquid blending engine (cross-fades consecutive frames for 60/120fps silk)
    const renderFrame = (framePos: number) => {
      const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, framePos))
      const floorIdx = Math.floor(clamped)
      const ceilIdx = Math.min(FRAME_COUNT - 1, floorIdx + 1)
      const fraction = clamped - floorIdx

      const imgA = images[floorIdx]
      const imgB = images[ceilIdx]

      const readyA = imgA && imgA.complete && imgA.naturalWidth > 0
      const readyB = imgB && imgB.complete && imgB.naturalWidth > 0

      if (readyA) {
        const { offsetX, offsetY, renderW, renderH } = getDrawDimensions(imgA)

        // Draw primary frame
        ctx.globalAlpha = 1
        ctx.drawImage(imgA, offsetX, offsetY, renderW, renderH)

        // Sub-frame crossfade blend with next frame for liquid smooth transitions
        if (readyB && fraction > 0.01 && ceilIdx !== floorIdx) {
          ctx.globalAlpha = fraction
          ctx.drawImage(imgB, offsetX, offsetY, renderW, renderH)
          ctx.globalAlpha = 1
        }
      }
    }

    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll))
      targetFrame = progress * (FRAME_COUNT - 1)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resizeCanvas, { passive: true })
    resizeCanvas()
    onScroll()

    // Smooth Kinetic Spring Loop (forward & backward scroll responsive)
    const loop = () => {
      const distance = targetFrame - currentFrame

      // Liquid inertia spring formula (ultra-responsive & silky)
      velocity += distance * 0.12
      velocity *= 0.78
      currentFrame += velocity

      if (Math.abs(velocity) > 0.0001 || Math.abs(distance) > 0.0005) {
        renderFrame(currentFrame)
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          overflow: 'hidden', backgroundColor: '#0c0f17',
          pointerEvents: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        />
      </div>

      {/* ── Soft vignette & top gradient for maximum readability ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 95% 95% at 50% 50%, rgba(12,15,23,0.2) 0%, rgba(12,15,23,0.65) 100%)'
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(to bottom, rgba(12,15,23,0.7) 0%, transparent 100%)'
        }} />
      </div>

      {/* ── Initial curtain ───── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: firstFrameReady ? 0 : 1 }}
        transition={{ duration: 0.6, ease: 'linear' }}
        style={{
          position: 'fixed', inset: 0, zIndex: 2,
          background: '#0c0f17', pointerEvents: 'none',
        }}
      />
    </>
  )
}
