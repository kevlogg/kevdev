const ITEMS = [
  {
    title: 'Landing pages',
    description: 'Páginas de aterrizaje claras y modernas para marcas, productos o servicios. Diseño enfocado en conversión y en transmitir el mensaje correcto.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    title: 'Web apps / paneles',
    description: 'Aplicaciones web y paneles de administración para gestionar datos, usuarios o procesos. Interfaces útiles y escalables.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    title: 'Automatizaciones con IA',
    description: 'Flujos y herramientas que combinan APIs, integraciones e IA para automatizar tareas repetitivas y mejorar la operación.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'MVPs para validar ideas',
    description: 'Versiones mínimas viables de tu producto para probar con usuarios reales antes de invertir en algo más grande.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function QueHago() {
  return (
    <section id="que-hago" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-kev-white mb-4">
            Qué hago
          </h2>
          <p className="text-kev-muted text-lg">
            Cuatro tipos de trabajo donde puedo sumar valor real a tu negocio o idea.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-kev-border bg-kev-surface/40 p-6 hover:border-kev-electric/25 hover:shadow-card transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-kev-electric/10 border border-kev-border flex items-center justify-center text-kev-electric mb-4 group-hover:bg-kev-electric/15 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-display font-semibold text-lg text-kev-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-kev-muted leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
