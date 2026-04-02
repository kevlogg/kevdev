export default function GalaxySection() {
  return (
    <section
      className="relative py-16 sm:py-20 px-6 min-h-[min(520px,72vh)] overflow-hidden"
      aria-label="Demostración visual WebGPU"
    >
      <div className="absolute inset-0 z-0 min-h-[min(420px,60vh)]">
        <iframe
          title="Simulación de galaxia WebGPU"
          src="/webgpu-galaxy-main/dist/index.html"
          className="absolute inset-0 h-full w-full border-0 bg-transparent"
          loading="lazy"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto pointer-events-none">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-kev-white mb-3 [text-shadow:0_2px_24px_rgba(0,0,0,0.9),0_0_2px_rgba(0,0,0,0.8)]">
            Galaxia en tiempo real
          </h2>
          <p className="text-kev-muted text-base sm:text-lg [text-shadow:0_1px_16px_rgba(0,0,0,0.95),0_0_1px_rgba(0,0,0,0.9)]">
            WebGPU y Three.js: arrastrá para orbitar la cámara. Solo la galaxia; el fondo es el de la página.
          </p>
        </div>
      </div>
    </section>
  )
}
