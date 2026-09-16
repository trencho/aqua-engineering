import { watchEffect } from 'vue'
import type { Ref } from 'vue'
import { ADDRESS, EMAILS, FOUNDED, PHONES, type Locale, type SiteContent } from '@/content'

export const SITE_ORIGIN = 'https://aquaengineering.mk'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
}

function upsertLink(rel: string, href: string, extra: Record<string, string> = {}) {
  const key = extra.hreflang
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]`
  let el = document.head.querySelector<HTMLLinkElement>(key)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
  for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v)
}

function localBusiness(c: SiteContent, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: c.meta.title,
    description: c.meta.description,
    url: locale === 'mk' ? `${SITE_ORIGIN}/mk` : SITE_ORIGIN,
    foundingDate: String(FOUNDED),
    email: EMAILS[0],
    telephone: PHONES.map((p) => p.label),
    address: {
      '@type': 'PostalAddress',
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.locality,
      postalCode: ADDRESS.postalCode,
      addressCountry: ADDRESS.country,
    },
    areaServed: 'MK',
    knowsLanguage: ['en', 'mk'],
    serviceType: [
      'Water supply engineering',
      'Drainage',
      'Pumping stations',
      'Sewerage treatment',
      'Flood protection',
      'River regulation',
      'Environmental assessment',
    ],
  }
}

/**
 * Sets everything a crawler or unfurler reads, per route.
 *
 * The site is a static SPA, so the shipped index.html carries the English
 * defaults and this brings the document in step once a route resolves. It is
 * deliberately hand-rolled: a head library would be a dependency for two
 * routes' worth of tags.
 */
export interface HeadOverrides {
  title?: () => string
  description?: () => string
  /**
   * Path for a given locale. Drives canonical, og:url and both hreflang
   * alternates, so a standalone page points its alternates at the matching page
   * rather than back at the home page.
   */
  pathFor?: (locale: Locale) => string
}

/** Home page paths, and the default when a page supplies no override. */
const homePath = (locale: Locale) => (locale === 'mk' ? '/mk' : '/')

export function useHead(c: Ref<SiteContent>, locale: Ref<Locale>, overrides: HeadOverrides = {}) {
  watchEffect(() => {
    const content = c.value
    const pathFor = overrides.pathFor ?? homePath
    const path = pathFor(locale.value)
    const url = `${SITE_ORIGIN}${path}`
    const title = overrides.title?.() ?? content.meta.title
    const description = overrides.description?.() ?? content.meta.description

    document.documentElement.lang = content.lang
    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: content.meta.title,
    })
    // The old site set og:locale to en_GB on both languages and left
    // twitter:image empty, so neither page ever unfurled correctly.
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: content.ogLocale })
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: `${SITE_ORIGIN}/og-${locale.value}.png`,
    })
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    upsertMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: `${SITE_ORIGIN}/og-${locale.value}.png`,
    })

    upsertLink('canonical', url)
    upsertLink('alternate', `${SITE_ORIGIN}${pathFor('en')}`, { hreflang: 'en' })
    upsertLink('alternate', `${SITE_ORIGIN}${pathFor('mk')}`, { hreflang: 'mk' })
    upsertLink('alternate', `${SITE_ORIGIN}${pathFor('en')}`, { hreflang: 'x-default' })

    let ld = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]')
    if (!ld) {
      ld = document.createElement('script')
      ld.type = 'application/ld+json'
      document.head.appendChild(ld)
    }
    ld.textContent = JSON.stringify(localBusiness(content, locale.value))
  })
}
