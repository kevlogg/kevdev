const PROYECTOS = [
  {
    name: 'Kronitt',
    description: 'Sistema de turnos y gestión para barberías, peluquerías y centros de estética.',
    points: [
      'Reservas online',
      'Panel administrativo',
      'Enfoque en orden, profesionalización y crecimiento del negocio',
      'Pensado para recordatorios y automatizaciones',
    ],
    badge: 'Listo para validar',
    badgeColor: 'bg-kev-electric/20 text-kev-electric border-kev-electric/30',
  },
  {
    name: 'GrowAi',
    description: 'Aplicación enfocada en seguimiento de cultivo, diagnóstico asistido y construcción de comunidad en un nicho específico.',
    points: [
      'Seguimiento de cultivos',
      'Registro de acciones',
      'Diagnóstico por imágenes',
      'Producto de nicho con visión de comunidad y utilidad real',
    ],
    badge: 'En construcción',
    badgeColor: 'bg-kev-cyan/15 text-kev-cyan border-kev-cyan/25',
  },
]

export default function Proyectos() {
  return (
    <section id="proyectos" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-kev-white mb-4">
            Proyectos reales
          </h2>
          <p className="text-kev-muted text-lg">
            Productos que estoy construyendo hoy. Prueba de ejecución, no portfolios ficticios.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {PROYECTOS.map((p) => (
            <div
              key={p.name}
              className="rounded-3xl border border-kev-border bg-kev-surface/50 p-8 hover:border-kev-electric/20 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-display font-bold text-2xl text-kev-white">
                  {p.name}
                </h3>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${p.badgeColor}`}>
                  {p.badge}
                </span>
              </div>
              <p className="text-kev-muted mb-6 leading-relaxed">
                {p.description}
              </p>
              <ul className="space-y-2">
                {p.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-kev-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-kev-electric shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
