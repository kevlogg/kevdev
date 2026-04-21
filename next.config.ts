import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Los errores de lint no bloquean el build de producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
