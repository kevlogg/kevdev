'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-neutral-900 rounded-2xl border border-neutral-800">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Crítico</h1>
          <p className="text-neutral-400 mb-6 text-sm">
            Disculpas, la aplicación experimentó una falla crítica global.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
          >
            Reiniciar Aplicación
          </button>
        </div>
      </body>
    </html>
  )
}
