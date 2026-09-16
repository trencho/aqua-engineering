import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { router as appRouter } from './index'
import { LOCALES } from '@/content'

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
