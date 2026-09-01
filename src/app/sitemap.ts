import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.kevdev.net.ar'
  const currentDate = new Date().toISOString().split('T')[0]

  const routes = [
    '',
    '/diseno-web',
    '/tiendas-online',
    '/desarrollo-a-medida',
    '/diagnostico',
    '/proyectos',
    '/vault',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : (route.startsWith('/diseno-web') || route.startsWith('/tiendas-online') || route.startsWith('/desarrollo-a-medida') ? 0.9 : 0.7),
  }))
}
