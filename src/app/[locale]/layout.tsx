import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing, type Locale } from '@/i18n/routing'
import '../globals.css'

const OG_LOCALE: Record<Locale, string> = {
  es: 'es_AR',
  en: 'en_US',
  pt: 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE',
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const messages = (await getMessages({ locale })) as any
  const meta = messages.meta

  const languages: Record<string, string> = {}
  for (const l of routing.locales) {
    languages[l] = l === routing.defaultLocale ? '/' : `/${l}`
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kevdev.net.ar'

  return {
    metadataBase: new URL('https://www.kevdev.net.ar'),
    title: meta.title,
    description: meta.description,
    keywords: [
      'Desarrollador web argentina',
      'Diseñador web argentina',
      'Desarrollo de software a medida',
      'Creacion de tiendas online',
      'Ecommerce mercado pago',
      'Landing pages alta conversion',
      'SEO local mar del plata',
      'Desarrollo web caba',
      'Programador rosario',
      'Desarrollo web cordoba',
      'Programador mendoza',
    ],
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'qXq4-oHopE6UqTER8KAoEFLAC7kLr0P8Y-oQNxQadNI',
    },
    alternates: {
      canonical: locale === routing.defaultLocale ? '/' : `/${locale}`,
      languages,
    },
    icons: {
      icon: [
        { url: '/favicon.ico?v=2', sizes: 'any' },
        { url: '/favicon-48x48.png?v=2', sizes: '48x48', type: 'image/png' },
        { url: '/favicon-96x96.png?v=2', sizes: '96x96', type: 'image/png' },
        { url: '/favicon-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
        { url: '/favicon-512x512.png?v=2', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
      ],
    },
    openGraph: {
      title: meta.title,
      description: meta.ogDescription,
      url: baseUrl,
      siteName: 'KevDev',
      locale: OG_LOCALE[locale as Locale],
      type: 'website',
      images: [
        {
          url: 'https://www.kevdev.net.ar/og-image.png',
          width: 1200,
          height: 630,
          alt: 'KevDev — Desarrollo Web & Software a Medida Argentina',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.ogDescription,
      images: ['https://www.kevdev.net.ar/og-image.png'],
    },
  }
}

import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': ['ProfessionalService', 'LocalBusiness'],
                  '@id': 'https://www.kevdev.net.ar/#business',
                  name: 'KevDev — Desarrollador Web & Software a Medida',
                  alternateName: 'KevDev Digital Builder',
                  image: 'https://www.kevdev.net.ar/og-image.png',
                  logo: 'https://www.kevdev.net.ar/favicon-512x512.png',
                  url: 'https://www.kevdev.net.ar',
                  telephone: '+54-9-11-0000-0000',
                  priceRange: '$$',
                  address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'AR',
                    addressRegion: 'Buenos Aires / Argentina',
                  },
                  geo: {
                    '@type': 'GeoCoordinates',
                    latitude: -38.0055,
                    longitude: -57.5426,
                  },
                  sameAs: [
                    'https://maps.google.com/?cid=8114234444718749965',
                    'https://share.google/Vmv20uo1V4pSFQY8h',
                    'https://www.instagram.com/kevd3v/',
                    'https://www.linkedin.com/in/kevin-loggia/',
                  ],
                  areaServed: [
                    { '@type': 'Country', name: 'Argentina' },
                    { '@type': 'City', name: 'Mar del Plata' },
                    { '@type': 'City', name: 'Buenos Aires (CABA)' },
                    { '@type': 'City', name: 'Rosario' },
                    { '@type': 'City', name: 'Córdoba' },
                    { '@type': 'City', name: 'Mendoza' },
                  ],
                  hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Servicios de Desarrollo Web y Software',
                    itemListElement: [
                      {
                        '@type': 'Offer',
                        itemOffered: {
                          '@type': 'Service',
                          name: 'Diseño Web Profesional & Landing Pages',
                          url: 'https://www.kevdev.net.ar/diseno-web',
                          description: 'Diseño y desarrollo de sitios web institucionales y landing pages de alta conversión optimizadas para Google SEO.',
                        },
                      },
                      {
                        '@type': 'Offer',
                        itemOffered: {
                          '@type': 'Service',
                          name: 'Creación de Tiendas Online & E-Commerce',
                          url: 'https://www.kevdev.net.ar/tiendas-online',
                          description: 'Desarrollo de e-commerce con cobros en Mercado Pago, Mobbex, Stripe y gestión de envíos.',
                        },
                      },
                      {
                        '@type': 'Offer',
                        itemOffered: {
                          '@type': 'Service',
                          name: 'Desarrollo de Software a Medida & Web Apps',
                          url: 'https://www.kevdev.net.ar/desarrollo-a-medida',
                          description: 'Sistemas web a medida, plataformas SaaS, APIs personalizadas y desarrollo a 60 FPS.',
                        },
                      },
                    ],
                  },
                },
                {
                  '@type': 'SoftwareApplication',
                  '@id': 'https://www.kevdev.net.ar/#software',
                  name: 'KevDev 60FPS LERP Smooth Engine',
                  operatingSystem: 'All Web Browsers',
                  applicationCategory: 'DeveloperApplication',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          <AnalyticsTracker />
          <VercelAnalytics />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
