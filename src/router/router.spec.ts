import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { router as appRouter } from './index'
import { LOCALES } from '@/content'
import { pagePathOf, pathIn } from '@/composables/useLocale'

/**
 * The routes are the contract with the old WordPress site: Polylang served
 * English at / and Macedonian at /mk, and anything already linked or indexed
 * depends on those staying put.
 */

describe('the URL contract with the old site', () => {
  const paths = appRouter.getRoutes().map((r) => r.path)

  it('still serves English at the root and Macedonian at /mk', () => {
    expect(paths).toContain('/')
    expect(paths).toContain('/mk')
  })

  it('tags each route with the locale the components read', () => {
    const byPath = Object.fromEntries(appRouter.getRoutes().map((r) => [r.path, r.meta.locale]))
    expect(byPath['/']).toBe('en')
    expect(byPath['/mk']).toBe('mk')
  })

  it('covers every locale the content ships', () => {
    const routed = appRouter
      .getRoutes()
      .map((r) => r.meta.locale)
      .filter(Boolean)
    for (const locale of LOCALES) expect(routed).toContain(locale)
  })

  it('sends an unknown path to the English page rather than a dead end', async () => {
    const r = createRouter({ history: createMemoryHistory(), routes: appRouter.getRoutes() })
    await r.push('/wp-content/plugins/something')
    expect(r.currentRoute.value.path).toBe('/')
  })
})

describe('switching language keeps the reader on the same page', () => {
  it.each([
    ['/', 'mk', '/mk'],
    ['/mk', 'en', '/'],
    ['/privacy', 'mk', '/mk/privacy'],
    ['/mk/privacy', 'en', '/privacy'],
  ] as const)('%s -> %s = %s', (from, to, expected) => {
    expect(pathIn(to, from)).toBe(expected)
  })

  it('strips the locale prefix without eating a page that merely starts with mk', () => {
    expect(pagePathOf('/mk')).toBe('/')
    expect(pagePathOf('/mk/privacy')).toBe('/privacy')
    // A hypothetical /mkd-something must not be treated as the mk prefix.
    expect(pagePathOf('/mkd-report')).toBe('/mkd-report')
  })

  it('round-trips every route through both locales', () => {
    for (const path of ['/', '/privacy']) {
      expect(pathIn('en', pathIn('mk', path))).toBe(path)
    }
  })
})
