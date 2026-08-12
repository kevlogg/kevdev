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
}

function translateTag(tag: string, locale: Locale): string {
  return TAG_TRANSLATIONS[tag]?.[locale] ?? tag
}

/**
 * Deep-dive content (techSpec/caseStudy) is only fully translated for es/en.
 * pt/fr/de fall back to the English version rather than leaving the modal empty.
 */
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
    statusKey: 'ready',
    statusDot: 'var(--color-accent)',
    tags: ['Web app', 'SaaS', 'Firebase', 'React'],
    year: '2025',
    href: 'https://kronitt.com.ar',
    color: '#d4a017',
    i18n: {
      es: {
        tagline: 'Sistema de turnos y gestión para el sector estética.',
        description: 'Reservas online, panel administrativo y automatizaciones de recordatorios. Pensado para barberías, peluquerías y centros de estética que quieren profesionalizar su operación y crecer.',
        techSpec: {
          architecture: 'Next.js App Router con API routes propias, deploy en Vercel con 5 cron jobs para recordatorios y cobro automático de suscripciones.',
          frameworks: 'Next.js 14 (App Router), React 18',
          languages: 'TypeScript',
          auth: 'Firebase Auth',
          payments: 'MercadoPago integrado directo contra su REST API (sin SDK npm): checkout, guardado de tarjeta, webhook de notificaciones y cobro automático de suscripciones vía cron.',
          database: 'Firebase Firestore, con Supabase como dependencia puntual adicional.',
          seo: 'Metadata básica en app/layout.tsx (title, description, Open Graph). Sin sitemap ni robots.txt dedicados.',
          hosting: 'Vercel, con cron jobs configurados en vercel.json.',
          other: 'Framer Motion, Recharts, react-big-calendar, date-fns/moment, Resend para envío de emails.',
        },
        caseStudy: {
          problem: 'Barberías, peluquerías y centros de estética gestionaban turnos a mano o por WhatsApp, perdiendo tiempo y sin automatizar cobros de suscripción.',
          solution: 'SaaS de reservas online con panel administrativo, recordatorios automáticos y cobro recurrente de suscripciones vía MercadoPago.',
          process: 'Next.js App Router con API routes propias, Firebase Auth/Firestore, 5 cron jobs en Vercel para recordatorios y cobro automático, integrando la API REST de MercadoPago sin SDK.',
          result: 'Producto listo para validar con negocios reales, con automatización de recordatorios y cobros que reduce el trabajo manual del dueño del local.',
          learning: 'Integrar pagos recurrentes contra la API REST de MercadoPago sin el SDK oficial obligó a manejar webhooks y guardado de tarjeta a mano, dando control fino sobre todo el flujo de cobro.',
        },
      },
      en: {
        tagline: 'Booking and management system for the beauty industry.',
        description: 'Online bookings, an admin dashboard and automated reminders. Built for barbershops, salons and beauty centers that want to professionalize their operation and grow.',
        techSpec: {
          architecture: 'Next.js App Router with custom API routes, deployed on Vercel with 5 cron jobs for reminders and automatic subscription billing.',
          frameworks: 'Next.js 14 (App Router), React 18',
          languages: 'TypeScript',
          auth: 'Firebase Auth',
          payments: 'MercadoPago integrated directly against its REST API (no npm SDK): checkout, card storage, notification webhook and automatic subscription billing via cron.',
          database: 'Firebase Firestore, with Supabase as an additional point dependency.',
          seo: 'Basic metadata in app/layout.tsx (title, description, Open Graph). No dedicated sitemap or robots.txt.',
          hosting: 'Vercel, with cron jobs configured in vercel.json.',
          other: 'Framer Motion, Recharts, react-big-calendar, date-fns/moment, Resend for sending emails.',
        },
        caseStudy: {
          problem: 'Barbershops, hair salons and beauty centers managed bookings by hand or over WhatsApp, wasting time and with no automated subscription billing.',
          solution: 'A booking SaaS with an admin dashboard, automated reminders and recurring subscription billing via MercadoPago.',
          process: 'Next.js App Router with custom API routes, Firebase Auth/Firestore, 5 Vercel cron jobs for reminders and automatic billing, integrating the MercadoPago REST API without an SDK.',
          result: 'Ready to validate with real businesses, with reminder and billing automation that cuts down the owner’s manual work.',
          learning: 'Integrating recurring payments against the MercadoPago REST API without the official SDK meant handling webhooks and card storage by hand, giving fine-grained control over the entire billing flow.',
        },
      },
      pt: {
        tagline: 'Sistema de agendamento e gestão para o setor de estética.',
        description: 'Reservas online, painel administrativo e lembretes automatizados. Pensado para barbearias, salões e centros de estética que querem profissionalizar a operação e crescer.',
      },
      fr: {
        tagline: 'Système de réservation et de gestion pour le secteur de l’esthétique.',
        description: 'Réservations en ligne, tableau de bord administratif et rappels automatisés. Pensé pour les salons de coiffure et instituts de beauté qui veulent professionnaliser leur activité et grandir.',
      },
      de: {
        tagline: 'Buchungs- und Verwaltungssystem für die Beauty-Branche.',
        description: 'Online-Buchungen, ein Admin-Dashboard und automatisierte Erinnerungen. Entwickelt für Friseursalons und Beauty-Center, die ihren Betrieb professionalisieren und wachsen wollen.',
      },
    },
  },
  {
    id: 'experience-fly',
    name: 'Experience Fly',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Next.js', 'Three.js', 'Framer Motion', 'IA'],
    year: '2025',
    href: 'https://experience-fly.vercel.app/',
    color: '#38bdf8',
    i18n: {
      es: {
        tagline: 'Landing inmersiva para una aerolínea de experiencias premium.',
        description: 'Cockpit 3D interactivo con scroll, planificador de vuelos, sección de destinos y asistente IA integrado. Proyecto de diseño y desarrollo frontend de alto impacto visual.',
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
        caseStudy: {
          problem: 'Mostrar la propuesta de una aerolínea de experiencias premium necesitaba una landing con alto impacto visual, no un sitio informativo plano.',
          solution: 'Landing inmersiva con cockpit 3D interactivo controlado por scroll, planificador de vuelos, sección de destinos y asistente IA integrado.',
          process: 'Next.js con React Three Fiber/drei/three.js para las escenas 3D, Framer Motion y Lenis para el smooth scroll, Zustand para estado, con tests en Vitest.',
          result: 'Showcase en producción que funciona como pieza de portfolio de alto impacto visual, sin necesidad de backend propio.',
          learning: 'Sincronizar animaciones 3D con scroll narrativo exige ajustar el smooth scroll y el rendimiento de Three.js para que se sienta fluido incluso en dispositivos de gama media.',
        },
      },
      en: {
        tagline: 'Immersive landing page for a premium experiences airline.',
        description: 'Interactive 3D cockpit driven by scroll, flight planner, destinations section and a built-in AI assistant. A design and frontend project with high visual impact.',
        techSpec: {
          architecture: 'Next.js App Router as a 3D/animation showcase, with no backend of its own.',
          frameworks: 'Next.js 16, React 19',
          languages: 'TypeScript',
          auth: 'Not applicable — no authentication.',
          payments: 'Not applicable.',
          database: 'Not applicable — no backend or database.',
          seo: 'Basic metadata in app/layout.tsx (title, description). No dedicated sitemap or robots.txt.',
          hosting: 'Vercel, standard Next.js configuration.',
          other: 'React Three Fiber + drei + three.js (3D scenes), Framer Motion, Lenis (smooth scroll), Zustand, Tailwind CSS 4, Vitest.',
        },
        caseStudy: {
          problem: 'Showcasing a premium experiences airline’s pitch needed a landing page with real visual impact, not a flat informational site.',
          solution: 'An immersive landing page with an interactive 3D cockpit controlled by scroll, a flight planner, a destinations section and a built-in AI assistant.',
          process: 'Next.js with React Three Fiber/drei/three.js for the 3D scenes, Framer Motion and Lenis for smooth scroll, Zustand for state, with Vitest tests.',
          result: 'A production showcase that works as a high-impact portfolio piece, with no need for a backend of its own.',
          learning: 'Syncing 3D animation with scroll-driven storytelling requires tuning smooth scroll and Three.js performance so it feels fluid even on mid-range devices.',
        },
      },
      pt: {
        tagline: 'Landing imersiva para uma companhia aérea de experiências premium.',
        description: 'Cockpit 3D interativo com scroll, planejador de voos, seção de destinos e assistente de IA integrado. Projeto de design e desenvolvimento frontend de alto impacto visual.',
      },
      fr: {
        tagline: 'Landing immersive pour une compagnie aérienne d’expériences premium.',
        description: 'Cockpit 3D interactif piloté par le scroll, planificateur de vols, section destinations et assistant IA intégré. Projet de design et de développement frontend à fort impact visuel.',
      },
      de: {
        tagline: 'Immersive Landingpage für eine Airline für Premium-Erlebnisse.',
        description: 'Interaktives 3D-Cockpit mit Scroll-Steuerung, Flugplaner, Zielsektion und integriertem KI-Assistenten. Design- und Frontend-Projekt mit hoher visueller Wirkung.',
      },
    },
  },
  {
    id: 'growai',
    name: 'GrowAi',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Mobile web', 'Firebase', 'IA', 'Comunidad'],
    year: '2025',
    href: 'https://growai.com.ar',
    color: '#34d399',
    i18n: {
      es: {
        tagline: 'App de seguimiento de cultivo, diagnóstico y comunidad de nicho.',
        description: 'Seguimiento de ciclos, registro de acciones, diagnóstico asistido por imágenes y comunidad integrada. Producto de nicho con visión de utilidad real y retención por engagement.',
        techSpecs: [
          {
            label: 'Web (growai.com.ar)',
            spec: {
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
            label: 'GrowApp — App (Android / iOS / Web)',
            spec: {
              architecture: 'App Flutter multiplataforma (Android, iOS, Web) organizada por servicios (Auth, Cultivo, Diagnóstico) sobre Firebase como backend.',
              frameworks: 'Flutter 3.x / Dart 3.x, go_router para navegación.',
              languages: 'Dart',
              auth: 'Firebase Auth con Google Sign-In y Sign in with Apple.',
              payments: 'Suscripciones vía Google Play Billing (in_app_purchase) y StoreKit en iOS. MercadoPago quedó desactivado en la app (se usa solo en la web para diagnósticos).',
              database: 'Firebase Firestore, Firebase Storage (fotos de cultivo) y Firebase Cloud Functions.',
              seo: 'No aplica — app nativa/PWA sin contenido indexable.',
              hosting: 'Firebase Hosting para el build web, distribución nativa vía Google Play y App Store.',
              other: 'OpenAI GPT-4 Vision para diagnóstico de imágenes de cultivo, Algolia para búsqueda, Firebase Analytics/Crashlytics/Performance, generación de reportes en PDF.',
            },
          },
        ],
        caseStudy: {
          problem: 'Cultivadores de cannabis medicinal no tenían un lugar centralizado para seguir sus ciclos de cultivo, diagnosticar problemas a tiempo ni acceder a comunidad y trámites legales (REPROCANN).',
          solution: 'Ecosistema de dos productos conectados: la web growai.com.ar como puerta de entrada informativa, y GrowApp, la app multiplataforma con diagnóstico por foto vía IA, seguimiento de cultivos y comunidad.',
          process: 'Web estática con Eleventy desplegada en Vercel para captar y convertir visitas; app en Flutter con Firebase como backend (Auth, Firestore, Storage, Functions), OpenAI GPT-4 Vision para el diagnóstico por imagen y Google Play Billing/StoreKit para las suscripciones.',
          result: 'Producto de nicho en producción en Android, iOS y Web, con retención sostenida por el valor real de diagnóstico asistido y comunidad, no solo por contenido informativo.',
          learning: 'Mantener dos codebases (web estática y app Flutter) para un mismo producto obliga a definir con claridad qué lógica vive en cada capa, sobre todo en pagos, para no terminar con dos sistemas de suscripción divergentes.',
        },
      },
      en: {
        tagline: 'Growing tracker, diagnosis and niche community app.',
        description: 'Cycle tracking, action logging, image-assisted diagnosis and a built-in community. A niche product focused on real utility and engagement-driven retention.',
        techSpecs: [
          {
            label: 'Web (growai.com.ar)',
            spec: {
              architecture: 'Static site generated with Eleventy (11ty), deployed on Vercel from the _site folder.',
              frameworks: 'Eleventy (11ty) 2.0 as the static site generator',
              languages: 'JavaScript, Nunjucks templates (.njk), Tailwind CSS 3.4',
              auth: 'Not applicable — static site with no login.',
              payments: 'Not verified in this repo.',
              database: 'Not applicable. Contact forms via EmailJS.',
              seo: 'robots.txt referencing the sitemap, sitemap.njk generating sitemap.xml, and dynamic OG/Twitter meta tags per page (title, description, og:title, og:url, og:image).',
              hosting: 'Vercel, with strict security headers (CSP, HSTS, X-Frame-Options) defined in vercel.json.',
              other: 'Lottie animations, custom video assets.',
            },
          },
          {
            label: 'GrowApp — App (Android / iOS / Web)',
            spec: {
              architecture: 'Cross-platform Flutter app (Android, iOS, Web) organized by services (Auth, Growing, Diagnosis) on top of Firebase as the backend.',
              frameworks: 'Flutter 3.x / Dart 3.x, go_router for navigation.',
              languages: 'Dart',
              auth: 'Firebase Auth with Google Sign-In and Sign in with Apple.',
              payments: 'Subscriptions via Google Play Billing (in_app_purchase) and StoreKit on iOS. MercadoPago was disabled in the app (only used on the web for diagnostics).',
              database: 'Firebase Firestore, Firebase Storage (grow photos) and Firebase Cloud Functions.',
              seo: 'Not applicable — native/PWA app with no indexable content.',
              hosting: 'Firebase Hosting for the web build, native distribution via Google Play and the App Store.',
              other: 'OpenAI GPT-4 Vision for image-based grow diagnosis, Algolia for search, Firebase Analytics/Crashlytics/Performance, PDF report generation.',
            },
          },
        ],
        caseStudy: {
          problem: 'Medicinal cannabis growers had no centralized place to track their growing cycles, diagnose problems in time, or access community and legal procedures (REPROCANN).',
          solution: 'An ecosystem of two connected products: the growai.com.ar website as an informational entry point, and GrowApp, the cross-platform app with photo-based AI diagnosis, growing tracking and community.',
          process: 'A static website with Eleventy deployed on Vercel to capture and convert visits; a Flutter app with Firebase as the backend (Auth, Firestore, Storage, Functions), OpenAI GPT-4 Vision for photo-based diagnosis, and Google Play Billing/StoreKit for subscriptions.',
          result: 'A niche product in production on Android, iOS and Web, with sustained retention driven by the real value of assisted diagnosis and community, not just informational content.',
          learning: 'Maintaining two codebases (static web and Flutter app) for the same product forces you to clearly define what logic lives in each layer, especially around payments, to avoid ending up with two diverging subscription systems.',
        },
      },
      pt: {
        tagline: 'App de acompanhamento de cultivo, diagnóstico e comunidade de nicho.',
        description: 'Acompanhamento de ciclos, registro de ações, diagnóstico assistido por imagens e comunidade integrada. Produto de nicho com foco em utilidade real e retenção por engajamento.',
      },
      fr: {
        tagline: 'Application de suivi de culture, diagnostic et communauté de niche.',
        description: 'Suivi des cycles, journal des actions, diagnostic assisté par image et communauté intégrée. Produit de niche axé sur une utilité réelle et la rétention par l’engagement.',
      },
      de: {
        tagline: 'App zur Anbau-Verfolgung, Diagnose und Nischen-Community.',
        description: 'Zyklus-Tracking, Protokollierung von Maßnahmen, bildgestützte Diagnose und integrierte Community. Nischenprodukt mit Fokus auf echtem Nutzen und Bindung durch Engagement.',
      },
    },
  },
  {
    id: 'bad-bee',
    name: 'Bad Bee',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Next.js', 'Landing', 'Branding'],
    year: '2025',
    href: 'https://v0-bad-bee-landing-page-ng5w.vercel.app/',
    color: '#fbbf24',
    i18n: {
      es: {
        tagline: 'Landing para una marca de miel artesanal.',
        description: 'Sitio de presentación para Bad Bee, marca de miel con identidad visual fuerte. Diseño limpio, orientado a conversión y con foco en transmitir autenticidad del producto.',
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
        caseStudy: {
          problem: 'Una marca de miel artesanal necesitaba presencia online que transmitiera autenticidad, sin invertir en un e-commerce propio.',
          solution: 'Landing de conversión que deriva la compra a WhatsApp y Mercado Libre, evitando la complejidad de una pasarela de pago propia.',
          process: 'Next.js generado originalmente con v0, componentes shadcn/Radix UI y un fondo hexagonal interactivo hecho a medida.',
          result: 'Sitio en producción que cumple su objetivo de conversión sin la complejidad de un checkout propio.',
          learning: 'No todo negocio necesita e-commerce propio: derivar la compra a canales externos (WhatsApp, Mercado Libre) puede ser la solución más simple y correcta para el volumen real del negocio.',
        },
      },
      en: {
        tagline: 'Landing page for an artisanal honey brand.',
        description: 'Presentation site for Bad Bee, a honey brand with a strong visual identity. Clean, conversion-oriented design focused on conveying the product’s authenticity.',
        techSpec: {
          architecture: 'Single-page landing (page.tsx), no API routes or backend of its own. Originally generated with v0.',
          frameworks: 'Next.js 14.2 (App Router), React 18',
          languages: 'TypeScript',
          auth: 'Not applicable.',
          payments: 'Not applicable — purchases are routed to external WhatsApp and Mercado Libre, with no payment gateway of its own.',
          database: 'Not applicable.',
          seo: 'Full metadata in layout.tsx (title, description, keywords, canonical, metadataBase, Open Graph with image, Twitter Card, robots/googleBot control). No sitemap.ts or robots.ts.',
          hosting: 'Vercel (badbee.com.ar domain in metadata, no explicit vercel.json).',
          other: 'shadcn/Radix UI, @vercel/analytics, next-themes, Geist font, custom interactive hexagonal background.',
        },
        caseStudy: {
          problem: 'An artisanal honey brand needed an online presence that conveyed authenticity, without investing in its own e-commerce.',
          solution: 'A conversion-focused landing page that routes purchases to WhatsApp and Mercado Libre, avoiding the complexity of a payment gateway.',
          process: 'Next.js originally generated with v0, shadcn/Radix UI components and a custom interactive hexagonal background.',
          result: 'A live site that meets its conversion goal without the complexity of a payment checkout.',
          learning: 'Not every business needs its own e-commerce: routing purchases to external channels (WhatsApp, Mercado Libre) can be the simplest, correct solution for the business’s real volume.',
        },
      },
      pt: {
        tagline: 'Landing page para uma marca de mel artesanal.',
        description: 'Site de apresentação para a Bad Bee, marca de mel com identidade visual forte. Design limpo, orientado à conversão e focado em transmitir a autenticidade do produto.',
      },
      fr: {
        tagline: 'Landing page pour une marque de miel artisanal.',
        description: 'Site de présentation pour Bad Bee, une marque de miel à l’identité visuelle forte. Design épuré, orienté conversion, axé sur l’authenticité du produit.',
      },
      de: {
        tagline: 'Landingpage für eine handwerkliche Honigmarke.',
        description: 'Präsentationsseite für Bad Bee, eine Honigmarke mit starker visueller Identität. Klares, konversionsorientiertes Design mit Fokus auf die Authentizität des Produkts.',
      },
    },
  },
  {
    id: 'nexo',
    name: 'Nexo',
    statusKey: 'building',
    statusDot: 'rgba(221,232,255,0.25)',
    tags: ['React', 'Firebase', 'Tiempo real', 'Mobile web'],
    year: '2025',
    href: 'https://nexo-seven-nu.vercel.app/',
    color: '#f472b6',
    i18n: {
      es: {
        tagline: 'App para parejas con sincronización en tiempo real.',
        description: 'Estado emocional, mensajes, necesidades y gestos de amor sincronizados al instante. Construida con Firebase Realtime y notificaciones push para mantener la conexión activa entre dos personas.',
        techSpec: {
          architecture: 'SPA de React con Vite y routing client-side (react-router-dom), con rewrites en Vercel para servir index.html.',
          frameworks: 'React 18 + Vite 5 (SPA, sin Next.js)',
          languages: 'TypeScript',
          auth: 'Firebase Auth con Google Sign-In (signInWithPopup / GoogleAuthProvider).',
          payments: 'No verificado — sin integración encontrada.',
          database: 'Firebase Firestore (dos bases: default y nexoidfirestore) con reglas propias, más Cloud Functions.',
          seo: 'No aplica — SPA privada, sin metadata dinámica ni sitemap.',
          hosting: 'Vercel para el frontend (SPA rewrite), Firebase (Firestore + Functions) para el backend.',
          other: 'Sincronización en tiempo real entre parejas vía Firestore onSnapshot (useCouple, useGoals, usePartnerProfile, useTasks), push notifications con Firebase Cloud Messaging (VAPID key), Tailwind CSS 3.4.',
        },
        caseStudy: {
          problem: 'Las parejas necesitaban una forma de compartir estado emocional y gestos de cariño en tiempo real, más allá de la mensajería genérica.',
          solution: 'App con sincronización instantánea de estado emocional, mensajes, necesidades y gestos de amor entre dos personas, con notificaciones push.',
          process: 'React + Vite (SPA) con Firebase Auth (Google Sign-In), Firestore con onSnapshot para tiempo real, Cloud Functions y Firebase Cloud Messaging para las push.',
          result: 'En construcción, con la sincronización en tiempo real ya funcionando como núcleo del producto.',
          learning: 'Diseñar hooks dedicados (useCouple, useGoals, usePartnerProfile, useTasks) sobre Firestore simplifica mantener sincronizado el estado entre dos usuarios sin repetir lógica.',
        },
      },
      en: {
        tagline: 'Real-time syncing app for couples.',
        description: 'Emotional state, messages, needs and love gestures synced instantly. Built with Firebase real-time sync and push notifications to keep the connection active between two people.',
        techSpec: {
          architecture: 'React SPA with Vite and client-side routing (react-router-dom), with Vercel rewrites to serve index.html.',
          frameworks: 'React 18 + Vite 5 (SPA, no Next.js)',
          languages: 'TypeScript',
          auth: 'Firebase Auth with Google Sign-In (signInWithPopup / GoogleAuthProvider).',
          payments: 'Not verified — no integration found.',
          database: 'Firebase Firestore (two databases: default and nexoidfirestore) with custom rules, plus Cloud Functions.',
          seo: 'Not applicable — private SPA, no dynamic metadata or sitemap.',
          hosting: 'Vercel for the frontend (SPA rewrite), Firebase (Firestore + Functions) for the backend.',
          other: 'Real-time sync between couples via Firestore onSnapshot (useCouple, useGoals, usePartnerProfile, useTasks), push notifications with Firebase Cloud Messaging (VAPID key), Tailwind CSS 3.4.',
        },
        caseStudy: {
          problem: 'Couples needed a way to share emotional state and gestures of affection in real time, beyond generic messaging.',
          solution: 'An app with instant syncing of emotional state, messages, needs and love gestures between two people, with push notifications.',
          process: 'React + Vite (SPA) with Firebase Auth (Google Sign-In), Firestore with onSnapshot for real-time sync, Cloud Functions and Firebase Cloud Messaging for push.',
          result: 'In progress, with real-time syncing already working as the core of the product.',
          learning: 'Designing dedicated hooks (useCouple, useGoals, usePartnerProfile, useTasks) over Firestore makes it simpler to keep two users’ state in sync without repeating logic.',
        },
      },
      pt: {
        tagline: 'App para casais com sincronização em tempo real.',
        description: 'Estado emocional, mensagens, necessidades e gestos de amor sincronizados instantaneamente. Construída com sincronização em tempo real do Firebase e notificações push para manter a conexão ativa entre duas pessoas.',
      },
      fr: {
        tagline: 'Application pour couples avec synchronisation en temps réel.',
        description: 'État émotionnel, messages, besoins et gestes d’amour synchronisés à l’instant. Construite avec la synchronisation en temps réel de Firebase et des notifications push pour garder la connexion active entre deux personnes.',
      },
      de: {
        tagline: 'App für Paare mit Echtzeit-Synchronisation.',
        description: 'Emotionaler Zustand, Nachrichten, Bedürfnisse und Liebesgesten in Echtzeit synchronisiert. Gebaut mit Firebase-Echtzeit-Sync und Push-Benachrichtigungen, um die Verbindung zwischen zwei Personen aktiv zu halten.',
      },
    },
  },
  {
    id: 'dulce-hogar',
    name: 'Dulce Hogar',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Next.js', 'E-commerce', 'MercadoPago', 'Branding'],
    year: '2025',
    href: 'https://dulcehogardye.com.ar',
    color: '#C9A87C',
    i18n: {
      es: {
        tagline: 'Tienda online de muebles y decoración premium.',
        description: 'Sitio para una tienda de muebles y deco de Moreno, Buenos Aires. Catálogo de productos, integración con WhatsApp y MercadoPago, diseño cálido y elegante que transmite el estilo premium de la marca.',
        techSpec: {
          architecture: 'Next.js App Router con route groups (tienda), API routes propias y middleware con JWT para el panel admin.',
          frameworks: 'Next.js 15 (App Router), React 18',
          languages: 'TypeScript',
          auth: 'Firebase Auth (cliente y admin) para usuarios, más sesión de admin propia vía JWT (jose) en cookie admin_session.',
          payments: 'MercadoPago (SDK oficial v2): checkout, preferencias, confirmación de pago y cobro mensual recurrente con tarjeta guardada.',
          database: 'Firebase Firestore (admin y cliente) y Firebase Storage para imágenes de producto.',
          seo: 'app/sitemap.ts y app/robots.ts, más metadata con metadataBase, title/description y openGraph.locale en el layout raíz.',
          hosting: 'Vercel, con build/install commands explícitos en vercel.json.',
          other: 'Radix UI, React Hook Form + Zod, Recharts (estadísticas), Resend (emails), Zustand, Google APIs (googleapis).',
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
          frameworks: 'Next.js 15 (App Router), React 18',
          languages: 'TypeScript',
          auth: 'Firebase Auth (client and admin) for users, plus a custom admin session via JWT (jose) in an admin_session cookie.',
          payments: 'MercadoPago (official SDK v2): checkout, preferences, payment confirmation and recurring monthly billing with a saved card.',
          database: 'Firebase Firestore (admin and client) and Firebase Storage for product images.',
          seo: 'app/sitemap.ts and app/robots.ts, plus metadata with metadataBase, title/description and openGraph.locale in the root layout.',
          hosting: 'Vercel, with explicit build/install commands in vercel.json.',
          other: 'Radix UI, React Hook Form + Zod, Recharts (statistics), Resend (emails), Zustand, Google APIs (googleapis).',
        },
        caseStudy: {
          problem: 'The furniture and decor store needed an online catalog with recurring billing and its own management, not just a static landing page.',
          solution: 'A site with a product catalog, MercadoPago checkout (including recurring monthly billing with a saved card) and a protected admin panel.',
          process: 'Next.js App Router with route groups, Firebase Auth + Firestore/Storage, JWT middleware for the admin session, official MercadoPago SDK v2.',
          result: 'A live e-commerce store with a statistics panel (Recharts) for the business owner.',
          learning: 'Separating the admin session (custom JWT) from customer authentication (Firebase Auth) avoids mixing permissions and simplifies security rules.',
        },
      },
      pt: {
        tagline: 'Loja online de móveis e decoração premium.',
        description: 'Site para uma loja de móveis e decoração de Moreno, Buenos Aires. Catálogo de produtos, integração com WhatsApp e MercadoPago, design caloroso e elegante que transmite o estilo premium da marca.',
      },
      fr: {
        tagline: 'Boutique en ligne de meubles et décoration premium.',
        description: 'Site pour une boutique de meubles et déco de Moreno, Buenos Aires. Catalogue de produits, intégration WhatsApp et MercadoPago, design chaleureux et élégant qui reflète le style premium de la marque.',
      },
      de: {
        tagline: 'Online-Shop für Premium-Möbel und -Dekoration.',
        description: 'Website für ein Möbel- und Deko-Geschäft in Moreno, Buenos Aires. Produktkatalog, WhatsApp- und MercadoPago-Integration, warmes und elegantes Design, das den Premium-Stil der Marke vermittelt.',
      },
    },
  },
  {
    id: 'mundialito',
    name: 'Mundialito',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Next.js', 'Firebase', 'MercadoPago', 'Tiempo real'],
    year: '2025',
    href: 'https://mundialito-gold.vercel.app',
    color: '#00D26A',
    i18n: {
      es: {
        tagline: 'Torneo de pronósticos para el Mundial 2026 con plata real.',
        description: 'App de pronósticos con torneos privados y públicos, entry fees en ARS y distribución automática del pozo. Leaderboard en tiempo real, sincronización de partidos y hasta 100 participantes por torneo.',
        techSpec: {
          architecture: 'Next.js App Router con cron job serverless en Vercel y funciones de Firebase separadas para lógica de backend.',
          frameworks: 'Next.js 14.2, React 18',
          languages: 'TypeScript',
          auth: 'Firebase Auth (cliente y admin), tokens ID verificados en rutas admin y de torneos.',
          payments: 'MercadoPago (checkout, verificación de pago y webhook) en uso real. Stripe está en dependencias pero sin rutas activas.',
          database: 'Firebase Firestore + Firebase Functions (Node 20), con reglas de Firestore versionadas.',
          seo: 'Metadata con openGraph (title, description, url, siteName) y metadataBase en el layout. Sin sitemap.ts ni robots.ts.',
          hosting: 'Vercel (con cron jobs) para front/API, Firebase para Functions y Firestore.',
          other: 'date-fns, nanoid, react-hot-toast, sharp, tests con Vitest.',
        },
        caseStudy: {
          problem: 'Fans del Mundial 2026 querían competir en pronósticos con plata real entre amigos, sin depender de casas de apuestas.',
          solution: 'App de torneos privados y públicos con entry fees en ARS, distribución automática del pozo y leaderboard en tiempo real.',
          process: 'Next.js App Router con cron job serverless en Vercel para sincronizar partidos, Firebase Functions para la lógica de backend y MercadoPago para cobros y verificación de pago vía webhook.',
          result: 'En producción, soportando hasta 100 participantes por torneo con actualización de posiciones en tiempo real.',
          learning: 'Automatizar la distribución del pozo y la sincronización de resultados de partidos vía cron reduce a cero la intervención manual del organizador.',
        },
      },
      en: {
        tagline: 'Prediction tournament for the 2026 World Cup with real money.',
        description: 'A predictions app with private and public tournaments, entry fees in ARS and automatic pot distribution. Real-time leaderboard, match syncing and up to 100 participants per tournament.',
        techSpec: {
          architecture: 'Next.js App Router with a serverless cron job on Vercel and separate Firebase Functions for backend logic.',
          frameworks: 'Next.js 14.2, React 18',
          languages: 'TypeScript',
          auth: 'Firebase Auth (client and admin), ID tokens verified on admin and tournament routes.',
          payments: 'MercadoPago (checkout, payment verification and webhook) in real use. Stripe is in the dependencies but has no active routes.',
          database: 'Firebase Firestore + Firebase Functions (Node 20), with versioned Firestore rules.',
          seo: 'Metadata with openGraph (title, description, url, siteName) and metadataBase in the layout. No sitemap.ts or robots.ts.',
          hosting: 'Vercel (with cron jobs) for front/API, Firebase for Functions and Firestore.',
          other: 'date-fns, nanoid, react-hot-toast, sharp, tests with Vitest.',
        },
        caseStudy: {
          problem: '2026 World Cup fans wanted to compete in predictions with real money among friends, without relying on betting houses.',
          solution: 'An app for private and public tournaments with entry fees in ARS, automatic pot distribution and a real-time leaderboard.',
          process: 'Next.js App Router with a serverless cron job on Vercel to sync matches, Firebase Functions for backend logic, and MercadoPago for payments and payment verification via webhook.',
          result: 'In production, supporting up to 100 participants per tournament with real-time standings updates.',
          learning: 'Automating pot distribution and match result syncing via cron reduces the organizer’s manual intervention to zero.',
        },
      },
      pt: {
        tagline: 'Torneio de palpites para a Copa do Mundo 2026 com dinheiro real.',
        description: 'App de palpites com torneios privados e públicos, taxas de inscrição em ARS e distribuição automática do prêmio. Ranking em tempo real, sincronização de partidas e até 100 participantes por torneio.',
      },
      fr: {
        tagline: 'Tournoi de pronostics pour la Coupe du Monde 2026 avec de l’argent réel.',
        description: 'Application de pronostics avec tournois privés et publics, frais d’inscription en ARS et distribution automatique de la cagnotte. Classement en temps réel, synchronisation des matchs et jusqu’à 100 participants par tournoi.',
      },
      de: {
        tagline: 'Tippspiel-Turnier zur WM 2026 mit echtem Geld.',
        description: 'Tipp-App mit privaten und öffentlichen Turnieren, Teilnahmegebühren in ARS und automatischer Gewinnausschüttung. Echtzeit-Rangliste, Spiel-Synchronisation und bis zu 100 Teilnehmer pro Turnier.',
      },
    },
  },
  {
    id: 'andreac-tejidos',
    name: 'Andreac Tejidos',
    statusKey: 'building',
    statusDot: 'rgba(221,232,255,0.25)',
    tags: ['React', 'Vite', 'Framer Motion', 'Branding'],
    year: '2025',
    color: '#c9a97a',
    i18n: {
      es: {
        tagline: 'Landing premium para una marca de ropa artesanal.',
        description: 'Sitio de presentación para marca textil artesanal con talleres, tienda, galería y testimonios. Diseño cálido y editorial que transmite el valor del trabajo a mano.',
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
        caseStudy: {
          problem: 'La marca textil artesanal necesitaba transmitir el valor del trabajo a mano con una estética editorial, sin necesidad de backend.',
          solution: 'Landing con talleres, tienda, galería y testimonios en una SPA liviana y cuidada visualmente.',
          process: 'React + Vite, Framer Motion para las animaciones, datos de catálogo estáticos en el propio repo (sin backend ni CMS).',
          result: 'En construcción, con la estructura de secciones ya definida para iterar sobre contenido real de la marca.',
          learning: 'Para catálogos chicos que cambian poco, datos estáticos en el repo evitan la complejidad de un CMS sin resignar velocidad de carga.',
        },
      },
      en: {
        tagline: 'Premium landing page for an artisanal clothing brand.',
        description: 'Presentation site for an artisanal textile brand with workshops, shop, gallery and testimonials. A warm, editorial design that conveys the value of handmade work.',
        techSpec: {
          architecture: 'Static Vite SPA, components organized by section (Hero, Gallery, Shop, Workshops), no backend of its own.',
          frameworks: 'React 18 + Vite 6 (SPA, no Next.js)',
          languages: 'JavaScript (JSX)',
          auth: 'Not applicable — no authentication.',
          payments: 'Not verified — no MercadoPago or Stripe in the project; the catalog has no built-in checkout.',
          database: 'Not applicable — static data in local files (src/data).',
          seo: 'Static meta tags in index.html (title, description, Open Graph, Twitter Card, theme-color). No dynamic sitemap or robots since it’s an SPA.',
          hosting: 'Static build (dist/); hosting configuration not verified in the repo.',
          other: 'Framer Motion, Tailwind CSS.',
        },
        caseStudy: {
          problem: 'The artisanal textile brand needed to convey the value of handmade work with an editorial aesthetic, with no need for a backend.',
          solution: 'A landing page with workshops, shop, gallery and testimonials in a lightweight, visually polished SPA.',
          process: 'React + Vite, Framer Motion for animations, static catalog data in the repo itself (no backend or CMS).',
          result: 'In progress, with the section structure already defined to iterate on real brand content.',
          learning: 'For small catalogs that change rarely, static data in the repo avoids the complexity of a CMS without sacrificing load speed.',
        },
      },
      pt: {
        tagline: 'Landing premium para uma marca de roupas artesanais.',
        description: 'Site de apresentação para marca têxtil artesanal com oficinas, loja, galeria e depoimentos. Design caloroso e editorial que transmite o valor do trabalho manual.',
      },
      fr: {
        tagline: 'Landing premium pour une marque de vêtements artisanaux.',
        description: 'Site de présentation pour une marque textile artisanale avec ateliers, boutique, galerie et témoignages. Design chaleureux et éditorial qui reflète la valeur du travail fait main.',
      },
      de: {
        tagline: 'Premium-Landingpage für eine handwerkliche Modemarke.',
        description: 'Präsentationsseite für eine handwerkliche Textilmarke mit Workshops, Shop, Galerie und Kundenstimmen. Warmes, redaktionelles Design, das den Wert von Handarbeit vermittelt.',
      },
    },
  },
  {
    id: 'la-rodante-del-desierto',
    name: 'La Rodante del Desierto',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Next.js', 'Framer Motion', 'Tailwind', 'E-commerce'],
    year: '2025',
    href: 'https://la-rodante-del-desierto.vercel.app',
    color: '#c8d94a',
    i18n: {
      es: {
        tagline: 'Landing para réplicas impresas en 3D de la RV de una serie de culto.',
        description: 'Sitio de venta para una réplica miniatura hecha a pedido, con pintura a mano y sin usar assets oficiales de la producción. Estética de laboratorio clandestino y desierto nocturno, con video y fotos de producto en cada sección.',
        techSpec: {
          architecture: 'Next.js 14 App Router con componentes de sección independientes (Hero, Offer, Story, Gallery, VideoSection, Specs, Highlights, FAQ, ContactForm, Footer). Sin rutas API implementadas.',
          frameworks: 'Next.js 14.2 (App Router), React 18.3',
          languages: 'TypeScript 5.6, Tailwind CSS 3.4',
          auth: 'No aplica — landing sin cuentas de usuario.',
          payments: 'Sin pasarela de pago integrada. Conversión vía WhatsApp (link directo) y formulario de contacto con react-hook-form + zod (el envío aún es simulado, pendiente de conectar a un endpoint propio).',
          database: 'No aplica — sin backend ni base de datos.',
          seo: 'Metadata completa en app/layout.tsx (title template, description, keywords, Open Graph, Twitter card, robots), app/robots.ts y app/sitemap.ts con la Metadata API de Next.js, más JSON-LD tipo Product con oferta en ARS.',
          hosting: 'Vercel (deploy por defecto, sin configuración custom).',
          other: 'Framer Motion, Radix UI (accordion para FAQ), lucide-react, fuentes vía next/font (Bebas Neue, Big Shoulders Stencil, Work Sans).',
        },
        caseStudy: {
          problem: 'Vender una réplica de colección hecha a pedido, sin usar assets oficiales de la serie, requería una landing que transmitiera calidad artesanal y evitara problemas de derechos.',
          solution: 'Sitio de venta con estética propia (laboratorio clandestino / desierto nocturno), video y fotos de producto, con conversión vía WhatsApp.',
          process: 'Next.js App Router con secciones independientes (Hero, Offer, Story, Gallery, VideoSection, Specs, Highlights, FAQ), SEO completo con JSON-LD tipo Product, formulario con react-hook-form + zod.',
          result: 'En producción, con SEO y metadata pensados para posicionar un producto de nicho en buscadores.',
          learning: 'El formulario de contacto quedó simulado a propósito hasta no tener un endpoint propio: mejor lanzar con WhatsApp funcionando que demorar el lanzamiento por un backend que todavía no hacía falta.',
        },
      },
      en: {
        tagline: '3D-printed replica landing page for a cult series’ RV.',
        description: 'Sales site for a made-to-order miniature replica, hand-painted and without using the production’s official assets. A clandestine-lab, night-desert aesthetic, with product video and photos in every section.',
        techSpec: {
          architecture: 'Next.js 14 App Router with independent section components (Hero, Offer, Story, Gallery, VideoSection, Specs, Highlights, FAQ, ContactForm, Footer). No API routes implemented.',
          frameworks: 'Next.js 14.2 (App Router), React 18.3',
          languages: 'TypeScript 5.6, Tailwind CSS 3.4',
          auth: 'Not applicable — landing page with no user accounts.',
          payments: 'No payment gateway integrated. Conversion via WhatsApp (direct link) and a contact form with react-hook-form + zod (submission is still simulated, pending connection to its own endpoint).',
          database: 'Not applicable — no backend or database.',
          seo: 'Full metadata in app/layout.tsx (title template, description, keywords, Open Graph, Twitter card, robots), app/robots.ts and app/sitemap.ts with the Next.js Metadata API, plus Product-type JSON-LD with an ARS offer.',
          hosting: 'Vercel (default deploy, no custom configuration).',
          other: 'Framer Motion, Radix UI (accordion for FAQ), lucide-react, fonts via next/font (Bebas Neue, Big Shoulders Stencil, Work Sans).',
        },
        caseStudy: {
          problem: 'Selling a made-to-order collector’s replica, without using the series’ official assets, required a landing page that conveyed craft quality and avoided rights issues.',
          solution: 'A sales site with its own aesthetic (clandestine lab / night desert), product video and photos, with conversion via WhatsApp.',
          process: 'Next.js App Router with independent sections (Hero, Offer, Story, Gallery, VideoSection, Specs, Highlights, FAQ), full SEO with Product-type JSON-LD, a form with react-hook-form + zod.',
          result: 'In production, with SEO and metadata designed to rank a niche product in search engines.',
          learning: 'The contact form was left simulated on purpose until there was a real endpoint: better to launch with WhatsApp working than delay launch for a backend that wasn’t needed yet.',
        },
      },
      pt: {
        tagline: 'Landing page para réplicas impressas em 3D da van de uma série cult.',
        description: 'Site de venda para uma réplica em miniatura feita sob encomenda, pintada à mão e sem usar assets oficiais da produção. Estética de laboratório clandestino e deserto noturno, com vídeo e fotos do produto em cada seção.',
      },
      fr: {
        tagline: 'Landing page pour des répliques imprimées en 3D du camping-car d’une série culte.',
        description: 'Site de vente pour une réplique miniature réalisée sur commande, peinte à la main et sans utiliser d’éléments officiels de la production. Esthétique de laboratoire clandestin et désert nocturne, avec vidéo et photos du produit dans chaque section.',
      },
      de: {
        tagline: 'Landingpage für 3D-gedruckte Nachbildungen des Wohnmobils einer Kultserie.',
        description: 'Verkaufsseite für eine handgefertigte Miniatur-Nachbildung auf Bestellung, handbemalt und ohne offizielle Assets der Produktion. Ästhetik eines geheimen Labors in der nächtlichen Wüste, mit Produktvideo und -fotos in jedem Abschnitt.',
      },
    },
  },
  {
    id: 'calvos-compresores',
    name: 'Los Calvos Compresores',
    statusKey: 'production',
    statusDot: 'var(--color-accent)',
    tags: ['Next.js', 'Landing', 'Panel admin', 'SEO'],
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
        tagline: 'Site institucional para uma oficina especializada em compressores de ar-condicionado automotivo.',
        description: 'Catálogo de serviços, galeria de trabalhos, comparador antes/depois, formulário de contato e painel administrativo próprio. Mais de 40 anos de trajetória da oficina em um site rápido e otimizado para SEO local.',
      },
      fr: {
        tagline: 'Site institutionnel pour un atelier spécialisé dans les compresseurs de climatisation automobile.',
        description: 'Catalogue de services, galerie de réalisations, comparateur avant/après, formulaire de contact et panneau d’administration propre. Plus de 40 ans d’expérience de l’atelier traduits en un site rapide et optimisé pour le référencement local.',
      },
      de: {
        tagline: 'Institutionelle Website für eine auf Kfz-Klimakompressoren spezialisierte Werkstatt.',
        description: 'Serviceübersicht, Arbeitsgalerie, Vorher-Nachher-Vergleich, Kontaktformular und eigenes Admin-Panel. Über 40 Jahre Werkstatt-Erfahrung in einer schnellen, lokal SEO-optimierten Website umgesetzt.',
      },
    },
  },
]
