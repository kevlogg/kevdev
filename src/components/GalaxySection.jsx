export default function GalaxySection() {
  return (
    <section
      className="py-16 sm:py-20 px-6"
      aria-label="Demostración visual WebGPU"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-kev-white mb-3">
            Galaxia en tiempo real
          </h2>
          <p className="text-kev-muted text-base sm:text-lg">
            Simulación WebGPU con Three.js: arrastrá para mover la cámara. Ideal para fondos
            inmersivos o demos técnicas.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-[0_0_0_1px_rgba(56,189,248,0.08)]">
          <div className="relative w-full aspect-[16/10] min-h-[min(360px,55vh)] sm:min-h-[420px] max-h-[65vh]">
            <iframe
              title="Simulación de galaxia WebGPU"
              src="/webgpu-galaxy-main/dist/index.html"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
