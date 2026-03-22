import BrandLogo from './BrandLogo'

export default function Footer() {
  return (
    <footer className="border-t border-kev-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="flex items-center opacity-90" aria-hidden>
          <BrandLogo className="h-9 sm:h-10 w-auto object-contain object-left" />
        </span>
        <div className="flex items-center gap-6 text-sm text-kev-mutedSoft">
          <a href="#que-hago" className="hover:text-kev-muted transition-colors">Qué hago</a>
          <a href="#proyectos" className="hover:text-kev-muted transition-colors">Proyectos</a>
          <a href="#contacto" className="hover:text-kev-muted transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  )
}
