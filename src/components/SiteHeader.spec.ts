import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mountAt } from '@/test/mount'
import SiteHeader from './SiteHeader.vue'
import header from './SiteHeader.vue?raw'

/**
 * The header logo once rendered 300px wide on every phone and pushed the menu
 * toggle off screen, so a visitor had no way to open the navigation. The cause:
 * with `width: auto` the flex item shrink-wraps its SVG, the SVG's `width: 100%`
 * has nothing to resolve against, and the browser falls back to the 300px
 * default for an SVG without a width attribute. jsdom does no layout, so these
 * tests pin the two facts the fix depends on rather than measuring pixels.
 */

const logos = import.meta.glob<string>('@/assets/logo/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw',
})

function logoRule(): string {
  const match = /\.header__logo :deep\(\.logo\) \{([^}]*)\}/.exec(header)
  if (!match) throw new Error('header logo rule not found')
  return match[1]
}

describe('header logo sizing', () => {
  it('derives the width from the height instead of leaving it auto', () => {
    const rule = logoRule()
    expect(rule).toMatch(/height:\s*var\(--logo-h\)/)
    expect(rule).toMatch(/width:\s*calc\(var\(--logo-h\) \* 10 \/ 3\)/)
    expect(rule).not.toMatch(/width:\s*auto/)
  })

  it('uses the 10:3 ratio every logo file actually has', () => {
    const files = Object.entries(logos)
    expect(files).toHaveLength(4)
    for (const [path, svg] of files) {
      expect(svg, path).toMatch(/viewBox="0 0 100 30"/)
    }
  })
})

describe('toggle past the hero', () => {
  type Callback = (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void
  let observed: Callback[] = []

  beforeEach(() => {
    observed = []
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: Callback) {
          observed.push(cb)
        }
        observe() {}
        disconnect() {}
      },
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  const mountHeader = (overlay: boolean) =>
    mountAt(defineComponent({ render: () => h(SiteHeader, { overlay }) }))

  it('floats once the overlay header leaves the viewport, and docks when it returns', async () => {
    const { wrapper } = await mountHeader(true)
    const el = wrapper.find('header')
    expect(observed).toHaveLength(1)
    expect(el.classes()).not.toContain('header--floating')

    observed[0]([{ isIntersecting: false }])
    await nextTick()
    expect(el.classes()).toContain('header--floating')

    observed[0]([{ isIntersecting: true }])
    await nextTick()
    expect(el.classes()).not.toContain('header--floating')
    wrapper.unmount()
  })

  it('leaves the sticky header on other pages alone', async () => {
    const { wrapper } = await mountHeader(false)
    expect(observed).toHaveLength(0)
    wrapper.unmount()
  })
})

describe('navigation away from the home page', () => {
  /**
   * The sections exist only on the home page. On /privacy the menu links once
   * scrolled to an element that was not there and prevented the default, so
   * all four did nothing, and the logo linked back to the page it sat on.
   */
  const privacyRoutes = [
    { path: '/', component: { template: '<div />' }, meta: { locale: 'en' } },
    { path: '/mk', component: { template: '<div />' }, meta: { locale: 'mk' } },
    { path: '/privacy', component: { template: '<div />' }, meta: { locale: 'en' } },
    { path: '/mk/privacy', component: { template: '<div />' }, meta: { locale: 'mk' } },
  ]

  async function mountOn(path: string) {
    const router = createRouter({ history: createMemoryHistory(), routes: privacyRoutes })
    await router.push(path)
    await router.isReady()
    const wrapper = mount(SiteHeader, { global: { plugins: [router] }, attachTo: document.body })
    return { wrapper, router }
  }

  it.each([
    ['/privacy', '/'],
    ['/mk/privacy', '/mk'],
  ])('from %s the menu goes to %s and the section', async (from, home) => {
    const { wrapper, router } = await mountOn(from)
    const link = wrapper.findAll('.header__link')[1]
    const href = link.attributes('href')!
    expect(href).toMatch(new RegExp(`^${home}#`))

    await link.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe(home)
    expect(router.currentRoute.value.hash).toBe(href.slice(home.length))
    wrapper.unmount()
  })

  it('the logo leads home from the privacy page', async () => {
    const { wrapper } = await mountOn('/mk/privacy')
    expect(wrapper.find('.header__logo').attributes('href')).toBe('/mk')
    wrapper.unmount()
  })

  it('on the home page the links stay in-page anchors', async () => {
    const { wrapper } = await mountOn('/')
    for (const a of wrapper.findAll('.header__link')) expect(a.attributes('href')).toMatch(/^#/)
    wrapper.unmount()
  })
})
