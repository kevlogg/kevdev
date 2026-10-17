const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public', 'projects');

const svgProjects = [
  {
    id: 'aquapro-studio',
    title: 'AquaPro Studio',
    subtitle: 'Detailing Vehicular & Protección Cerámica 9H',
    color: '#06b6d4',
    bgDark: '#031726',
    tag1: 'Tratamiento Cerámico 9H',
    tag2: 'Corrección de Laca',
    tag3: 'Protección PPF',
    icon: '⚡',
    uiText1: 'Estudio de Estética Automotriz',
    uiText2: 'Brillo Espejo & Protección Duradera',
    details: ['Tratamientos 9H', 'PPF Film Transparente', 'Limpieza de Interiores']
  },
  {
    id: 'aire-y-luz-arquitectura',
    title: 'Aire y Luz Arquitectura',
    subtitle: 'Estudio de Arquitectura & Diseño Residencial',
    color: '#f59e0b',
    bgDark: '#1c1507',
    tag1: 'Obras Residenciales',
    tag2: 'Diseño Minimalista',
    tag3: 'Dirección de Obra',
    icon: '📐',
    uiText1: 'Espacios que Inspiran Luz Natural',
    uiText2: 'Portafolio de Obras 2026',
    details: ['Casa Gurruchaga', 'Refugio Thames', 'PH Colegiales']
  },
  {
    id: 'don-lorenzo-panaderia',
    title: 'Don Lorenzo',
    subtitle: 'Panadería & Confitería Artesanal de Masa Madre',
    color: '#d97706',
    bgDark: '#1a1005',
    tag1: 'Masa Madre 100%',
    tag2: 'Horneo Diario',
    tag3: 'Café de Especialidad',
    icon: '🥐',
    uiText1: 'Tradición y Sabor Artesanal',
    uiText2: 'Productos Frescos Cada Mañana',
    details: ['Pan de Campo', 'Medialunas de Manteca', 'Pastelería']
  },
  {
    id: 'gabriel-70',
    title: 'Gabriel 70 Años',
    subtitle: 'Celebración Inolvidable & Álbum de Recuerdos',
    color: '#8b5cf6',
    bgDark: '#120b24',
    tag1: 'RSVP Online',
    tag2: 'Galería de Memorias',
    tag3: 'Ubicación & Mapa',
    icon: '🎉',
    uiText1: '¡Acompáñanos a Celebrar 70 Años de Historia!',
    uiText2: 'Sábado 15 de Noviembre • 21:00 hs',
    details: ['Confirmar Asistencia', 'Álbum Familiar', 'Cronograma']
  },
  {
    id: 'aura-estetica',
    title: 'Aura Estética',
    subtitle: 'Centro Integral de Medicina Estética & Láser',
    color: '#f472b6',
    bgDark: '#210816',
    tag1: 'Láser Soprano Titanium',
    tag2: 'Armonización Facial',
    tag3: 'Tratamientos Corporales',
    icon: '✨',
    uiText1: 'Resalta tu Belleza Natural',
    uiText2: 'Tecnología Médica de Última Generación',
    details: ['Limpieza Profunda', 'Botox & Ácido Hialurónico', 'Drenaje']
  },
  {
    id: 'aura-farm',
    title: 'Aura Farm',
    subtitle: 'Dermo-farmacia & Plataforma de Salud y Bienestar',
    color: '#10b981',
    bgDark: '#041f16',
    tag1: 'Skincare Dermatológico',
    tag2: 'Suplementos Naturales',
    tag3: 'Envíos a Domicilio',
    icon: '🌿',
    uiText1: 'Cuidado Profesional para tu Piel',
    uiText2: 'Asesoramiento Farmacéutico Personalizado',
    details: ['Protectores Solares', 'Sérums Anti-age', 'Vitaminas']
  },
  {
    id: 'modo-living',
    title: 'Modo Living',
    subtitle: 'Muebles & Equipamiento de Diseño para el Hogar',
    color: '#a855f7',
    bgDark: '#180724',
    tag1: 'Sillones Modulares',
    tag2: 'Mesas de Centro',
    tag3: 'Diseño Personalizado',
    icon: '🛋️',
    uiText1: 'Transforma tu Sala de Estar',
    uiText2: 'Confort, Estilo y Durabilidad Premium',
    details: ['Sillón Chesterfield', 'Mesa Guatambú', 'Poltrona Nordic']
  },
  {
    id: 'duplack',
    title: 'Duplack',
    subtitle: 'Placards & Vestidores a Medida de Alta Gama',
    color: '#64748b',
    bgDark: '#0f172a',
    tag1: 'Vestidores Exclusivos',
    tag2: 'Puertas Corredizas',
    tag3: 'Cotizador Rápido',
    icon: '🚪',
    uiText1: 'Optimiza tus Espacios con Estilo',
    uiText2: 'Diseño Inteligente e Iluminación LED Integrada',
    details: ['Vestidor Abierto', 'Placard Espejado', 'Interiores']
  },
  {
    id: 'orimar-concepto',
    title: 'Orimar Concepto',
    subtitle: 'Mobiliario de Autor & Piezas de Diseño Exclusivas',
    color: '#eab308',
    bgDark: '#1c1602',
    tag1: 'Ediciones Limitadas',
    tag2: 'Materiales Nobles',
    tag3: 'Arquitectura Interior',
    icon: '🪑',
    uiText1: 'Diseño de Autor & Muebles Exclusivos',
    uiText2: 'Artesanía Fina en Madera y Acero Pulido',
    details: ['Colección Roble', 'Mesa Mármol Carrara', 'Esculturas']
  },
  {
    id: 'dvamoblamientos',
    title: 'DVA Moblamientos',
    subtitle: 'Amoblamientos de Cocina & Mobiliario Integral',
    color: '#3b82f6',
    bgDark: '#08162e',
    tag1: 'Cocinas Modernas',
    tag2: 'Herrajes Blum',
    tag3: 'Renders 3D',
    icon: '🍳',
    uiText1: 'La Cocina de tus Sueños Hecha Realidad',
    uiText2: 'Laqueados Premium y Mesadas en Cuarzo',
    details: ['Isla Central', 'Bajo Mesada', 'Alacena Despensa']
  },
  {
    id: 'crdecoradores',
    title: 'CR Decoradores',
    subtitle: 'Cortinados, Roller Blackout & Ambientación',
    color: '#14b8a6',
    bgDark: '#041d1a',
    tag1: 'Cortinas Roller',
    tag2: 'Sistemas Motorizados',
    tag3: 'Asesoramiento a Domicilio',
    icon: '🏡',
    uiText1: 'Elegancia y Control Solar para tus Ambientes',
    uiText2: 'Confección a Medida y Colocación Profesional',
    details: ['Roller Blackout', 'Sunscreen 5%', 'Cortinas Tradicionales']
  }
];

