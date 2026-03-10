# kevdev — Landing personal

Landing page de marca para kevdev: digital product builder.  
React + Tailwind, enfoque tech/startup/SaaS, lista para personalizar y publicar.

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173).

## Cómo publicar

```bash
npm run build
```

La carpeta `dist/` se puede subir a Vercel, Netlify, GitHub Pages o cualquier hosting estático.

## Qué personalizar antes de publicar

1. **Contacto** — En `src/components/CTAFinal.jsx`:
   - `WHATSAPP_NUMBER`: número con código de país, sin `+` (ej: `5491112345678`)
   - `LINKEDIN_URL`: tu perfil de LinkedIn
   - `EMAIL`: tu email

2. **Textos** — Podés editar copy en cada componente dentro de `src/components/`.

3. **Meta / SEO** — En `index.html`: título y meta description.

4. **Favicon** — Reemplazá `public/favicon.svg` por tu propio ícono si querés.

## Estructura

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── QueHago.jsx
│   ├── Proyectos.jsx
│   ├── MiEnfoque.jsx
│   ├── ParaQuien.jsx
│   ├── CTAFinal.jsx
│   └── Footer.jsx
├── App.jsx
├── main.jsx
└── index.css
```

Identidad visual en `tailwind.config.js` (colores `kev.*`, fuentes Space Grotesk + Inter).
