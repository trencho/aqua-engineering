import type { Locale, SiteContent } from './types'
import { en } from './en'
import { mk } from './mk'

export const content: Record<Locale, SiteContent> = { en, mk }
export const LOCALES = Object.keys(content) as Locale[]
export const DEFAULT_LOCALE: Locale = 'en'

export * from './types'
export * from './shared'
