const AUDIENCIAS = [
  'Negocios que necesitan digitalizar procesos',
  'Emprendedores que quieren lanzar un MVP',
  'Marcas o profesionales que necesitan una landing clara y moderna',
  'Personas o equipos que quieren automatizar tareas o mejorar su operación',
]

export default function ParaQuien() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-kev-white mb-4">
            Para quién
          </h2>
          <p className="text-kev-muted text-lg">
            A qué tipo de clientes o proyectos puedo ayudar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {AUDIENCIAS.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-kev-border bg-kev-surface/30 hover:border-kev-electric/20 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-kev-electric shrink-0" />
              <span className="text-kev-muted text-sm sm:text-base">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
