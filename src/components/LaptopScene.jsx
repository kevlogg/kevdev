import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import BrandLogo from './BrandLogo'

const CODE_TEXT = `const build = () => {
  ship();
};
// kevdev`

const PARTICLE_COUNT = 60

export default function LaptopScene({ embedded = false }) {
  const containerRef = useRef(null)
  const lidRef = useRef(null)
  const codeRef = useRef(null)
  const screenRef = useRef(null)
  const particlesRef = useRef([])
  const [visibleCode, setVisibleCode] = useState('')
  const [laptopVisible, setLaptopVisible] = useState(true)
  const [explosionActive, setExplosionActive] = useState(false)
  const [showKevdev, setShowKevdev] = useState(false)
  const kevdevTextRef = useRef(null)

  const KEVDEV_DURATION = 3.2

  // Animación de partículas cuando explota (refs ya están montados)
  useEffect(() => {
    if (!explosionActive) return
    const particles = particlesRef.current.filter(Boolean)
    if (particles.length === 0) return

    particles.forEach((p, i) => {
      const angle = (i / particles.length) * Math.PI * 2 + Math.random() * 0.5
      const dist = 80 + Math.random() * 120
      const tx = Math.cos(angle) * dist
      const ty = Math.sin(angle) * dist

      gsap.fromTo(
        p,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: tx,
          y: ty,
          opacity: 0,
          scale: 0.2,
          duration: 0.7,
          ease: 'power2.out',
        }
      )
    })
  }, [explosionActive])

  // Entrada de "kevdev" cuando se muestra
  useEffect(() => {
    if (!showKevdev || !kevdevTextRef.current) return
    const el = kevdevTextRef.current
    gsap.fromTo(el, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' })
  }, [showKevdev])

  // Timeline principal: abrir → escribir → explotar → kevdev → reset
  useEffect(() => {
    const lid = lidRef.current
    if (!lid) return

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 })

    // Cerrado = 0°, abierto = -85° (la tapa se levanta hacia atrás)
    tl.fromTo(
      lid,
      { rotateX: 0 },
      { rotateX: -85, duration: 0.6, ease: 'power2.out' },
      0
    )

    tl.to(
      { value: 0 },
      {
        value: 1,
        duration: 2.4,
        ease: 'none',
        onUpdate: function () {
          const progress = this.targets()[0].value
          const len = Math.floor(progress * CODE_TEXT.length)
          setVisibleCode(CODE_TEXT.slice(0, len))
        },
      },
      0.6
    )

    tl.add(() => {
      setLaptopVisible(false)
      setExplosionActive(true)
    }, 3)

    // Fin de explosión: ocultar partículas y mostrar "kevdev"
    tl.add(() => {
      setExplosionActive(false)
      setShowKevdev(true)
      particlesRef.current.forEach((p) => {
        if (p) gsap.set(p, { x: 0, y: 0, opacity: 0, scale: 1 })
      })
    }, 3.8)

    // Mantener "kevdev" visible unos segundos, luego reset
    tl.add(() => {
      setShowKevdev(false)
      setLaptopVisible(true)
      setVisibleCode('')
      gsap.set(lid, { rotateX: 0 })
    }, 3.8 + KEVDEV_DURATION)

    return () => tl.kill()
  }, [])

  const container = (
    <div
      ref={containerRef}
      className={`rounded-2xl overflow-visible border border-kev-border bg-kev-bg/90 shadow-card w-full relative flex items-center justify-center ${embedded ? 'h-[240px] min-h-[240px]' : 'h-[380px]'}`}
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
    >
          {/* Laptop (CSS 3D) */}
          {laptopVisible && (
            <div
              className="relative w-[280px] h-[180px] flex items-end justify-center"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1200px',
                transform: embedded ? 'scale(0.72)' : 'none',
              }}
            >
              {/* Base */}
              <div
                className="absolute bottom-0 w-[280px] h-[20px] rounded-b-lg rounded-t-sm shadow-lg"
                style={{
                  background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                  transformOrigin: 'center bottom',
                }}
              />
              {/* Lid + screen - wrapper para centrar, inner para rotar */}
              <div
                className="absolute bottom-[18px] left-1/2 w-[280px] -translate-x-1/2 origin-bottom"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  ref={lidRef}
                  className="w-full origin-bottom will-change-transform"
                  style={{
                    transform: 'rotateX(0deg)',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                  }}
                >
                <div
                  ref={screenRef}
                  className="relative w-full h-[160px] rounded-t-lg rounded-b-sm overflow-hidden border border-kev-border shadow-lg"
                  style={{
                    background: '#0f172a',
                    boxShadow: 'inset 0 0 0 1px rgba(56, 189, 248, 0.1)',
                  }}
                >
                  {/* Code on screen */}
                  <pre
                    ref={codeRef}
                    className="absolute inset-0 p-3 text-left font-mono text-xs leading-relaxed overflow-hidden whitespace-pre text-kev-electric"
                    style={{ margin: 0 }}
                  >
                    {visibleCode}
                    {visibleCode.length < CODE_TEXT.length && <span className="opacity-80">|</span>}
                  </pre>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Explosion particles */}
          {explosionActive && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    if (el) particlesRef.current[i] = el
                  }}
                  className="absolute w-2 h-2 rounded-full bg-kev-electric opacity-0"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-4px',
                    marginTop: '-4px',
                    boxShadow: '0 0 8px rgba(56, 189, 248, 0.8)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Palabra kevdev después de la explosión */}
          {showKevdev && (
            <div
              ref={kevdevTextRef}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <BrandLogo
                className="h-[6.5rem] w-auto sm:h-28 md:h-32 max-w-[min(340px,94%)] object-contain drop-shadow-[0_0_32px_rgba(56,189,248,0.65)]"
                alt=""
              />
            </div>
          )}
    </div>
  )

  if (embedded) return container

  return (
    <section className="relative w-full flex items-center justify-center py-12 px-6" id="laptop-scene">
      <div className="w-full max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto">
          {container}
        </div>
      </div>
    </section>
  )
}
