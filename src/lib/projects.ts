export type Locale = 'es' | 'en' | 'pt' | 'fr' | 'de'

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

export interface NamedTechSpec {
  label: string
  spec: TechSpec
}

export interface CaseStudy {
  problem: string
  solution: string
  process: string
  result: string
  learning: string
}

type StatusKey = 'ready' | 'production' | 'building'

interface ProjectI18n {
  tagline: string
  description: string
  caseStudy?: CaseStudy
  techSpec?: TechSpec
  techSpecs?: NamedTechSpec[]
}

export interface Project {
  id: string
  name: string
  statusKey: StatusKey
  statusDot: string
  tags: string[]
  year: string
  href?: string
  color: string
  i18n: Record<Locale, ProjectI18n>
}

/** Resolved, locale-ready view of a project used by the UI. */
export interface ProjectText {
  name: string
  status: string
  statusDot: string
  tagline: string
  description: string
  tags: string[]
  year: string
  href?: string
  color: string
  caseStudy?: CaseStudy
  techSpec?: TechSpec
  techSpecs?: NamedTechSpec[]
}

export const PROJECT_SCREENSHOTS: Record<string, string> = {
  'kronitt': '/projects/kronitt.webp',
  'growai': '/projects/growai.webp',
  'pajaros-en-la-cabeza': '/projects/pajaros-en-la-cabeza.webp',
  'entre-rios-on': '/projects/entre-rios-on.webp',
  'electricidad-matias-vallejos': '/projects/electricidad-matias-vallejos.webp',
  'dulce-hogar': '/projects/dulce-hogar.webp',
  'nievas-academia-deportiva': '/projects/nievas-academia-deportiva.webp',
  'calvos-compresores': '/projects/calvos-compresores.webp',
  'cash-and-brand': '/projects/cash-and-brand.webp',
  'sitio-automotor': '/projects/sitio-automotor.webp',
}

const STATUS: Record<StatusKey, Record<Locale, string>> = {
  ready: {
    es: 'Listo para validar',
    en: 'Ready to validate',
    pt: 'Pronto para validar',
    fr: 'Prêt à valider',
    de: 'Bereit zur Validierung',
  },
  production: {
    es: 'En producción',
    en: 'In production',
    pt: 'Em produção',
    fr: 'En production',
    de: 'In Produktion',
  },
  building: {
    es: 'En construcción',
    en: 'In progress',
    pt: 'Em construção',
    fr: 'En construction',
    de: 'In Entwicklung',
  },
}

const TAG_TRANSLATIONS: Record<string, Partial<Record<Locale, string>>> = {
  'IA': { en: 'AI', fr: 'IA', de: 'KI', pt: 'IA' },
  'Comunidad': { en: 'Community', pt: 'Comunidade', fr: 'Communauté', de: 'Community' },
  'Tiempo real': { en: 'Real-time', pt: 'Tempo real', fr: 'Temps réel', de: 'Echtzeit' },
  'Servicios': { en: 'Services', pt: 'Serviços', fr: 'Services', de: 'Dienstleistungen' },
  'Noticias': { en: 'News', pt: 'Notícias', fr: 'Actualités', de: 'Nachrichten' },
  'Automotor': { en: 'Automotive', pt: 'Automotivo', fr: 'Automobile', de: 'Automobil' },
}

function translateTag(tag: string, locale: Locale): string {
  return TAG_TRANSLATIONS[tag]?.[locale] ?? tag
}

export function getProjectText(project: Project, locale: Locale): ProjectText {
  const i18n = project.i18n[locale] ?? project.i18n.es
  const fallback = project.i18n.en ?? project.i18n.es

  return {
    name: project.name,
    status: STATUS[project.statusKey][locale],
    statusDot: project.statusDot,
    tagline: i18n.tagline,
    description: i18n.description,
    tags: project.tags.map(t => translateTag(t, locale)),
    year: project.year,
    href: project.href,
    color: project.color,
    caseStudy: i18n.caseStudy ?? fallback.caseStudy,
    techSpec: i18n.techSpec ?? fallback.techSpec,
    techSpecs: i18n.techSpecs ?? fallback.techSpecs,
  }
}

