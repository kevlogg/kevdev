export interface Project {
  name: string
  status: string
  statusDot: string
  tagline: string
  description: string
  tags: string[]
  year: string
  href?: string
  color: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Kronitt',
    status: 'Listo para validar',
    statusDot: 'var(--color-accent)',
    tagline: 'Sistema de turnos y gestión para el sector estética.',
    description:
      'Reservas online, panel administrativo y automatizaciones de recordatorios. Pensado para barberías, peluquerías y centros de estética que quieren profesionalizar su operación y crecer.',
    tags: ['Web app', 'SaaS', 'Firebase', 'React'],
    year: '2025',
    href: 'https://kronitt.com.ar',
    color: '#a78bfa',
  },
  {
    name: 'Experience Fly',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'Landing inmersiva para una aerolínea de experiencias premium.',
    description:
      'Cockpit 3D interactivo con scroll, planificador de vuelos, sección de destinos y asistente IA integrado. Proyecto de diseño y desarrollo frontend de alto impacto visual.',
    tags: ['Next.js', 'Three.js', 'Framer Motion', 'IA'],
    year: '2025',
    href: 'https://experience-fly.vercel.app/',
    color: '#38bdf8',
  },
  {
    name: 'GrowAi',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'App de seguimiento de cultivo, diagnóstico y comunidad de nicho.',
    description:
      'Seguimiento de ciclos, registro de acciones, diagnóstico asistido por imágenes y comunidad integrada. Producto de nicho con visión de utilidad real y retención por engagement.',
    tags: ['Mobile web', 'Firebase', 'IA', 'Comunidad'],
    year: '2025',
    href: 'https://growai.com.ar',
    color: '#34d399',
  },
  {
    name: 'Bad Bee',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'Landing para una marca de miel artesanal.',
    description:
      'Sitio de presentación para Bad Bee, marca de miel con identidad visual fuerte. Diseño limpio, orientado a conversión y con foco en transmitir autenticidad del producto.',
    tags: ['Next.js', 'Landing', 'Branding'],
    year: '2025',
    href: 'https://v0-bad-bee-landing-page-ng5w.vercel.app/',
    color: '#fbbf24',
  },
  {
    name: 'Nexo',
    status: 'En construcción',
    statusDot: 'rgba(221,232,255,0.25)',
    tagline: 'App para parejas con sincronización en tiempo real.',
    description:
      'Estado emocional, mensajes, necesidades y gestos de amor sincronizados al instante. Construida con Firebase Realtime y notificaciones push para mantener la conexión activa entre dos personas.',
    tags: ['React', 'Firebase', 'Tiempo real', 'Mobile web'],
    year: '2025',
    href: 'https://nexo-seven-nu.vercel.app/',
    color: '#f472b6',
  },
  {
    name: 'Tienda de Astillas',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'E-commerce de productos artesanales en madera.',
    description:
      'Tienda online para una marca de productos de madera trabajada a mano. Catálogo de productos, carrito de compras y flujo de pago integrado. Identidad visual cálida y artesanal que transmite el valor del trabajo manual.',
    tags: ['Next.js', 'E-commerce', 'Landing', 'Branding'],
    year: '2025',
    href: 'https://tiendadeastillas.com.ar',
    color: '#fb923c',
  },
  {
    name: 'Mundialito',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'Torneo de pronósticos para el Mundial 2026 con plata real.',
    description:
      'App de pronósticos con torneos privados y públicos, entry fees en ARS y distribución automática del pozo. Leaderboard en tiempo real, sincronización de partidos y hasta 100 participantes por torneo.',
    tags: ['Next.js', 'Firebase', 'MercadoPago', 'Tiempo real'],
    year: '2025',
    href: 'https://mundialito-gold.vercel.app',
    color: '#00D26A',
  },
  {
    name: 'Andreac Tejidos',
    status: 'En construcción',
    statusDot: 'rgba(221,232,255,0.25)',
    tagline: 'Landing premium para una marca de ropa artesanal.',
    description:
      'Sitio de presentación para marca textil artesanal con talleres, tienda, galería y testimonios. Diseño cálido y editorial que transmite el valor del trabajo a mano.',
    tags: ['React', 'Vite', 'Framer Motion', 'Branding'],
    year: '2025',
    color: '#c9a97a',
  },
]