function generateSVG(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bgDark}" />
      <stop offset="50%" stop-color="#0a0d16" />
      <stop offset="100%" stop-color="#04060c" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${p.color}" />
      <stop offset="100%" stop-color="${p.color}88" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="${p.color}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${p.color}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowLeft" cx="20%" cy="80%" r="50%">
      <stop offset="0%" stop-color="${p.color}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${p.color}" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="800" fill="url(#bgGrad)" />
  <rect width="1200" height="800" fill="url(#glow)" />
  <rect width="1200" height="800" fill="url(#glowLeft)" />

  <!-- Subtle UI Grid lines -->
  <path d="M0 100 H1200 M0 200 H1200 M0 300 H1200 M0 400 H1200 M0 500 H1200 M0 600 H1200 M0 700 H1200" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
  <path d="M200 0 V800 M400 0 V800 M600 0 V800 M800 0 V800 M1000 0 V800" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>

  <!-- Browser Window Frame -->
  <g transform="translate(60, 50)" filter="url(#shadow)">
    <!-- Browser Bar -->
    <rect width="1080" height="42" rx="10" ry="10" fill="#141824" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1"/>
    <circle cx="24" cy="21" r="6" fill="#ff5f56"/>
    <circle cx="42" cy="21" r="6" fill="#ffbd2e"/>
    <circle cx="60" cy="21" r="6" fill="#27c93f"/>
    <!-- URL Bar -->
    <rect x="90" y="10" width="450" height="22" rx="6" fill="#0b0e17"/>
    <text x="105" y="25" fill="#8b95b0" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500">https://www.${p.id}.com.ar</text>

    <!-- Navigation Menu mockup -->
    <text x="820" y="26" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="600" opacity="0.9">Inicio</text>
    <text x="880" y="26" fill="#8b95b0" font-family="system-ui, sans-serif" font-size="13">Servicios</text>
    <text x="960" y="26" fill="#8b95b0" font-family="system-ui, sans-serif" font-size="13">Contacto</text>

    <!-- Main Web Canvas Content -->
    <rect y="42" width="1080" height="658" rx="0" ry="0" fill="#090c15" fill-opacity="0.95" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>

    <!-- Hero Section Content -->
    <!-- Top Accent Badge -->
    <rect x="80" y="90" width="220" height="32" rx="16" fill="${p.color}" fill-opacity="0.15" stroke="${p.color}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="100" y="111" fill="${p.color}" font-family="system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="1">${p.icon} ${p.tag1.toUpperCase()}</text>

    <!-- Hero Headline -->
    <text x="80" y="175" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" letter-spacing="-1">${p.title}</text>

    <!-- Hero Subtitle -->
    <text x="80" y="215" fill="${p.color}" font-family="system-ui, sans-serif" font-size="22" font-weight="600">${p.uiText1}</text>
    <text x="80" y="248" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" font-weight="400">${p.uiText2}</text>

    <!-- CTA Button -->
    <rect x="80" y="280" width="190" height="48" rx="24" fill="url(#accentGrad)"/>
    <text x="118" y="310" fill="#000000" font-family="system-ui, sans-serif" font-size="15" font-weight="800">Ver Propuesta →</text>

    <rect x="290" y="280" width="160" height="48" rx="24" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="325" y="310" fill="#ffffff" font-family="system-ui, sans-serif" font-size="15" font-weight="600">Consultar</text>

    <!-- Right Side Hero Image Card / Showcase -->
    <g transform="translate(560, 90)">
      <rect width="440" height="300" rx="16" fill="#131927" stroke="${p.color}" stroke-opacity="0.3" stroke-width="1.5" filter="url(#shadow)"/>
      <rect width="440" height="300" rx="16" fill="url(#glow)"/>

      <!-- Inner Visual Graphic -->
      <circle cx="220" cy="130" r="70" fill="${p.color}" fill-opacity="0.12" stroke="${p.color}" stroke-opacity="0.5" stroke-width="2"/>
      <text x="220" y="145" fill="${p.color}" font-family="system-ui, sans-serif" font-size="56" text-anchor="middle">${p.icon}</text>

      <text x="220" y="230" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700" text-anchor="middle">${p.subtitle}</text>

      <!-- Badge row inside card -->
      <rect x="70" y="252" width="90" height="24" rx="12" fill="#ffffff" fill-opacity="0.08"/>
      <text x="115" y="268" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">${p.tag1}</text>

      <rect x="175" y="252" width="90" height="24" rx="12" fill="#ffffff" fill-opacity="0.08"/>
      <text x="220" y="268" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">${p.tag2}</text>

      <rect x="280" y="252" width="90" height="24" rx="12" fill="#ffffff" fill-opacity="0.08"/>
      <text x="325" y="268" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">${p.tag3}</text>
    </g>

    <!-- Bottom Cards Grid (Features/Products) -->
    <g transform="translate(80, 420)">
      <text x="0" y="0" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="700">Destacados del Proyecto</text>

      ${p.details.map((item, idx) => `
        <g transform="translate(${idx * 310}, 25)">
          <rect width="290" height="180" rx="12" fill="#111625" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
          <rect x="15" y="15" width="40" height="40" rx="8" fill="${p.color}" fill-opacity="0.2"/>
          <text x="35" y="41" fill="${p.color}" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle">0${idx+1}</text>

          <text x="15" y="85" fill="#ffffff" font-family="system-ui, sans-serif" font-size="17" font-weight="700">${item}</text>
          <text x="15" y="112" fill="#64748b" font-family="system-ui, sans-serif" font-size="13">Servicio integral y personalizado con acabados de excelencia.</text>

          <text x="15" y="155" fill="${p.color}" font-family="system-ui, sans-serif" font-size="13" font-weight="700">Saber más →</text>
        </g>
      `).join('')}
    </g>

  </g>
</svg>`;
}

svgProjects.forEach(p => {
  const filePath = path.join(outputDir, `${p.id}.svg`);
  fs.writeFileSync(filePath, generateSVG(p), 'utf8');
  console.log(`Created SVG mockup for ${p.id} at ${filePath}`);
});

console.log('All 11 project SVGs successfully created!');
