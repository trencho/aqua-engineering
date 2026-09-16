import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { content, DEFAULT_LOCALE, type Locale, type SiteContent } from '@/content'

/** Resolves the active locale from the route and hands back its content. */
export function useLocale() {
  const route = useRoute()

  const locale = computed<Locale>(() => (route.meta.locale as Locale) ?? DEFAULT_LOCALE)
  const c = computed<SiteContent>(() => content[locale.value])

  /** The path serving the same page in the other language. */
  const otherLocale = computed<Locale>(() => (locale.value === 'en' ? 'mk' : 'en'))
  const otherPath = computed(() => (otherLocale.value === 'mk' ? '/mk' : '/'))

  return { locale, c, otherLocale, otherPath }
}

/** Route path for a locale. Kept beside useLocale so the mapping lives in one place. */
export function pathFor(locale: Locale): string {
  return locale === 'mk' ? '/mk' : '/'
}
