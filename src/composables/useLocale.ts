import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { content, DEFAULT_LOCALE, type Locale, type SiteContent } from '@/content'

/** The route prefix carrying a locale. English is served without one. */
const PREFIX: Record<Locale, string> = { en: '', mk: '/mk' }

/**
 * Strips the locale prefix from a path, leaving the page beneath it.
 * `/mk/privacy` becomes `/privacy`, `/mk` becomes `/`.
 */
export function pagePathOf(path: string): string {
  return path.replace(/^\/mk(?=\/|$)/, '') || '/'
}

/** The path serving the same page in the given locale. */
export function pathIn(locale: Locale, path: string): string {
  const page = pagePathOf(path)
  const prefix = PREFIX[locale]
  if (page === '/') return prefix || '/'
  return `${prefix}${page}`
}

/** Resolves the active locale from the route and hands back its content. */
export function useLocale() {
  const route = useRoute()

  const locale = computed<Locale>(() => (route.meta.locale as Locale) ?? DEFAULT_LOCALE)
  const c = computed<SiteContent>(() => content[locale.value])

  const otherLocale = computed<Locale>(() => (locale.value === 'en' ? 'mk' : 'en'))

  /**
   * The same page in the other language, rather than that language's home page.
   * Switching language from the privacy notice used to drop the reader on the
   * home page, losing where they were.
   */
  const otherPath = computed(() => pathIn(otherLocale.value, route.path))

  return { locale, c, otherLocale, otherPath }
}
