'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const FRAME_COUNT = 240

export default function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const loadedCount = useRef(0)
  const [firstFrameReady, setFirstFrameReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationFrameId: number
    let currentFrame = 0
    let targetFrame = 0

    const images: HTMLImageElement[] = []
    imagesRef.current = images
    let firstDrawn = false

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
      renderCurrentFrame()
    }

    const drawFrame = (img: HTMLImageElement) => {
      if (!img || !img.complete || img.naturalWidth === 0) return
      const w = window.innerWidth
      const h = window.innerHeight
      const imgRatio = img.naturalWidth / img.naturalHeight
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

      ctx.drawImage(img, offsetX, offsetY, renderW, renderH)
    }

    let lastDrawnIdx = -1

    const renderCurrentFrame = () => {
      let idx = Math.round(currentFrame)
      idx = Math.max(0, Math.min(FRAME_COUNT - 1, idx))
      
      if (idx === lastDrawnIdx) return
      lastDrawnIdx = idx

      let drawIdx = idx
      while (drawIdx > 0 && (!images[drawIdx] || !images[drawIdx].complete)) {
        drawIdx--
      }
      if (images[drawIdx] && images[drawIdx].complete) {
        drawFrame(images[drawIdx])
      }
    }

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      const frameNum = String(i + 1).padStart(4, '0')
      img.src = `/frames/frame-${frameNum}.jpg`
      img.onload = () => {
        loadedCount.current++
        if (!firstDrawn) {
          firstDrawn = true
          setFirstFrameReady(true)
          drawFrame(img)
        }
      }
      images[i] = img
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

    // Smooth & responsive exponential decay LERP (0.085 = silky momentum without braking lag)
    const loop = () => {
      const distance = targetFrame - currentFrame
      if (Math.abs(distance) > 0.0005) {
        currentFrame += distance * 0.085
        renderCurrentFrame()
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
      {/* ── 2D Canvas for Ultra-Soft Floating Frame Scrubbing ──────────────── */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          overflow: 'hidden', backgroundColor: '#121212',
          pointerEvents: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        />
      </div>

      {/* ── Soft vignette & top gradient for maximum readability without masking video ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ position:'absolute', inset: 0,
          background:'radial-gradient(ellipse 95% 95% at 50% 50%, rgba(18,18,18,0.15) 0%, rgba(18,18,18,0.55) 100%)' }} />
        <div style={{ position:'absolute', top: 0, left: 0, right: 0, height: 140,
          background:'linear-gradient(to bottom, rgba(18,18,18,0.6) 0%, transparent 100%)' }} />
      </div>

      {/* ── Initial curtain that fades out once first frame is ready ───── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: firstFrameReady ? 0 : 1 }}
        transition={{ duration: 0.6, ease: 'linear' }}
        style={{
          position:'fixed', inset:0, zIndex:2,
          background:'#121212', pointerEvents:'none',
        }}
      />
    </>
  )
}
