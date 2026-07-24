export interface TechSpec {
  architecture: string
  frameworks: string
  languages: string
  auth: string
  payments: string
  database: string
  seo: string
  hosting: string
  other?: string
}

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
  techSpec?: TechSpec
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
    color: '#d4a017',
    techSpec: {
      architecture:
        'Next.js App Router con API routes propias, deploy en Vercel con 5 cron jobs para recordatorios y cobro automático de suscripciones.',
      frameworks: 'Next.js 14 (App Router), React 18',
      languages: 'TypeScript',
      auth: 'Firebase Auth',
      payments:
        'MercadoPago integrado directo contra su REST API (sin SDK npm): checkout, guardado de tarjeta, webhook de notificaciones y cobro automático de suscripciones vía cron.',
      database: 'Firebase Firestore, con Supabase como dependencia puntual adicional.',
      seo: 'Metadata básica en app/layout.tsx (title, description, Open Graph). Sin sitemap ni robots.txt dedicados.',
      hosting: 'Vercel, con cron jobs configurados en vercel.json.',
      other: 'Framer Motion, Recharts, react-big-calendar, date-fns/moment, Resend para envío de emails.',
    },
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
    techSpec: {
      architecture: 'Next.js App Router como showcase 3D/animación, sin backend propio.',
      frameworks: 'Next.js 16, React 19',
      languages: 'TypeScript',
      auth: 'No aplica — sin autenticación.',
      payments: 'No aplica.',
      database: 'No aplica — sin backend ni base de datos.',
      seo: 'Metadata básica en app/layout.tsx (title, description). Sin sitemap ni robots.txt dedicados.',
      hosting: 'Vercel, configuración estándar de Next.js.',
      other: 'React Three Fiber + drei + three.js (escenas 3D), Framer Motion, Lenis (smooth scroll), Zustand, Tailwind CSS 4, Vitest.',
    },
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
    techSpec: {
      architecture: 'Sitio estático generado con Eleventy (11ty), deploy en Vercel a partir de la carpeta _site.',
      frameworks: 'Eleventy (11ty) 2.0 como generador de sitio estático',
      languages: 'JavaScript, plantillas Nunjucks (.njk), Tailwind CSS 3.4',
      auth: 'No aplica — sitio estático sin login.',
      payments: 'No verificado en este repo.',
      database: 'No aplica. Formularios de contacto vía EmailJS.',
      seo: 'robots.txt con referencia a sitemap, sitemap.njk que genera sitemap.xml, y meta tags OG/Twitter dinámicos por página (title, description, og:title, og:url, og:image).',
      hosting: 'Vercel, con headers de seguridad estrictos (CSP, HSTS, X-Frame-Options) definidos en vercel.json.',
      other: 'Animaciones Lottie, video assets propios.',
    },
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
    techSpec: {
      architecture: 'Landing de una sola página (page.tsx), sin API routes ni backend propio. Generado originalmente con v0.',
      frameworks: 'Next.js 14.2 (App Router), React 18',
      languages: 'TypeScript',
      auth: 'No aplica.',
      payments: 'No aplica — la compra se deriva a WhatsApp y Mercado Libre externos, sin pasarela propia.',
      database: 'No aplica.',
      seo: 'Metadata completa en layout.tsx (title, description, keywords, canonical, metadataBase, Open Graph con imagen, Twitter Card, control de robots/googleBot). Sin sitemap.ts ni robots.ts.',
      hosting: 'Vercel (dominio badbee.com.ar en metadata, sin vercel.json explícito).',
      other: 'shadcn/Radix UI, @vercel/analytics, next-themes, Geist font, fondo hexagonal interactivo propio.',
    },
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
    techSpec: {
      architecture:
        'SPA de React con Vite y routing client-side (react-router-dom), con rewrites en Vercel para servir index.html.',
      frameworks: 'React 18 + Vite 5 (SPA, sin Next.js)',
      languages: 'TypeScript',
      auth: 'Firebase Auth con Google Sign-In (signInWithPopup / GoogleAuthProvider).',
      payments: 'No verificado — sin integración encontrada.',
      database: 'Firebase Firestore (dos bases: default y nexoidfirestore) con reglas propias, más Cloud Functions.',
      seo: 'No aplica — SPA privada, sin metadata dinámica ni sitemap.',
      hosting: 'Vercel para el frontend (SPA rewrite), Firebase (Firestore + Functions) para el backend.',
      other:
        'Sincronización en tiempo real entre parejas vía Firestore onSnapshot (useCouple, useGoals, usePartnerProfile, useTasks), push notifications con Firebase Cloud Messaging (VAPID key), Tailwind CSS 3.4.',
    },
  },
  {
    name: 'Dulce Hogar',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'Tienda online de muebles y decoración premium.',
    description:
      'Sitio para una tienda de muebles y deco de Moreno, Buenos Aires. Catálogo de productos, integración con WhatsApp y MercadoPago, diseño cálido y elegante que transmite el estilo premium de la marca.',
    tags: ['Next.js', 'E-commerce', 'MercadoPago', 'Branding'],
    year: '2025',
    href: 'https://dulcehogardye.com.ar',
    color: '#C9A87C',
    techSpec: {
      architecture:
        'Next.js App Router con route groups (tienda), API routes propias y middleware con JWT para el panel admin.',
      frameworks: 'Next.js 15 (App Router), React 18',
      languages: 'TypeScript',
      auth: 'Firebase Auth (cliente y admin) para usuarios, más sesión de admin propia vía JWT (jose) en cookie admin_session.',
      payments:
        'MercadoPago (SDK oficial v2): checkout, preferencias, confirmación de pago y cobro mensual recurrente con tarjeta guardada.',
      database: 'Firebase Firestore (admin y cliente) y Firebase Storage para imágenes de producto.',
      seo: 'app/sitemap.ts y app/robots.ts, más metadata con metadataBase, title/description y openGraph.locale en el layout raíz.',
      hosting: 'Vercel, con build/install commands explícitos en vercel.json.',
      other: 'Radix UI, React Hook Form + Zod, Recharts (estadísticas), Resend (emails), Zustand, Google APIs (googleapis).',
    },
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
    techSpec: {
      architecture:
        'Next.js App Router con cron job serverless en Vercel y funciones de Firebase separadas para lógica de backend.',
      frameworks: 'Next.js 14.2, React 18',
      languages: 'TypeScript',
      auth: 'Firebase Auth (cliente y admin), tokens ID verificados en rutas admin y de torneos.',
      payments: 'MercadoPago (checkout, verificación de pago y webhook) en uso real. Stripe está en dependencias pero sin rutas activas.',
      database: 'Firebase Firestore + Firebase Functions (Node 20), con reglas de Firestore versionadas.',
      seo: 'Metadata con openGraph (title, description, url, siteName) y metadataBase en el layout. Sin sitemap.ts ni robots.ts.',
      hosting: 'Vercel (con cron jobs) para front/API, Firebase para Functions y Firestore.',
      other: 'date-fns, nanoid, react-hot-toast, sharp, tests con Vitest.',
    },
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
    techSpec: {
      architecture: 'SPA estática con Vite, componentes por sección (Hero, Gallery, Shop, Workshops), sin backend propio.',
      frameworks: 'React 18 + Vite 6 (SPA, sin Next.js)',
      languages: 'JavaScript (JSX)',
      auth: 'No aplica — sin autenticación.',
      payments: 'No verificado — sin MercadoPago ni Stripe en el proyecto; el catálogo no tiene cobro integrado.',
      database: 'No aplica — datos estáticos en archivos locales (src/data).',
      seo: 'Meta tags estáticos en index.html (title, description, Open Graph, Twitter Card, theme-color). Sin sitemap ni robots dinámicos por ser SPA.',
      hosting: 'Build estático (dist/); configuración de hosting no verificada en el repo.',
      other: 'Framer Motion, Tailwind CSS.',
    },
  },
  {
    name: 'La Rodante del Desierto',
    status: 'En producción',
    statusDot: 'var(--color-accent)',
    tagline: 'Landing para réplicas impresas en 3D de la RV de una serie de culto.',
    description:
      'Sitio de venta para una réplica miniatura hecha a pedido, con pintura a mano y sin usar assets oficiales de la producción. Estética de laboratorio clandestino y desierto nocturno, con video y fotos de producto en cada sección.',
    tags: ['Next.js', 'Framer Motion', 'Tailwind', 'E-commerce'],
    year: '2025',
    href: 'https://la-rodante-del-desierto.vercel.app',
    color: '#c8d94a',
    techSpec: {
      architecture:
        'Next.js 14 App Router con componentes de sección independientes (Hero, Offer, Story, Gallery, VideoSection, Specs, Highlights, FAQ, ContactForm, Footer). Sin rutas API implementadas.',
      frameworks: 'Next.js 14.2 (App Router), React 18.3',
      languages: 'TypeScript 5.6, Tailwind CSS 3.4',
      auth: 'No aplica — landing sin cuentas de usuario.',
      payments:
        'Sin pasarela de pago integrada. Conversión vía WhatsApp (link directo) y formulario de contacto con react-hook-form + zod (el envío aún es simulado, pendiente de conectar a un endpoint propio).',
      database: 'No aplica — sin backend ni base de datos.',
      seo:
        'Metadata completa en app/layout.tsx (title template, description, keywords, Open Graph, Twitter card, robots), app/robots.ts y app/sitemap.ts con la Metadata API de Next.js, más JSON-LD tipo Product con oferta en ARS.',
      hosting: 'Vercel (deploy por defecto, sin configuración custom).',
      other: 'Framer Motion, Radix UI (accordion para FAQ), lucide-react, fuentes vía next/font (Bebas Neue, Big Shoulders Stencil, Work Sans).',
    },
  },
]
