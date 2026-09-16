import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SiteLogo from './SiteLogo.vue'

/**
 * This component exists because of two real defects, and both are easy to
 * reintroduce:
 *
 *  1. The wordmark's text is set in Century Gothic, which almost nobody has
 *     installed. An SVG referenced through <img> is an isolated document and
 *     cannot use a font the page loaded, so the logo rendered in a serif
 *     everywhere. Inlining fixes it.
 *  2. All four wordmark files name their classes cls-1..cls-5. Inlining two of
 *     them puts both <style> blocks in one document, where those generic names
 *     collide — the white footer variant repainted the coloured header wordmark
 *     white. The component namespaces them per file.
 *
 * Neither failure throws. Both just look wrong, which is exactly the kind of
 * regression a test has to catch.
 */

const mountLogo = (file: string, alt = 'Aqua Engineering') =>
  mount(SiteLogo, { props: { file, alt } })

describe('inlining', () => {
  it('puts the SVG in the document rather than referencing it', () => {
    const w = mountLogo('ENG-Color.svg')
    expect(w.find('svg').exists()).toBe(true)
    expect(w.find('img').exists()).toBe(false)
  })

  it('keeps the wordmark as real text, so it can use the page font', () => {
    const w = mountLogo('ENG-Color.svg')
    expect(w.findAll('text').length).toBeGreaterThan(0)
  })

  it('carries the Cyrillic wordmark in the Macedonian variant', () => {
    const w = mountLogo('MKD-Color-Transparent.svg', 'Аква Инженеринг')
    expect(w.text()).toMatch(/[Ѐ-ӿ]/)
  })

  it('no longer asks for Century Gothic first', () => {
    const w = mountLogo('ENG-Color.svg')
    const style = w.find('style').element.textContent ?? ''
    expect(style).toContain('Didact Gothic')
    expect(style).not.toMatch(/font-family:\s*CenturyGothic-Bold/)
  })
})

describe('class namespacing', () => {
  it('rewrites every generic cls-* name', () => {
    const html = mountLogo('ENG-Color.svg').html()
    expect(html).not.toMatch(/["\s]cls-\d/)
    expect(html).toMatch(/ENGColor-cls-\d/)
  })

  it('gives two variants disjoint class names, so their styles cannot collide', () => {
    const colour = mountLogo('ENG-Color.svg').html()
    const white = mountLogo('ENG-White.svg').html()

    const names = (h: string) => new Set(h.match(/[A-Za-z]+-cls-\d/g) ?? [])
    const shared = [...names(colour)].filter((n) => names(white).has(n))

    expect(names(colour).size).toBeGreaterThan(0)
    expect(shared).toEqual([])
  })

  it('renames the selectors inside the style block too, not just the attributes', () => {
    const w = mountLogo('ENG-White.svg')
    const style = w.find('style').element.textContent ?? ''
    expect(style).toMatch(/\.ENGWhite-cls-\d/)
    expect(style).not.toMatch(/\.cls-\d/)
  })

  it('is deterministic, so the same file always yields the same names', () => {
    expect(mountLogo('ENG-Color.svg').html()).toBe(mountLogo('ENG-Color.svg').html())
  })
})

describe('accessibility', () => {
  it('exposes the logo as a named image when it carries meaning', () => {
    const svg = mountLogo('ENG-Color.svg').find('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toBe('Aqua Engineering')
  })

  it('hides it from assistive tech when the name is empty', () => {
    const svg = mountLogo('ENG-Color.svg', '').find('svg')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('role')).toBe('presentation')
  })

  it('keeps it out of the tab order', () => {
    expect(mountLogo('ENG-Color.svg').find('svg').attributes('focusable')).toBe('false')
  })
})

describe('failure', () => {
  it('throws on an unknown file rather than rendering nothing', () => {
    expect(() => mount(SiteLogo, { props: { file: 'NoSuch.svg', alt: 'x' } })).toThrow(
      /logo not found/,
    )
  })
})
