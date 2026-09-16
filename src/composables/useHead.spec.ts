import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useHead } from './useHead'
import { content, type Locale, type SiteContent } from '@/content'

/**
 * Everything this writes is invisible in the page itself, so a break here shows
 * up as lost search ranking or a wrong preview weeks later rather than as an
 * error. That is the argument for covering it.
 */

function renderHead(locale: Locale) {
  const c = ref<SiteContent>(content[locale])
  const l = ref<Locale>(locale)
  const Host = defineComponent({
    setup() {
      useHead(c, l)
      return () => null
    },
  })
  return { wrapper: mount(Host), c, l }
}

const meta = (sel: string) =>
  document.head.querySelector<HTMLMetaElement>(sel)?.getAttribute('content') ?? null
const link = (sel: string) =>
  document.head.querySelector<HTMLLinkElement>(sel)?.getAttribute('href') ?? null

beforeEach(() => {
  document.head.innerHTML = ''
  document.documentElement.lang = ''
})

describe.each<Locale>(['en', 'mk'])('for %s', (locale) => {
  const expected = content[locale]
  const url = locale === 'mk' ? 'https://aquaengineering.mk/mk' : 'https://aquaengineering.mk/'

  it('sets the document language and title from that locale', () => {
    renderHead(locale)
    expect(document.documentElement.lang).toBe(expected.lang)
    expect(document.title).toBe(expected.meta.title)
  })

  it('writes description and Open Graph tags', () => {
    renderHead(locale)
    expect(meta('meta[name="description"]')).toBe(expected.meta.description)
    expect(meta('meta[property="og:title"]')).toBe(expected.meta.title)
    expect(meta('meta[property="og:description"]')).toBe(expected.meta.description)
    expect(meta('meta[property="og:locale"]')).toBe(expected.ogLocale)
    expect(meta('meta[property="og:url"]')).toBe(url)
  })

  it('points the canonical at its own URL', () => {
    renderHead(locale)
    expect(link('link[rel="canonical"]')).toBe(url)
  })

  it('uses its own social card', () => {
    renderHead(locale)
    expect(meta('meta[property="og:image"]')).toBe(`https://aquaengineering.mk/og-${locale}.png`)
    expect(meta('meta[name="twitter:image"]')).toBe(`https://aquaengineering.mk/og-${locale}.png`)
  })

  it('declares both hreflang alternates plus x-default', () => {
    renderHead(locale)
    expect(link('link[rel="alternate"][hreflang="en"]')).toBe('https://aquaengineering.mk/')
    expect(link('link[rel="alternate"][hreflang="mk"]')).toBe('https://aquaengineering.mk/mk')
    expect(link('link[rel="alternate"][hreflang="x-default"]')).toBe('https://aquaengineering.mk/')
  })
})

describe('structured data', () => {
  it('emits JSON-LD that parses', () => {
    renderHead('en')
    const el = document.head.querySelector('script[type="application/ld+json"]')
    expect(el).not.toBeNull()
    expect(() => JSON.parse(el!.textContent!)).not.toThrow()
  })

  it('carries the business details a local search result needs', () => {
    renderHead('en')
    const ld = JSON.parse(
      document.head.querySelector('script[type="application/ld+json"]')!.textContent!,
    )
    expect(ld['@type']).toBe('ProfessionalService')
    expect(ld.address.addressLocality).toBe('Skopje')
    expect(ld.address.addressCountry).toBe('MK')
    expect(ld.foundingDate).toBe('2010')
    expect(ld.telephone).toHaveLength(3)
    expect(ld.email).toBe('contact@aquaengineering.mk')
  })
})

describe('reactivity', () => {
  it('rewrites the head when the locale changes rather than appending a second set', async () => {
    const { c, l } = renderHead('en')
    expect(document.title).toBe(content.en.meta.title)

    c.value = content.mk
    l.value = 'mk'
    await new Promise((r) => setTimeout(r, 0))

    expect(document.title).toBe(content.mk.meta.title)
    expect(meta('meta[property="og:locale"]')).toBe('mk_MK')
    // The tags are updated in place; duplicates would make crawlers pick arbitrarily.
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1)
  })
})
