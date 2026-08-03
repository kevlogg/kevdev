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
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