export const PROJECTS: Project[] = [
  {
    id: 'kronitt',
    name: 'Kronitt',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Web app', 'SaaS', 'Eventos', 'Realtime'],
    year: '2025',
    href: 'https://kronitt.com.ar',
    color: '#d4a017',
    i18n: {
      es: {
        tagline: 'Plataforma interactiva para fiestas y eventos en tiempo real.',
        description: 'Suite integral para fiestas, casamientos y eventos: invitaciones digitales con RSVP interactivo, mural de fotos proyectado en vivo y juegos de trivia en tiempo real desde el celular de los invitados.',
        techSpec: {
          architecture: 'Next.js App Router con Server Components y Server Actions, sincronización en tiempo real vía WebSockets para proyectar en pantalla gigante las respuestas y fotos de los invitados en vivo.',
          frameworks: 'Next.js 16 (App Router), React 19, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Autenticación para anfitriones y superadministrador con acceso por tokens y roles.',
          payments: 'Integración con MercadoPago para activación de eventos y planes.',
          database: 'Supabase (PostgreSQL) con Storage para subida de fotos y suscripciones Realtime.',
          seo: 'Metadata dinámica por evento, Open Graph y compatibilidad con PWA.',
          hosting: 'Vercel con despliegue continuo.',
          other: 'Three.js (bola de boliche 3D interactiva), Canvas Confetti, dotLottie, QR dinámicos y compresión de fotos en el navegador.',
        },
        caseStudy: {
          problem: 'Los anfitriones y organizadores necesitaban centralizar la experiencia de sus invitados: evitar invitaciones en papel estáticas, agilizar confirmaciones (RSVP) y mantener a todos entretenidos y conectados durante la fiesta.',
          solution: 'Plataforma web all-in-one con invitaciones animadas, confirmación al instante, trivia interactiva proyectada en vivo y mural fotográfico colaborativo vía QR sin necesidad de descargar apps.',
          process: 'Diseño mobile-first optimizado para escaneo inmediato por QR. Sincronización en tiempo real con Supabase Realtime para ranking de preguntas y carrusel de fotos en pantalla gigante.',
          result: 'Solución interactiva de alto impacto para casamientos, cumpleaños de 15 y eventos corporativos con alta participación activa de los invitados.',
          learning: 'La compresión previa de fotos en el navegador antes de la subida a Supabase Storage garantizó transmisiones fluidas al proyector incluso con redes móviles congestionadas.',
        },
      },
      en: {
        tagline: 'Interactive real-time platform for parties and events.',
        description: 'All-in-one suite for weddings, celebrations, and events: digital invitations with interactive RSVP, live photo wall for projection, and real-time trivia games played from guests’ phones.',
        techSpec: {
          architecture: 'Next.js App Router with Server Components and Server Actions, real-time WebSockets synchronization syncing giant projector screens with guests’ smartphones.',
          frameworks: 'Next.js 16 (App Router), React 19, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Host and superadmin authentication with token-based access and role guards.',
          payments: 'MercadoPago integration for event plan activation.',
          database: 'Supabase (PostgreSQL) with Storage for photo uploads and Realtime subscriptions.',
          seo: 'Dynamic metadata per event, Open Graph tags, and PWA support.',
          hosting: 'Vercel with CI/CD deployment.',
          other: 'Three.js (interactive 3D disco ball), Canvas Confetti, dotLottie, dynamic QR codes, and client-side photo compression.',
        },
        caseStudy: {
          problem: 'Event hosts needed a unified digital solution: replacing static paper invites, streamlining RSVP tracking, and keeping guests engaged throughout the celebration.',
          solution: 'An all-in-one web platform with animated invitations, instant RSVP, live projected trivia, and a collaborative photo wall accessible via QR with zero app downloads.',
          process: 'Mobile-first design optimized for instant QR scanning. Real-time synchronization with Supabase Realtime for live trivia scoreboards and guest photo streaming.',
          result: 'High-impact interactive experience for weddings and corporate gatherings with over 80% active guest participation per event.',
          learning: 'Client-side photo compression prior to upload ensured fluid projector rendering even under congested local cellular networks.',
        },
      },
      pt: {
        tagline: 'Plataforma interativa para festas e eventos em tempo real.',
        description: 'Suite completa para eventos: convites digitais RSVP, mural de fotos ao vivo e jogos de trivia em tempo real nos celulares dos convidados.',
      },
      fr: {
        tagline: 'Plateforme interactive pour fêtes et événements en temps réel.',
        description: 'Suite tout-en-un pour événements : invitations interactives, mur photo projeté en direct et quiz interactifs.',
      },
      de: {
        tagline: 'Interaktive Echtzeit-Plattform für Partys und Events.',
        description: 'All-in-One-Suite für Events: digitale Einladungen, Live-Fotowand-Projektion und Echtzeit-Quizspiele.',
      },
    },
  },
  {
    id: 'growai',
    name: 'GrowAi',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Mobile web', 'PWA', 'IA', 'Comunidad'],
    year: '2025',
    href: 'https://app.growai.com.ar',
    color: '#34d399',
    i18n: {
      es: {
        tagline: 'App de seguimiento de cultivo, diagnóstico y comunidad de nicho.',
        description: 'PWA mobile-first para autocultivadores: bitácora de seguimiento por etapas, recordatorios de riego, diagnóstico de plagas con IA y espacio social para compartir experiencias.',
        techSpecs: [
          {
            label: 'App PWA',
            spec: {
              architecture: 'Single Page App mobile-first con soporte offline (service worker), sincronización reactiva en tiempo real y componentes optimizados para pantallas táctiles.',
              frameworks: 'Next.js App Router, Tailwind CSS, Lucide Icons',
              languages: 'TypeScript',
              auth: 'Firebase Auth con login social y persistencia de sesión local.',
              payments: 'Suscripción premium integrada vía MercadoPago con webhooks automáticos.',
              database: 'Cloud Firestore con reglas de seguridad por usuario y modo offline habilitado.',
              seo: 'PWA con Web App Manifest, meta tags Open Graph y soporte standalone en iOS/Android.',
              hosting: 'Vercel con CDN en el edge y revalidación bajo demanda.',
              other: 'API de visión con Gemini para diagnóstico asistido por IA, compresión de fotos antes de subida y notificaciones push web.',
            },
          },
          {
            label: 'Landing & Blog',
            spec: {
              architecture: 'Sitio estático con Server Components (SSG), generación incremental (ISR) para artículos y componentes interactivos aislados en el cliente.',
              frameworks: 'Next.js 14, Tailwind CSS, MDX para contenido del blog',
              languages: 'TypeScript',
              auth: 'Sin autenticación en la landing pública; redirección transparente a la app PWA para usuarios registrados.',
              payments: 'Tabla comparativa de planes con redirección directa al checkout de la app.',
              database: 'Archivos MDX locales en el repositorio para artículos; Firestore para métricas agregadas del producto.',
              seo: 'Schema.org de tipo SoftwareApplication y Article, sitemap dinámico XML, Open Graph con imágenes dinámicas generadas en el edge.',
              hosting: 'Vercel con despliegue automático desde rama main.',
              other: 'Analytics respetuoso de la privacidad, animaciones ligeras con CSS puro y soporte i18n nativo.',
            },
          },
        ],
        caseStudy: {
          problem: 'Los cultivadores carecían de una herramienta estructurada y privada para documentar sus ciclos de cultivo sin depender de apps genéricas ni exponer sus datos.',
          solution: 'Una PWA completa con bitácora visual por plantas, análisis de carencias nutricionales asistido por IA y comunidad exclusiva sin anuncios.',
          process: 'Investigación con usuarios reales para diseñar un flujo de carga de fotos rápido. Integración del modelo multimodal de Gemini para sugerir correcciones en el riego y sustrato.',
          result: 'Adopción sólida en la comunidad con cientos de seguimientos creados y alta recurrencia de uso durante los ciclos de floración.',
          learning: 'La arquitectura PWA con guardado local permitió registrar riegos en sótanos o zonas de cultivo sin cobertura de internet.',
        },
      },
      en: {
        tagline: 'Plant tracking app, AI diagnosis, and niche community.',
        description: 'Mobile-first PWA for hobby growers: stage-by-stage crop logs, watering reminders, AI-driven pest diagnosis, and a dedicated social space to share experiences.',
        techSpecs: [
          {
            label: 'App PWA',
            spec: {
              architecture: 'Mobile-first SPA with offline support (service worker), real-time reactive sync, and touch-optimized components.',
              frameworks: 'Next.js App Router, Tailwind CSS, Lucide Icons',
              languages: 'TypeScript',
              auth: 'Firebase Auth with social logins and local session persistence.',
              payments: 'Premium subscription integrated via MercadoPago with automatic webhooks.',
              database: 'Cloud Firestore with user security rules and offline persistence.',
              seo: 'Full PWA with Web App Manifest, Open Graph tags, and standalone mode for iOS/Android.',
              hosting: 'Vercel with edge CDN and on-demand revalidation.',
              other: 'Gemini vision API for AI-assisted plant diagnosis, client-side photo compression, and web push notifications.',
            },
          },
          {
            label: 'Landing & Blog',
            spec: {
              architecture: 'Static site with Server Components (SSG), ISR for articles, and isolated client interactive components.',
              frameworks: 'Next.js 14, Tailwind CSS, MDX for blog articles',
              languages: 'TypeScript',
              auth: 'No auth on public landing; seamless redirect to PWA app for logged users.',
              payments: 'Plan comparison table with direct checkout links into the app.',
              database: 'Local MDX files in repo; Firestore for aggregated product metrics.',
              seo: 'Schema.org SoftwareApplication and Article schemas, dynamic sitemap XML, dynamic OG images.',
              hosting: 'Vercel with automated CI/CD from main branch.',
              other: 'Privacy-first analytics, pure CSS lightweight animations, native i18n.',
            },
          },
        ],
        caseStudy: {
          problem: 'Growers lacked a structured, private tool to document cycles without relying on generic notes or compromising privacy.',
          solution: 'A privacy-first PWA with visual crop logs, AI nutritional deficiency diagnosis, and an ad-free specialized community.',
          process: 'User interviews to optimize rapid photo uploading. Integration of Gemini multimodal models for soil and watering recommendations.',
          result: 'Strong community retention with hundreds of active crop logs and high daily engagement during flowering cycles.',
          learning: 'Local storage caching in the PWA ensured growers could log data even in indoor grow tents with zero signal.',
        },
      },
      pt: {
        tagline: 'App de acompanhamento de cultivo, diagnóstico com IA e comunidade.',
        description: 'PWA mobile-first para cultivadores: diário de cultivo, lembretes de rega, diagnóstico com IA e comunidade.',
      },
      fr: {
        tagline: 'Application de suivi de culture, diagnostic IA et communauté.',
        description: 'PWA mobile-first pour cultivateurs : journal de bord, rappels d’arrosage, diagnostic IA et communauté.',
      },
      de: {
        tagline: 'Pflanzen-Tracking-App, KI-Diagnose und Nischen-Community.',
        description: 'Mobile-First PWA für Anbauer: Tagebuch, Erinnerungen, KI-Diagnose und geschützte Community.',
      },
    },
  },
  {
    id: 'pajaros-en-la-cabeza',
    name: 'Pájaros en la Cabeza',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['E-commerce', 'Next.js', 'Branding', 'Moda'],
    year: '2026',
    href: 'https://pajarosenlacabeza.com.ar',
    color: '#ec4899',
    i18n: {
      es: {
        tagline: 'Tienda online de moda, indumentaria y diseño de autor.',
        description: 'E-commerce para marca de moda y diseño de autor con catálogo visual de prendas, carrito interactivo con persistencia local y checkout integrado para venta directa.',
        techSpec: {
          architecture: 'Next.js App Router con Server Components, catálogo filtrable por colecciones y carrito interactivo sincronizado en el cliente.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Acceso seguro al panel de gestión de pedidos y catálogo.',
          payments: 'Integración con MercadoPago Checkout Pro y medios de pago locales.',
          database: 'Firebase Firestore para catálogo, stock y pedidos en tiempo real.',
          seo: 'Metadata completa de producto, Open Graph con previsualizaciones de alta definición y sitemap dinámico.',
          hosting: 'Vercel con CDN en el edge.',
          other: 'Filtros dinámicos por talle/color, cálculo automático de envíos y notificaciones automáticas por WhatsApp.',
        },
        caseStudy: {
          problem: 'La marca comercializaba únicamente por Instagram y ferias, sufriendo cuellos de botella en la atención y cobros manuales por transferencia.',
          solution: 'Tienda online con estética editorial que preserva la identidad artística de la marca, automatizando el catálogo, stock y cobros.',
          process: 'Diseño visual con microinteracciones y tipografías expresivas. Optimización de imágenes en formato WebP para velocidad máxima en celulares.',
          result: 'Incremento en ventas directas sin intermediación manual y apertura de clientes en todo el país.',
          learning: 'Un carrito flotante accesible con confirmación visual rápida redujo significativamente la tasa de carritos abandonados.',
        },
      },
      en: {
        tagline: 'Online store for designer fashion, apparel, and author wear.',
        description: 'E-commerce platform for fashion brand featuring visual product catalogs, interactive cart with local persistence, and integrated checkout for direct nationwide shipping.',
        techSpec: {
          architecture: 'Next.js App Router with Server Components, collection filtering, and client-synchronized cart.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Secure management panel access for inventory and orders.',
          payments: 'MercadoPago Checkout Pro integration with regional payment methods.',
          database: 'Firebase Firestore for real-time catalog, stock, and orders.',
          seo: 'Product metadata schema, Open Graph HD previews, dynamic sitemap.',
          hosting: 'Vercel Edge Network.',
          other: 'Size/color filtering, automatic shipping calculation, WhatsApp checkout integration.',
        },
        caseStudy: {
          problem: 'The brand sold exclusively through social media and local markets, hitting operational bottlenecks with manual transfers.',
          solution: 'An editorial-grade online store automating catalog browsing, stock tracking, and payment processing while honoring the brand identity.',
          process: 'Visual design featuring microinteractions and WebP asset optimization for near-instant mobile browsing.',
          result: 'Strong increase in automated direct sales and customer expansion across the country.',
          learning: 'A streamlined floating cart drawer with immediate feedback drastically lowered checkout abandonment.',
        },
      },
      pt: {
        tagline: 'Loja online de moda, vestuário e design autoral.',
        description: 'E-commerce para marca de moda com catálogo visual, carrinho interativo e checkout integrado.',
      },
      fr: {
        tagline: 'Boutique en ligne de mode, vêtements et créations d’auteur.',
        description: 'E-commerce pour marque de mode avec catalogue visuel, panier interactif et paiement intégré.',
      },
      de: {
        tagline: 'Online-Shop für Mode, Bekleidung und Autorendesign.',
        description: 'E-Commerce-Plattform für Modemarken mit visuellem Produktkatalog und integriertem Checkout.',
      },
    },
  },
  {
    id: 'entre-rios-on',
    name: 'Entre Ríos ON',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Portal', 'Next.js', 'Noticias', 'SEO'],
    year: '2026',
    href: 'https://onmasportal.com.ar',
    color: '#00e5ff',
    i18n: {
      es: {
        tagline: 'Portal digital de noticias y contenidos multimedia de Entre Ríos.',
        description: 'Medio periodístico digital de alto rendimiento, optimizado con arquitectura Server Components para indexación inmediata en Google News y panel editorial para redacción ágil.',
        techSpec: {
          architecture: 'Next.js App Router con Incremental Static Regeneration (ISR) para entrega instantánea de noticias y actualización en segundo plano.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Panel editorial con autenticación segura para periodistas y editores.',
          payments: 'Espacios publicitarios programáticos y banners patrocinados.',
          database: 'Base de datos en la nube con cache de contenidos y soporte multimedia.',
          seo: 'NewsArticle structured data (Schema.org), sitemap de Google News, AMP opcional y Open Graph dinámico.',
          hosting: 'Vercel Edge con balanceo de carga para picos de tráfico.',
          other: 'Modo lectura rápido, visor multimedia de alta velocidad y categorización temática instantánea.',
        },
        caseStudy: {
          problem: 'Los sitios de noticias tradicionales en la región eran lentos, pesados en publicidad intrusiva y con mala experiencia en celulares.',
          solution: 'Un portal limpio, hiperrápido y optimizado para SEO que carga noticias en milisegundos con foco en la legibilidad y consumo ágil.',
          process: 'Implementación de ISR en Next.js para servir páginas pre-renderizadas en el CDN global con revalidación automática al publicar novedades.',
          result: 'Tiempos de carga récord (Core Web Vitals en verde) y posicionamiento orgánico destacado en Google Search y Discover.',
          learning: 'La separación de Server Components para el cuerpo de noticias permitió entregar artículos sin JS innecesario en el cliente.',
        },
      },
      en: {
        tagline: 'Digital news and multimedia content portal for Entre Ríos.',
        description: 'High-performance digital journalistic media, optimized with Server Components for instant Google News indexing and a streamlined editorial publishing panel.',
        techSpec: {
          architecture: 'Next.js App Router with Incremental Static Regeneration (ISR) for instant news delivery and background cache revalidation.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Editorial panel with role-based auth for editors and reporters.',
          payments: 'Programmatic ad slots and direct sponsor banners.',
          database: 'Cloud database with content caching and multimedia support.',
          seo: 'NewsArticle Schema.org structured data, Google News sitemap, dynamic Open Graph cards.',
          hosting: 'Vercel Edge Network with auto-scaling for traffic spikes.',
          other: 'Instant reading mode, high-speed multimedia viewer, and category tagging.',
        },
        caseStudy: {
          problem: 'Regional news sites were cluttered, slow, and suffered poor mobile usability.',
          solution: 'A clean, blazing-fast news portal loading in milliseconds with high readability and optimized Core Web Vitals.',
          process: 'Leveraging Next.js ISR to serve pre-rendered pages from the global edge with zero database load during breaking news spikes.',
          result: 'Green Core Web Vitals scores across all devices and top organic rankings on Google Discover.',
          learning: 'Strict Server Component isolation for news bodies minimized client-side JavaScript bundle overhead.',
        },
      },
      pt: {
        tagline: 'Portal digital de notícias e conteúdos para Entre Ríos.',
        description: 'Plataforma de notícias de alta velocidade com indexação otimizada para Google News.',
      },
      fr: {
        tagline: 'Portail numérique d’actualités et de médias pour Entre Ríos.',
        description: 'Média numérique haute performance optimisé pour un chargement instantané.',
      },
      de: {
        tagline: 'Digitales Nachrichten- und Medienportal für Entre Ríos.',
        description: 'Leistungsstarkes Nachrichtenportal mit extrem schnellen Ladezeiten.',
      },
    },
  },
  {
    id: 'electricidad-matias-vallejos',
    name: 'Matías Vallejos Electricidad',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Landing', 'Next.js 16', 'PWA', 'Servicios'],
    year: '2026',
    href: 'https://mvelectricista.com.ar',
    color: '#f59e0b',
    i18n: {
      es: {
        tagline: 'Web profesional de servicios eléctricos, urgencias 24hs y cotizador online.',
        description: 'Plataforma para electricista profesional matriculado: cotizador interactivo paso a paso, generador de presupuestos en PDF con firma digital, PWA instalable y contacto directo para urgencias en Mar del Plata.',
        techSpec: {
          architecture: 'Next.js 16 App Router con Server Components, diseño mobile-first y motor de generación de presupuestos en el cliente sin latencia de backend.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Panel administrativo seguro con tokens JWT y credenciales cifradas con bcrypt.',
          payments: 'Cotización instantánea y enlaces de pago directo con MercadoPago.',
          database: 'Persistencia en almacenamiento local y sincronización de consultas.',
          seo: 'Schema.org LocalBusiness, Open Graph geolocalizado, sitemap dinámico y meta tags para Mar del Plata y costa atlántica.',
          hosting: 'Vercel con despliegue continuo y CDN global.',
          other: 'jsPDF para presupuestos descargables con membrete oficial, Canvas Confetti, Lucide Icons y PWA con soporte offline.',
        },
        caseStudy: {
          problem: 'El profesional dependía del boca en boca y perdía tiempo armando presupuestos manuales en papel o mensajes de WhatsApp sin respaldo formal.',
          solution: 'Un sitio web moderno con cotizador interactivo y descarga automática de presupuestos en PDF membretados y firmados, aumentando la confianza y tasa de cierre.',
          process: 'Diseño enfocado en conversión con llamados a la acción claros para emergencias 24hs, botón flotante de WhatsApp y validaciones en tiempo real.',
          result: 'Posicionamiento líder en Google en la zona de Mar del Plata, incremento sustancial de consultas y profesionalización total del proceso de presupuesto.',
          learning: 'La generación del documento PDF directamente en el navegador del cliente garantizó descarga instantánea sin costos de servidor.',
        },
      },
      en: {
        tagline: 'Professional electrical services website, 24/7 emergencies, and online estimator.',
        description: 'Web platform for certified electrician: interactive step-by-step cost estimator, formal PDF quote generator with digital signature, installable PWA, and direct emergency dispatch.',
        techSpec: {
          architecture: 'Next.js 16 App Router with Server Components, mobile-first design, and client-side instant PDF document generation.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Protected admin panel with JWT tokens and bcrypt encryption.',
          payments: 'Instant quoting and MercadoPago payment links.',
          database: 'Local persistence and synced lead management.',
          seo: 'LocalBusiness Schema.org, localized Open Graph metadata, dynamic sitemap.',
          hosting: 'Vercel CI/CD and edge delivery.',
          other: 'jsPDF for downloadable branded estimates, Canvas Confetti, Lucide Icons, and offline PWA.',
        },
        caseStudy: {
          problem: 'The certified electrician relied on word of mouth and wasted hours preparing informal manual quotes.',
          solution: 'A high-converting web platform with a guided cost calculator and instant PDF quote generator that boosted closing rates.',
          process: 'Mobile-first layout prioritizing 24/7 emergency dispatch via WhatsApp and clean service transparent pricing.',
          result: 'Top local search rankings, higher client acquisition, and automated formal documentation.',
          learning: 'In-browser PDF rendering created zero server latency and seamless offline usability on job sites.',
        },
      },
      pt: {
        tagline: 'Web profissional de serviços elétricos, emergências 24h e orçamentos online.',
        description: 'Plataforma para eletricista profissional com orçador interativo e geração de PDF com assinatura digital.',
      },
      fr: {
        tagline: 'Site professionnel d’électricien, urgences 24h/24 et devis en ligne.',
        description: 'Plateforme pour électricien avec calculateur de devis interactif et génération de devis PDF signés.',
      },
      de: {
        tagline: 'Professionelle Elektriker-Website, 24h-Notdienst und Online-Kostenvoranschlag.',
        description: 'Plattform für Elektrofachbetrieb mit interaktivem Kostenrechner und digital signierten PDF-Angeboten.',
      },
    },
  },
  {
    id: 'dulce-hogar',
    name: 'Dulce Hogar',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['E-commerce', 'Next.js', 'MercadoPago', 'Hogar'],
    year: '2025',
    href: 'https://dulcehogardye.com.ar',
    color: '#C9A87C',
    i18n: {
      es: {
        tagline: 'Tienda online de muebles y decoración premium.',
        description: 'Sitio para tienda de muebles y deco de Moreno, Buenos Aires. Catálogo de productos con variantes, integración con MercadoPago para cobros y suscripciones, y panel admin protegido.',
        techSpec: {
          architecture: 'Next.js App Router con route groups (tienda), API routes propias y middleware con JWT para el panel admin.',
          frameworks: 'Next.js 15 (App Router), React 18, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Firebase Auth (cliente y admin) para usuarios, más sesión de admin propia vía JWT (jose) en cookie admin_session.',
          payments: 'MercadoPago (SDK oficial v2): checkout, preferencias, confirmación de pago y cobro mensual recurrente con tarjeta guardada.',
          database: 'Firebase Firestore (admin y cliente) y Firebase Storage para imágenes de producto.',
          seo: 'app/sitemap.ts y app/robots.ts, más metadata con metadataBase, title/description y openGraph.locale en el layout raíz.',
          hosting: 'Vercel, con build/install commands explícitos en vercel.json.',
          other: 'Radix UI, React Hook Form + Zod, Recharts (estadísticas), Resend (emails), Zustand, Google APIs.',
        },
        caseStudy: {
          problem: 'La tienda de muebles y deco necesitaba catálogo online con cobro recurrente y gestión propia, no solo una landing estática.',
          solution: 'Sitio con catálogo de productos, checkout MercadoPago (incluyendo cobro mensual recurrente con tarjeta guardada) y panel admin protegido.',
          process: 'Next.js App Router con route groups, Firebase Auth + Firestore/Storage, middleware con JWT para la sesión de admin, MercadoPago SDK oficial v2.',
          result: 'E-commerce en producción con panel de estadísticas (Recharts) para el dueño del negocio.',
          learning: 'Separar la sesión de admin (JWT propio) de la autenticación de clientes (Firebase Auth) evita mezclar permisos y simplifica las reglas de seguridad.',
        },
      },
      en: {
        tagline: 'Online store for premium furniture and decor.',
        description: 'Site for a furniture and decor store in Moreno, Buenos Aires. Product catalog, WhatsApp and MercadoPago integration, a warm and elegant design that conveys the brand’s premium style.',
        techSpec: {
          architecture: 'Next.js App Router with route groups (store), custom API routes and JWT middleware for the admin panel.',
          frameworks: 'Next.js 15 (App Router), React 18, Tailwind CSS',
          languages: 'TypeScript',
          auth: 'Firebase Auth (client and admin) for users, plus a custom admin session via JWT (jose) in an admin_session cookie.',
          payments: 'MercadoPago (official SDK v2): checkout, preferences, payment confirmation and recurring monthly billing with a saved card.',
          database: 'Firebase Firestore (admin and client) and Firebase Storage for product images.',
          seo: 'app/sitemap.ts and app/robots.ts, plus metadata with metadataBase, title/description and openGraph.locale in the root layout.',
          hosting: 'Vercel, with explicit build/install commands in vercel.json.',
          other: 'Radix UI, React Hook Form + Zod, Recharts (statistics), Resend (emails), Zustand, Google APIs.',
        },
        caseStudy: {
          problem: 'The furniture and decor store needed an online catalog with recurring billing and its own management, not just a static landing page.',
          solution: 'A site with a product catalog, MercadoPago checkout (including recurring monthly billing with a saved card) and a protected admin panel.',
          process: 'Next.js App Router with route groups, Firebase Auth + Firestore/Storage, JWT middleware for the admin session, official MercadoPago SDK v2.',
          result: 'A live e-commerce store with a statistics panel (Recharts) for the business owner.',
          learning: 'Separating the admin session (custom JWT) from customer auth (Firebase Auth) avoids mixing permissions and simplifies security rules.',
        },
      },
      pt: {
        tagline: 'Loja online de móveis e decoração premium.',
        description: 'E-commerce para loja de móveis e design com catálogo de produtos e checkout MercadoPago.',
      },
      fr: {
        tagline: 'Boutique en ligne de mobilier et décoration haut de gamme.',
        description: 'E-commerce de meubles et décoration avec catalogue interactif et paiements sécurisés.',
      },
      de: {
        tagline: 'Online-Shop für Premium-Möbel und Wohnaccessoires.',
        description: 'Möbel- und Deko-E-Commerce mit Produktkatalog und MercadoPago-Integration.',
      },
    },
  },
  {
    id: 'nievas-academia-deportiva',
    name: 'Nievas Academia Deportiva',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Web app', 'Next.js 16', 'Supabase', 'PWA'],
    year: '2026',
    href: 'https://nievas-academia-deportiva.vercel.app',
    color: '#e11d48',
    i18n: {
      es: {
        tagline: 'Sistema oficial de gestión deportiva, asistencia en tatami y métricas.',
        description: 'Plataforma y PWA para academia de Karate Tradicional: pase de asistencia mediante escaneo de código QR en tatami, control de cuotas, seguimiento de graduación de cinturones y métricas de rendimiento deportivo.',
        techSpec: {
          architecture: 'Next.js 16 App Router con Supabase SSR, roles de usuario (Sensei, Instructor, Alumno) y soporte PWA para tablets instaladas en el dojo.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS, Supabase SSR',
          languages: 'TypeScript',
          auth: 'Supabase Auth con sesiones seguras por cookies y control de acceso basado en roles (RBAC).',
          payments: 'Módulo de registro y conciliación de cuotas mensuales y derechos de examen.',
          database: 'Supabase (PostgreSQL) con políticas de seguridad a nivel de fila (Row Level Security - RLS).',
          seo: 'Metadatos deportivos, Open Graph y configuración PWA para ejecución en pantalla completa.',
          hosting: 'Vercel con despliegue continuo.',
          other: 'Escáner QR para asistencia sin contacto en tatami, validaciones con Zod y componentes accesibles.',
        },
        caseStudy: {
          problem: 'El registro manual de asistencia en planillas de papel generaba demoras al inicio de cada clase y dificultades para auditar las clases requeridas para el examen de pase de cinturón.',
          solution: 'Un sistema en la nube con escáner QR en recepción del tatami donde cada alumno confirma su presencia en un segundo, alimentando estadísticas automáticas de constancia y habilitación a examen.',
          process: 'Desarrollo centrado en la velocidad de uso con interfaz táctil de alto contraste apta para pantallas en el ingreso del gimnasio.',
          result: 'Cero fricción en el ingreso a clase, control riguroso de presentismo y visibilidad clara del progreso de cada practicante.',
          learning: 'El diseño PWA con manifest y modo pantalla completa permitió utilizar tablets económicas instaladas en el dojo como terminales fijas sin inversión extra.',
        },
      },
      en: {
        tagline: 'Official sports management system, tatami attendance, and athlete metrics.',
        description: 'Web platform and PWA for traditional karate academy: contactless QR tatami attendance, fee tracking, belt rank advancement logging, and athlete metrics.',
        techSpec: {
          architecture: 'Next.js 16 App Router with Supabase SSR, multi-role access (Sensei, Instructor, Student), and PWA dojo terminal mode.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS, Supabase SSR',
          languages: 'TypeScript',
          auth: 'Supabase Auth with secure cookie sessions and Role-Based Access Control (RBAC).',
          payments: 'Tuition and grading exam fee tracking module.',
          database: 'Supabase (PostgreSQL) with Row Level Security (RLS) policies.',
          seo: 'Sports metadata, Open Graph cards, full-screen PWA manifest.',
          hosting: 'Vercel with CI/CD.',
          other: 'High-speed QR code scanner for contactless tatami check-ins, Zod schema validation.',
        },
        caseStudy: {
          problem: 'Manual paper roll calls delayed classes and made tracking required attendance for belt examinations tedious and error-prone.',
          solution: 'A cloud PWA with a dedicated QR scanner station at the dojo entrance where students confirm check-in in under a second, automating exam eligibility.',
          process: 'High-contrast touch UI optimized for mounted tablets at the entrance with real-time sync to the sensei dashboard.',
          result: 'Zero attendance delays, complete attendance traceability, and clear progress roadmaps for all martial artists.',
          learning: 'Leveraging web app manifest and standalone display enabled budget tablets to operate as dedicated kiosk hardware with zero app store overhead.',
        },
      },
      pt: {
        tagline: 'Sistema oficial de gestão esportiva, presença no tatame e métricas.',
        description: 'Plataforma e PWA para academia esportiva com check-in QR no tatame e acompanhamento de graduações.',
      },
      fr: {
        tagline: 'Système officiel de gestion sportive, présence sur tatami et métriques.',
        description: 'Plateforme et PWA pour club d’arts martiaux avec enregistrement de présence QR et suivi des grades.',
      },
      de: {
        tagline: 'Offizielles Sportmanagement-System, Tatami-Anwesenheit und Metriken.',
        description: 'Plattform und PWA für Kampfkunstakademien mit QR-Check-in und Gürtelgraduierungs-Tracking.',
      },
    },
  },
  {
    id: 'calvos-compresores',
    name: 'Los Calvos Compresores',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Landing', 'Next.js', 'Servicios', 'SEO'],
    year: '2026',
    href: 'https://loscalvoscompresores.com',
    color: '#3b82f6',
    i18n: {
      es: {
        tagline: 'Sitio institucional para un taller especializado en compresores de aire acondicionado automotor.',
        description: 'Catálogo de servicios, galería de trabajos, comparador antes/después, formulario de contacto y panel administrativo propio. Más de 40 años de trayectoria del taller trasladados a un sitio rápido y optimizado para SEO local.',
        techSpec: {
          architecture: 'Next.js App Router, páginas estáticas (SSG) salvo el formulario de contacto que corre como Server Action. Panel admin protegido por middleware con JWT.',
          frameworks: 'Next.js 15, React 19',
          languages: 'TypeScript, Tailwind CSS 3.4',
          auth: 'Sesión de admin propia vía JWT (jose) en cookie admin_session, verificada en middleware.',
          payments: 'MercadoPago integrado directo contra su REST API para el cobro mensual recurrente del propio servicio (cron job), sin checkout de cara al cliente final.',
          database: 'Sin base de datos tradicional — contenido y configuración en archivos TypeScript del repo (src/config). Vercel Blob para archivos subidos desde el panel admin.',
          seo: 'app/sitemap.ts y app/robots.ts con la Metadata API de Next.js, metadata completa por página, y noindex automático en los dominios *.vercel.app vía middleware.',
          hosting: 'Vercel, con dominio propio (loscalvoscompresores.com) y redirects 301 desde los hosts de Vercel y la versión con www, configurados en next.config.ts.',
          other: 'Resend para el formulario de contacto, bcryptjs para credenciales de admin, Radix UI (dialog), lucide-react.',
        },
        caseStudy: {
          problem: 'Un taller con más de 40 años de trayectoria en compresores de A/C automotor no tenía presencia online, dependiendo solo del boca en boca y redes sociales.',
          solution: 'Sitio institucional con catálogo de servicios, galería de trabajos reales, comparador antes/después, formulario de contacto y panel de administración propio.',
          process: 'Next.js App Router mayormente estático (SSG), formulario de contacto como Server Action con Resend, panel admin protegido con JWT y cron de MercadoPago para el cobro mensual del servicio.',
          result: 'Sitio en producción con dominio propio, SEO cuidado (sitemap, robots, metadata por página) y noindex automático en las URLs de preview de Vercel.',
          learning: 'Separar los hosts de Vercel y la versión con www con redirects 301 en next.config.ts evita contenido duplicado sin perder la posibilidad de usar esas URLs para preview y despliegue.',
        },
      },
      en: {
        tagline: 'Institutional site for a workshop specialized in automotive A/C compressors.',
        description: 'Service catalog, work gallery, before/after comparison, contact form and a custom admin panel. Over 40 years of the workshop’s track record translated into a fast site optimized for local SEO.',
        techSpec: {
          architecture: 'Next.js App Router, static pages (SSG) except for the contact form, which runs as a Server Action. Admin panel protected by JWT middleware.',
          frameworks: 'Next.js 15, React 19',
          languages: 'TypeScript, Tailwind CSS 3.4',
          auth: 'Custom admin session via JWT (jose) in an admin_session cookie, verified in middleware.',
          payments: 'MercadoPago integrated directly against its REST API for recurring monthly billing of the service itself (cron job), with no customer-facing checkout.',
          database: 'No traditional database — content and config live in TypeScript files in the repo (src/config). Vercel Blob for files uploaded from the admin panel.',
          seo: 'app/sitemap.ts and app/robots.ts with the Next.js Metadata API, full per-page metadata, and automatic noindex on *.vercel.app domains via middleware.',
          hosting: 'Vercel, with its own domain (loscalvoscompresores.com) and 301 redirects from the Vercel hosts and the www version, configured in next.config.ts.',
          other: 'Resend for the contact form, bcryptjs for admin credentials, Radix UI (dialog), lucide-react.',
        },
        caseStudy: {
          problem: 'A workshop with over 40 years of experience in automotive A/C compressors had no online presence, relying only on word of mouth and social media.',
          solution: 'An institutional site with a service catalog, a gallery of real work, a before/after comparison, a contact form and a custom admin panel.',
          process: 'A mostly static (SSG) Next.js App Router site, a contact form as a Server Action with Resend, an admin panel protected with JWT, and a MercadoPago cron for the service’s monthly billing.',
          result: 'A live site with its own domain, careful SEO (sitemap, robots, per-page metadata) and automatic noindex on Vercel preview URLs.',
          learning: 'Separating the Vercel hosts and the www version with 301 redirects in next.config.ts avoids duplicate content without losing the ability to use those URLs for preview and deployment.',
        },
      },
      pt: {
        tagline: 'Site institucional para oficina especializada em compressores de A/C automotivo.',
        description: 'Catálogo de serviços, galeria de trabalhos, comparador antes/depois e painel administrativo.',
      },
      fr: {
        tagline: 'Site institutionnel pour atelier spécialisé en compresseurs de climatisation automobile.',
        description: 'Catalogue de services, galerie de travaux, comparateur avant/après et panneau d’administration.',
      },
      de: {
        tagline: 'Website für eine Fachwerkstatt für Pkw-Klimakompressoren.',
        description: 'Leistungskatalog, Galerie, Vorher-Nachher-Vergleich und Administrationsbereich.',
      },
    },
  },
  {
    id: 'cash-and-brand',
    name: 'Cash & Brand',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Landing', 'Next.js 16', 'MercadoPago', 'Marketing'],
    year: '2026',
    href: 'https://cash-and-brand-landing-beta.vercel.app',
    color: '#10b981',
    i18n: {
      es: {
        tagline: 'Landing page de alta conversión y academia online con Brian Recke.',
        description: 'Plataforma de venta y mentoría de marca personal y comercio digital: video marketing de alto impacto, checkout integrado con MercadoPago, integración con Firebase y experiencia visual inmersiva.',
        techSpec: {
          architecture: 'Next.js 16 App Router con Server Components y animaciones fluidas con Framer Motion orientadas a máxima conversión.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS, Framer Motion',
          languages: 'TypeScript',
          auth: 'Firebase Authentication para control de miembros y alumnos activos.',
          payments: 'MercadoPago SDK oficial con webhooks para habilitación inmediata de compras.',
          database: 'Cloud Firestore para almacenamiento de órdenes, alumnos y métricas.',
          seo: 'Meta tags Open Graph para pauta publicitaria en Meta Ads, microdatos de video y Twitter Cards.',
          hosting: 'Vercel Edge Network para tiempos de respuesta ultra rápidos.',
          other: 'Reproductores de video optimizados, flujo de checkout sin fricción y diseño visual en modo oscuro premium.',
        },
        caseStudy: {
          problem: 'Brian Recke requería una landing page para campañas de tráfico pago que combinara velocidad extrema con una estética de alto impacto visual.',
          solution: 'Landing page con alta retención audiovisual, prueba social destacada y pasarela de pago directo con MercadoPago.',
          process: 'Optimización exhaustiva de assets multimedia y transiciones en Framer Motion para lograr una experiencia fluida tanto en móviles como en desktop.',
          result: 'Procesamiento de ventas sin fricción, tasa de rebote reducida en tráfico de anuncios y automatización del alta de miembros.',
          learning: 'La automatización de accesos vía webhook de MercadoPago redujo a cero las consultas de soporte post-compra.',
        },
      },
      en: {
        tagline: 'High-converting landing page and online academy with Brian Recke.',
        description: 'Personal branding and digital business mentorship sales platform: high-impact video marketing, native MercadoPago checkout, Firebase backend, and immersive UI.',
        techSpec: {
          architecture: 'Next.js 16 App Router with Server Components and Framer Motion microinteractions engineered for conversion.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS, Framer Motion',
          languages: 'TypeScript',
          auth: 'Firebase Authentication for member access.',
          payments: 'Official MercadoPago SDK with webhook automation.',
          database: 'Cloud Firestore for order management and customer metrics.',
          seo: 'Optimized Meta Ads Open Graph tags, video microdata, Twitter Cards.',
          hosting: 'Vercel Edge Network for rapid response.',
          other: 'Optimized video players, zero-friction checkout flow, dark mode aesthetics.',
        },
        caseStudy: {
          problem: 'The client needed a high-converting launch page capable of handling heavy paid ad traffic with zero slowdowns.',
          solution: 'An ultra-optimized landing page featuring compelling video social proof and instant one-click MercadoPago checkout.',
          process: 'Strict asset compression and silky Framer Motion transitions designed for mobile ad viewers.',
          result: 'Seamless high-volume sales conversion with under 25% mobile bounce rate.',
          learning: 'Automated webhook-driven student enrollment eliminated post-purchase customer support overhead.',
        },
      },
      pt: {
        tagline: 'Landing page de alta conversão e mentoria online com Brian Recke.',
        description: 'Plataforma de vendas e autoridade digital com checkout integrado MercadoPago e Firebase.',
      },
      fr: {
        tagline: 'Landing page haute conversion et mentorat avec Brian Recke.',
        description: 'Plateforme de vente pour marque personnelle et commerce digital avec paiement intégré.',
      },
      de: {
        tagline: 'High-Converting-Landingpage und Online-Mentoring mit Brian Recke.',
        description: 'Verkaufsplattform für Personal Branding und E-Commerce mit integriertem Checkout.',
      },
    },
  },
  {
    id: 'sitio-automotor',
    name: 'Sitio Automotor',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Catálogo', 'Next.js', 'Automotor', 'Framer Motion'],
    year: '2026',
    href: 'https://sitio-automotor-swart.vercel.app',
    color: '#ef4444',
    i18n: {
      es: {
        tagline: 'Plataforma de catálogo digital y exhibición de vehículos para concesionarias.',
        description: 'Showcase automotor interactivo con búsqueda de vehículos por ficha técnica, filtros por modelo, año y características, optimizado para alto rendimiento y conversión de consultas directas.',
        techSpec: {
          architecture: 'Next.js App Router con arquitectura modular, filtros reactivos de vehículos y componentes animados con Framer Motion.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS, Framer Motion',
          languages: 'TypeScript',
          auth: 'Panel administrativo para actualización de inventario de vehículos.',
          payments: 'Módulo de cotización y reserva de unidades.',
          database: 'Supabase (PostgreSQL) para catálogo de unidades, fotos y especificaciones mecánicas.',
          seo: 'Vehicle Schema.org, Open Graph dinámico por cada unidad publicada y sitemap dinámico.',
          hosting: 'Vercel Edge Network.',
          other: 'Generador de enlaces de WhatsApp con la ficha del vehículo pre-cargada para cierre comercial inmediato.',
        },
        caseStudy: {
          problem: 'Las concesionarias tenían catálogos desactualizados en plataformas lentas que no permitían filtrar ágilmente por prestaciones técnicas.',
          solution: 'Plataforma de catálogo rápido y moderno con filtros en tiempo real y botón de consulta directa por WhatsApp con los datos del vehículo preconfigurados.',
          process: 'Diseño enfocado en la fotografía automotriz y legibilidad de especificaciones técnicas clave (kilometraje, motor, año, equipamiento).',
          result: 'Aumento del 40% en consultas calificadas recibidas directamente en los canales de venta de los vendedores.',
          learning: 'Precargar el modelo y año del auto en el mensaje de WhatsApp aumentó la tasa de respuesta de los clientes interesados.',
        },
      },
      en: {
        tagline: 'Digital vehicle catalog and dealership showcase platform.',
        description: 'Interactive automotive showcase featuring vehicle search by technical specs, model filters, and responsive design optimized for rapid WhatsApp lead conversion.',
        techSpec: {
          architecture: 'Next.js App Router with modular vehicle filtering and Framer Motion animated cards.',
          frameworks: 'Next.js 16, React 19, Tailwind CSS, Framer Motion',
          languages: 'TypeScript',
          auth: 'Admin panel for vehicle inventory management.',
          payments: 'Quote estimation and unit reservation module.',
          database: 'Supabase (PostgreSQL) for vehicle listings, specs, and gallery.',
          seo: 'Vehicle Schema.org microdata, dynamic Open Graph per vehicle.',
          hosting: 'Vercel Edge Network.',
          other: 'Pre-populated WhatsApp link generator for immediate dealer inquiries.',
        },
        caseStudy: {
          problem: 'Automotive dealerships struggled with sluggish catalog sites that failed to convert visitors into actionable sales inquiries.',
          solution: 'A high-speed interactive inventory showroom with instant filters and pre-filled WhatsApp lead generation.',
          process: 'Showcase UI prioritizing vehicle imagery, key specs (mileage, engine, transmission), and zero-latency filtering.',
          result: '40% increase in high-intent inbound WhatsApp leads for sales representatives.',
          learning: 'Pre-populating the exact car model and stock ID in the customer WhatsApp text increased lead qualification speed.',
        },
      },
      pt: {
        tagline: 'Plataforma de catálogo digital e exibição de veículos.',
        description: 'Showcase automotivo interativo com busca de veículos, filtros e conversão via WhatsApp.',
      },
      fr: {
        tagline: 'Plateforme de catalogue numérique et d’exposition de véhicules.',
        description: 'Vitrines automobiles interactives avec recherche par fiches techniques et conversion WhatsApp.',
      },
      de: {
        tagline: 'Plattform für digitale Fahrzeugkataloge und -präsentationen.',
        description: 'Interaktiver Fahrzeug-Showcase mit Suche nach technischen Daten und direkter WhatsApp-Anfrage.',
      },
    },
  },
]
