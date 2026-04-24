'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const FRAME_COUNT = 300

/* ─── WebGL shaders ──────────────────────────────────────────────────── */
const VERT_SRC = `
  attribute vec2 a_position;
  attribute vec2 a_uv;
  varying   vec2 vUv;
  void main() {
    vUv = a_uv;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

/* Effect 2 — zoom lens distortion (akella/webgl-mouseover-effects)
   + colour grade baked in (saturate 0.55 · brightness 0.72)          */
const FRAG_SRC = `
  precision highp float;

  uniform sampler2D tDiffuse;
  uniform vec2      uMouse;       /* normalised 0-1, Y flipped          */
  uniform float     uVelo;        /* capped speed (0-0.05)              */
  uniform vec2      uResolution;  /* viewport in px                     */

  varying vec2 vUv;

  float circle(vec2 uv, vec2 center, float radius, float border) {
    uv -= center;
    uv *= uResolution;
    float d = sqrt(dot(uv, uv));
    return smoothstep(radius + border, radius - border, d);
  }

  void main() {
    float c       = circle(vUv, uMouse, 0.0, 0.1 + uVelo * 2.0) * 40.0 * uVelo;
    vec2  warpUV  = mix(vUv, uMouse, c * 0.99);

    vec4 col = texture2D(tDiffuse, warpUV)
             + texture2D(tDiffuse, warpUV) * vec4(vec3(c), 1.0);

    /* desaturate */
    float luma  = dot(col.rgb, vec3(0.299, 0.587, 0.114));
    col.rgb     = mix(vec3(luma), col.rgb, 0.55);
    /* darken    */
    col.rgb    *= 0.72;

    gl_FragColor = col;
  }
