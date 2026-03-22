import { useState, useEffect } from 'react'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-kev-bg/80 backdrop-blur-md border-b border-kev-border' : ''
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="flex items-center shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          aria-label="kevdev — inicio"
        >
          <BrandLogo className="h-14 w-auto sm:h-16 object-contain object-left" />
        </a>
        <div className="flex items-center gap-8">
          <a href="#que-hago" className="text-sm text-kev-muted hover:text-kev-white transition-colors hidden sm:inline">
            Qué hago
          </a>
          <a href="#proyectos" className="text-sm text-kev-muted hover:text-kev-white transition-colors hidden sm:inline">
            Proyectos
          </a>
          <a href="#contacto" className="text-sm font-medium text-kev-electric hover:text-kev-cyan transition-colors">
            Contacto
          </a>
        </div>
      </nav>
    </header>
  )
}
