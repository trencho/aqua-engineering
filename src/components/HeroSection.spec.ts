import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, type Component } from 'vue'
import { mountAt } from '@/test/mount'
import { content, type Locale } from '@/content'

/**
 * The hero loads the site's first third party and auto-plays two things at
 * once, so what is checked here is the behaviour the privacy notice and WCAG
 * 2.2.2 promise in return: reduced motion requests nothing, the control stops
 * both the video and the rotation, and the decision survives a route change.
 * The disclosure itself is policed by privacy-claims.spec.ts.
 *
 * The component keeps its paused/playing state at module scope, which is the
 * point of it. That makes the module stateful between tests, so every test gets
 * a fresh registry via resetModules rather than inheriting the last one's
 * choice.
 */

let HeroSection: Component

function stubMotion(reduced: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    addListener: () => {},
    removeListener: () => {},
  }))
}

/** The frame is deferred to idle, so drive the callback rather than waiting. */
function stubIdle() {
  vi.stubGlobal('requestIdleCallback', (cb: () => void) => {
    cb()
    return 1
  })
}

async function load() {
  vi.resetModules()
  HeroSection = (await import('./HeroSection.vue')).default
}

/** onMounted resolves the preference and the idle callback, so settle twice. */
async function mountHero(locale: Locale = 'en') {
  const { wrapper } = await mountAt(HeroSection, locale)
  await nextTick()
  await nextTick()
  return wrapper
}

beforeEach(stubIdle)
afterEach(() => vi.unstubAllGlobals())

describe('with motion allowed', () => {
  beforeEach(async () => {
    stubMotion(false)
    await load()
  })

  it('loads the background video', async () => {
    expect((await mountHero()).find('iframe').exists()).toBe(true)
  })

  it('asks Vimeo not to track, which the privacy notice states we do', async () => {
    expect((await mountHero()).find('iframe').attributes('src')).toContain('dnt=1')
  })

  it('keeps the frame out of the tab order and hidden from assistive tech', async () => {
    const wrapper = await mountHero()
    expect(wrapper.find('iframe').attributes('tabindex')).toBe('-1')
    expect(wrapper.find('.hero__video').attributes('aria-hidden')).toBe('true')
  })

  it('shows one tagline at a time, as the original did', async () => {
    const wrapper = await mountHero()
    expect(wrapper.find('.hero__list').classes()).toContain('hero__list--rotating')
    expect(wrapper.findAll('.hero__item.is-active')).toHaveLength(1)
  })

  it('advances to the next tagline on the 15 second cycle', async () => {
    vi.useFakeTimers()
    const wrapper = await mountHero()
    const first = wrapper.find('.hero__item.is-active').text()
    vi.advanceTimersByTime(15_000)
    await nextTick()
    expect(wrapper.find('.hero__item.is-active').text()).not.toBe(first)
    vi.useRealTimers()
  })

  it('stops the video and the rotation together, which WCAG 2.2.2 wants', async () => {
    vi.useFakeTimers()
    const wrapper = await mountHero()
    const showing = wrapper.find('.hero__item.is-active').text()

    await wrapper.find('.hero__toggle').trigger('click')
    expect(wrapper.find('iframe').exists()).toBe(false)

    // The statement on screen when it was stopped stays on screen.
    vi.advanceTimersByTime(45_000)
    await nextTick()
    expect(wrapper.find('.hero__item.is-active').text()).toBe(showing)
    vi.useRealTimers()
  })
})

describe('when the viewer has asked for reduced motion', () => {
  beforeEach(async () => {
    stubMotion(true)
    await load()
  })

  it('never requests the third-party frame at all', async () => {
    expect((await mountHero()).find('iframe').exists()).toBe(false)
  })

  it('stacks every tagline instead, so none of the three is withheld', async () => {
    const wrapper = await mountHero()
    expect(wrapper.find('.hero__list').classes()).not.toContain('hero__list--rotating')
    expect(wrapper.findAll('.hero__item')).toHaveLength(content.en.hero.taglines.length)
  })

  it('still offers to start it, so the choice stays with the viewer', async () => {
    const wrapper = await mountHero()
    expect(wrapper.find('.hero__toggle').text()).toBe(content.en.ui.playMotion)
    await wrapper.find('.hero__toggle').trigger('click')
    expect(wrapper.find('iframe').exists()).toBe(true)
  })
})

describe('the choice survives navigation', () => {
  beforeEach(async () => {
    stubMotion(false)
    await load()
  })

  it('stays paused after the component is unmounted and mounted again', async () => {
    const first = await mountHero()
    await first.find('.hero__toggle').trigger('click')
    expect(first.find('iframe').exists()).toBe(false)
    first.unmount()

    // Leaving for /privacy and coming back must not restart the video.
    const second = await mountHero()
    expect(second.find('iframe').exists()).toBe(false)
    expect(second.find('.hero__toggle').text()).toBe(content.en.ui.playMotion)
  })
})

describe('the hero itself', () => {
  beforeEach(async () => {
    stubMotion(false)
    await load()
  })

  it('keeps every tagline in the DOM for crawlers and screen readers', async () => {
    const wrapper = await mountHero()
    const rendered = wrapper.findAll('.hero__item').map((n) => n.text())
    expect(rendered).toEqual(content.en.hero.taglines)
  })

  it('labels the control in the active language', async () => {
    const wrapper = await mountHero('mk')
    expect(wrapper.find('.hero__toggle').text()).toBe(content.mk.ui.pauseMotion)
  })

  it('keeps the anchor the navigation links to', async () => {
    expect((await mountHero()).find('#home').exists()).toBe(true)
  })
})
