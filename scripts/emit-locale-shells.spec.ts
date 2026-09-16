import { describe, expect, it } from 'vitest'
import { PAGES, pathFor, shellFor } from './emit-locale-shells'
import { content } from '../src/content/index'

/**
 * These guard the reason the plugin exists: social unfurlers do not run JS, so
 * whatever is baked into the shipped HTML is what Facebook, LinkedIn, WhatsApp
 * and Slack will show. A regression here is invisible in a browser — the
 * runtime `useHead` would still paint the right tags — and only shows up as a
 * wrong preview weeks later.
 */

/** A stand-in for the real index.html, carrying every tag the plugin rewrites. */
const TEMPLATE = `<!doctype html>
<html lang="en-GB">
  <head>
    <title>Aqua Engineering</title>
    <meta name="description" content="English description" />
    <link rel="canonical" href="https://aquaengineering.mk/" />
    <link rel="alternate" hreflang="en" href="https://aquaengineering.mk/" />
    <link rel="alternate" hreflang="mk" href="https://aquaengineering.mk/mk" />
    <link rel="alternate" hreflang="x-default" href="https://aquaengineering.mk/" />
    <meta property="og:title" content="Aqua Engineering" />
    <meta
      property="og:description"
      content="English description"
    />
    <meta property="og:url" content="https://aquaengineering.mk/" />
    <meta property="og:site_name" content="Aqua Engineering" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:locale:alternate" content="mk_MK" />
    <meta property="og:image" content="https://aquaengineering.mk/og-en.png" />
    <meta name="twitter:image" content="https://aquaengineering.mk/og-en.png" />
  </head>
  <body><div id="app"></div></body>
</html>`

const get = (html: string, re: RegExp) => html.match(re)?.[1] ?? null

describe('the Macedonian shell', () => {
  const mk = shellFor(TEMPLATE, 'mk')

  it('declares Macedonian, not English', () => {
    expect(get(mk, /<html lang="([^"]*)"/)).toBe('mk')
    expect(get(mk, /og:locale"[^>]*content="([^"]*)"/s)).toBe('mk_MK')
  })

  it('carries Macedonian copy in the title and both descriptions', () => {
    expect(get(mk, /<title>([^<]*)<\/title>/)).toBe(content.mk.meta.title)
    expect(get(mk, /name="description"[\s\S]{0,20}?content="([^"]*)"/)).toBe(
      content.mk.meta.description,
    )
    expect(get(mk, /og:description"[\s\S]{0,20}?content="([^"]*)"/)).toBe(
      content.mk.meta.description,
    )
  })

  it('points canonical and og:url at /mk', () => {
    expect(get(mk, /rel="canonical" href="([^"]*)"/)).toBe('https://aquaengineering.mk/mk')
    expect(get(mk, /og:url"[\s\S]{0,20}?content="([^"]*)"/)).toBe('https://aquaengineering.mk/mk')
  })

  it('uses the Macedonian social card, not the English one', () => {
    expect(get(mk, /og:image"[\s\S]{0,20}?content="([^"]*)"/)).toBe(
      'https://aquaengineering.mk/og-mk.png',
    )
    expect(get(mk, /twitter:image"[\s\S]{0,20}?content="([^"]*)"/)).toBe(
      'https://aquaengineering.mk/og-mk.png',
    )
  })

  it('names English as the alternate locale', () => {
    expect(get(mk, /og:locale:alternate"[^>]*content="([^"]*)"/s)).toBe('en_GB')
  })

  it('leaves no English copy behind anywhere in the head', () => {
    // og:locale:alternate is excluded on purpose: naming the *other* language
    // is exactly what that tag is for, so en_GB belongs on the Macedonian page.
    const head = mk
      .slice(0, mk.indexOf('</head>'))
      .replace(/<meta property="og:locale:alternate"[^>]*\/>/, '')

    expect(head).not.toContain('English description')
    expect(head).not.toContain('en_GB')
    expect(head).not.toContain('og-en.png')
    expect(head).not.toContain('Aqua Engineering')
  })
})

describe('the English shell', () => {
  const en = shellFor(TEMPLATE, 'en')

  it('stays at the root URL rather than gaining a locale segment', () => {
    expect(get(en, /rel="canonical" href="([^"]*)"/)).toBe('https://aquaengineering.mk/')
    expect(get(en, /og:url"[\s\S]{0,20}?content="([^"]*)"/)).toBe('https://aquaengineering.mk/')
  })

  it('names Macedonian as the alternate locale', () => {
    expect(get(en, /og:locale:alternate"[^>]*content="([^"]*)"/s)).toBe('mk_MK')
  })
})

describe('a standalone page', () => {
  const privacy = PAGES.find((p) => p.slug === 'privacy')!

  it('titles and describes itself rather than inheriting the home page', () => {
    const en = shellFor(TEMPLATE, 'en', privacy)
    expect(get(en, /<title>([^<]*)<\/title>/)).toContain('Privacy notice')
    expect(get(en, /name="description"[\s\S]{0,20}?content="([^"]*)"/)).not.toBe(
      'English description',
    )
  })

  it('canonicalises to its own URL in each language', () => {
    expect(get(shellFor(TEMPLATE, 'en', privacy), /rel="canonical" href="([^"]*)"/)).toBe(
      'https://aquaengineering.mk/privacy',
    )
    expect(get(shellFor(TEMPLATE, 'mk', privacy), /rel="canonical" href="([^"]*)"/)).toBe(
      'https://aquaengineering.mk/mk/privacy',
    )
  })

  it('points its alternates at the same page, not back at the home page', () => {
    const mk = shellFor(TEMPLATE, 'mk', privacy)
    expect(get(mk, /hreflang="en" href="([^"]*)"/)).toBe('https://aquaengineering.mk/privacy')
    expect(get(mk, /hreflang="mk" href="([^"]*)"/)).toBe('https://aquaengineering.mk/mk/privacy')
  })
})

describe('paths match the router', () => {
  it.each([
    ['en', '', '/'],
    ['mk', '', '/mk'],
    ['en', 'privacy', '/privacy'],
    ['mk', 'privacy', '/mk/privacy'],
  ] as const)('%s + %s -> %s', (locale, slug, expected) => {
    expect(pathFor(locale, slug)).toBe(expected)
  })

  it('never gives /mk a trailing slash, which would disagree with its canonical', () => {
    expect(pathFor('mk', '')).not.toMatch(/\/$/)
  })
})

describe('the rewriter fails loudly', () => {
  it('throws when a meta tag it is meant to rewrite is missing', () => {
    const without = TEMPLATE.replace(/<meta property="og:image"[^>]*\/>/, '')
    expect(() => shellFor(without, 'mk')).toThrow(/og:image/)
  })

  it('throws when an hreflang link is missing', () => {
    const without = TEMPLATE.replace(/<link rel="alternate" hreflang="mk"[^>]*\/>/, '')
    expect(() => shellFor(without, 'mk')).toThrow(/hreflang="mk"/)
  })
})
