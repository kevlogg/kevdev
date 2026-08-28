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

  return {
    metadataBase: new URL('https://kevdev.vercel.app'),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: locale === routing.defaultLocale ? '/' : `/${locale}`,
      languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.ogDescription,
      url: 'https://kevdev.vercel.app',
      siteName: 'kevdev',
      locale: OG_LOCALE[locale as Locale],
      type: 'website',
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
              '@type': 'ProfessionalService',
              name: 'KevDev — Digital Product Builder',
              image: 'https://kevdev.net.ar/icon.png',
              '@id': 'https://kevdev.net.ar/#business',
              url: 'https://kevdev.net.ar',
              telephone: '+54-9-11-0000-0000',
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'AR',
              },
              sameAs: [
                'https://share.google/Vmv20uo1V4pSFQY8h',
                'https://www.instagram.com/kevd3v/',
                'https://www.linkedin.com/in/kevin-loggia/',
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Servicios de Desarrollo Web',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Diseño Web Profesional',
                      url: 'https://kevdev.net.ar/diseno-web',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Tiendas Online y E-Commerce',
                      url: 'https://kevdev.net.ar/tiendas-online',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Desarrollo Web a Medida',
                      url: 'https://kevdev.net.ar/desarrollo-a-medida',
                    },
                  },
                ],
              },
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
