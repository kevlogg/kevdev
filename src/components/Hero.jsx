import LaptopScene from './LaptopScene'
import BrandLogo from './BrandLogo'

const STACK = ['React', 'Node.js', 'FlutterFlow', 'Firebase', 'IA', 'Automatización']

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-20 px-6 overflow-hidden">
      {/* Glow sutil de fondo */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-kev-electric/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-kev-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kev-surface border border-kev-border text-kev-muted text-sm">
            <span className="w-2 h-2 rounded-full bg-kev-electric animate-pulse shrink-0" />
            <BrandLogo className="h-6 sm:h-7 w-auto object-contain object-left shrink-0" />
            <span className="text-kev-muted/80">/</span>
            <span>digital product builder</span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight text-kev-white">
            Construyo productos digitales y herramientas web para negocios reales.
          </h1>

          <p className="text-lg text-kev-muted max-w-xl leading-relaxed">
            Landing pages, web apps, automatizaciones y MVPs. Con foco en negocio, validación y ejecución — no solo código.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-kev-electric text-kev-bg font-semibold text-sm hover:bg-kev-electricDim hover:shadow-glow transition-all duration-300"
            >
              Hablar del proyecto
            </a>
            <a
              href="#proyectos"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl border border-kev-border text-kev-white font-medium text-sm hover:border-kev-electric/40 hover:bg-kev-electric/5 transition-all duration-300"
            >
              Ver proyectos
            </a>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {STACK.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-xl bg-kev-surface/80 border border-kev-border text-kev-mutedSoft text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Columna derecha: laptop + card */}
        <div className="relative flex flex-col gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:150ms]">
          <LaptopScene embedded />
          <div className="rounded-3xl border border-kev-border bg-kev-surface/60 backdrop-blur-sm p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-kev-electric/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-kev-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-display font-semibold text-kev-white">Productos reales</p>
                <p className="text-xs text-kev-mutedSoft">En construcción y listos para validar</p>
              </div>
            </div>
            <p className="text-sm text-kev-muted leading-relaxed">
              Desarrollando Kronitt (turnos y gestión para barberías y estética) y GrowAi (seguimiento de cultivo y comunidad). Ejecución real, no demos.
            </p>
            <a href="#proyectos" className="inline-block mt-4 text-sm font-medium text-kev-electric hover:text-kev-cyan transition-colors">
              Ver proyectos →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
