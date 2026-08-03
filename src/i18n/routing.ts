import { defineRouting } from 'next-intl/routing'

export const locales = ['es', 'en', 'pt', 'fr', 'de'] as const
export type Locale = (typeof locales)[number]

export const routing = defineRouting({
  locales,
  defaultLocale: 'es',
  localePrefix: 'as-needed',
  localeDetection: true,
})