`

/* ─── helpers ────────────────────────────────────────────────────────── */
function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error('[VideoBackground shader]', gl.getShaderInfoLog(s))
  return s
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string) {
  const p = gl.createProgram()!
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER,   vert))
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, frag))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    console.error('[VideoBackground program]', gl.getProgramInfoLog(p))
  return p
}

/* ─── component ──────────────────────────────────────────────────────── */
export default function VideoBackground() {
  const glCanvasRef   = useRef<HTMLCanvasElement>(null)
  const images        = useRef<HTMLImageElement[]>([])
  const loadedCount   = useRef(0)
  const rafRef        = useRef<number>(0)
  const [firstFrameReady, setFirstFrameReady] = useState(false)

  useEffect(() => {
    const glCanvas = glCanvasRef.current
    if (!glCanvas) return

    /* ── WebGL context ──────────────────────────────────────────────── */
    const gl = glCanvas.getContext('webgl', {
      alpha: false, antialias: false, depth: false, stencil: false,
    })
    if (!gl) { console.error('WebGL not supported'); return }

    /* ── Fullscreen quad geometry ───────────────────────────────────── */
    //  two triangles covering NDC [-1,1] × [-1,1]
    const posData = new Float32Array([-1,-1, 1,-1, -1,1,  -1,1, 1,-1, 1,1])
    const uvData  = new Float32Array([ 0, 0, 1, 0,  0,1,   0,1, 1, 0, 1,1])

    const posBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, posData, gl.STATIC_DRAW)

    const uvBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
    gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW)

    /* ── Shader program ─────────────────────────────────────────────── */
    const prog = createProgram(gl, VERT_SRC, FRAG_SRC)
    gl.useProgram(prog)

    const aPos  = gl.getAttribLocation(prog,  'a_position')
    const aUV   = gl.getAttribLocation(prog,  'a_uv')
    const uTex  = gl.getUniformLocation(prog, 'tDiffuse')
    const uMou  = gl.getUniformLocation(prog, 'uMouse')
    const uVel  = gl.getUniformLocation(prog, 'uVelo')
    const uRes  = gl.getUniformLocation(prog, 'uResolution')

    /* ── 2-D offscreen canvas for JPEG frame decoding ───────────────── */
    const offscreen = document.createElement('canvas')
    const offCtx    = offscreen.getContext('2d', { alpha: false })!

    /* ── WebGL texture (fed from offscreen canvas) ──────────────────── */
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    /* ── Resize ─────────────────────────────────────────────────────── */
    let dpr = 1
    const resize = () => {
      dpr              = Math.min(window.devicePixelRatio || 1, 2)
      const w          = window.innerWidth
      const h          = window.innerHeight
      glCanvas.width   = w * dpr
      glCanvas.height  = h * dpr
      glCanvas.style.width  = w + 'px'
      glCanvas.style.height = h + 'px'
      gl.viewport(0, 0, glCanvas.width, glCanvas.height)
      // KEY: resolution is the aspect-ratio correction vector, not pixels
      // matches original akella: vec2(1.0, height/width)
      gl.uniform2f(uRes, 1.0, h / w)

      offscreen.width  = w
      offscreen.height = h
      // reset transform after canvas resize
      offCtx.setTransform(1, 0, 0, 1, 0, 0)
    }
    gl.useProgram(prog)
    resize()
    window.addEventListener('resize', resize, { passive: true })

    /* ── Mouse tracking + velocity ──────────────────────────────────── */
    let mx = 0.5, my = 0.5
    let prevX = 0.5, prevY = 0.5
    let targetVelo = 0

    const onMouse = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth
      my = 1 - e.clientY / window.innerHeight  // flip Y for WebGL
      const dx  = mx - prevX
      const dy  = my - prevY
      targetVelo = Math.min(Math.sqrt(dx * dx + dy * dy) * 5, 0.05)
      prevX = mx; prevY = my
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    /* ── Frame draw helper (object-fit: cover) ──────────────────────── */
    // Flip Y so canvas (Y=0 top) maps correctly to WebGL texture (V=0 bottom)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    const drawFrame = (img: HTMLImageElement) => {
      const cw = window.innerWidth
      const ch = window.innerHeight
      const ir = img.naturalWidth / img.naturalHeight
      const cr = cw / ch
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
      if (cr > ir) { sh = img.naturalWidth / cr;  sy = (img.naturalHeight - sh) / 2 }
      else          { sw = img.naturalHeight * cr; sx = (img.naturalWidth  - sw) / 2 }
      offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
      // upload to GPU (UNPACK_FLIP_Y_WEBGL corrects canvas→texture orientation)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, offscreen)
    }

    /* ── Preload frames ─────────────────────────────────────────────── */
    let firstDrawn = false
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img  = new Image()
      img.src    = `/frames/frame-${String(i + 1).padStart(4, '0')}.jpg`
      img.onload = () => {
        loadedCount.current++
        if (!firstDrawn) {
          firstDrawn = true
          drawFrame(img)
          setFirstFrameReady(true)
        }
      }
      images.current[i] = img
    }

    /* ── RAF render loop ────────────────────────────────────────────── */
    let lastIndex  = -1
    let currentVelo = 0

    const tick = () => {
      /* scroll → frame */
      if (loadedCount.current > 0) {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        const progress  = Math.min(1, Math.max(0, window.scrollY / maxScroll))
        const target    = Math.min(Math.round(progress * (FRAME_COUNT - 1)), FRAME_COUNT - 1)

        let drawIdx = target
        while (drawIdx > 0 && !images.current[drawIdx]?.complete) drawIdx--

        if (drawIdx !== lastIndex && images.current[drawIdx]?.complete) {
          drawFrame(images.current[drawIdx])
          lastIndex = drawIdx
        }
      }

      /* velocity decay — slow (matches akella original: 0.999/frame) */
      targetVelo   *= 0.999
      currentVelo   = currentVelo + (targetVelo - currentVelo) * 0.1

      /* set uniforms */
      gl.useProgram(prog)
      gl.uniform2f(uMou, mx, my)
      gl.uniform1f(uVel, currentVelo)
      gl.uniform1i(uTex, 0)

      /* bind geometry and draw */
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
      gl.enableVertexAttribArray(aUV)
      gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, tex)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouse)
      gl.deleteTexture(tex)
      gl.deleteBuffer(posBuf)
      gl.deleteBuffer(uvBuf)
      gl.deleteProgram(prog)
    }
  }, [])

  return (
    <>
      {/* ── WebGL canvas ────────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          overflow: 'hidden', backgroundColor: '#060810',
        }}
      >
        <canvas
          ref={glCanvasRef}
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        />
      </div>

      {/* ── Gradient overlays (legibility) ──────────────────────────── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ position:'absolute', inset:0, background:'rgba(6,8,16,0.76)' }} />
        <div style={{ position:'absolute', inset:0,
          background:'radial-gradient(ellipse 85% 90% at 50% 40%, transparent 35%, rgba(6,8,16,0.55) 100%)' }} />
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(to bottom, rgba(6,8,16,0.92) 0%, transparent 18%)' }} />
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(to top, rgba(6,8,16,0.96) 0%, transparent 22%)' }} />
      </div>

      {/* ── Black curtain that fades out once first frame is ready ───── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: firstFrameReady ? 0 : 1 }}
        transition={{ duration: 1.2, delay: firstFrameReady ? 0.1 : 0, ease: 'linear' }}
        style={{
          position:'fixed', inset:0, zIndex:2,
          background:'#060810', pointerEvents:'none',
        }}
      />

      {/* ── Entrance curtain (orchestrated with hero) ────────────────── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.4, delay: 0.5, ease: [0.4, 0, 0.6, 1] }}
        style={{
          position:'fixed', inset:0, zIndex:90,
          background:'#060810', pointerEvents:'none',
        }}
      />
    </>
  )
}
