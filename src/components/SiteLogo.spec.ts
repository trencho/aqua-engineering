import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SiteLogo from './SiteLogo.vue'

/**
 * This component exists because of two real defects, and both are easy to
 * reintroduce:
 *
 *  1. The wordmark's text was set in Century Gothic, which almost nobody has
 *     installed, and an SVG referenced through <img> is an isolated document
 *     that cannot use a font the page loaded, so the logo rendered in a serif
 *     everywhere. The artwork now carries outlines rather than text, which
 *     holds however the file is loaded. These tests stop a font creeping back.
 *  2. All four wordmark files name their classes cls-1..cls-5. Inlining two of
 *     them puts both <style> blocks in one document, where those generic names
 *     collide — the white footer variant repainted the coloured header wordmark
 *     white. The component namespaces them per file.
 *
 * Neither failure throws. Both just look wrong, which is exactly the kind of
 * regression a test has to catch.
 */

const FILES = [
  'ENG-Color.svg',
  'ENG-White.svg',
  'MKD-Color-Transparent.svg',
  'MKD-White-Transparent.svg',
]

const mountLogo = (file: string, alt = 'Aqua Engineering') =>
  mount(SiteLogo, { props: { file, alt } })

describe('inlining', () => {
  it('puts the SVG in the document rather than referencing it', () => {
    const w = mountLogo('ENG-Color.svg')
    expect(w.find('svg').exists()).toBe(true)
    expect(w.find('img').exists()).toBe(false)
  })

  it('carries the wordmark as outlines, not as text', () => {
    const w = mountLogo('ENG-Color.svg')
    expect(w.findAll('text')).toHaveLength(0)
    expect(w.findAll('path').length).toBeGreaterThan(0)
  })

  it('names no font anywhere, so nothing can be substituted', () => {
    for (const file of FILES) {
      const html = mountLogo(file).html()
      expect(html).not.toMatch(/font-family|font-weight|font-size/)
    }
  })

  it('gives the Macedonian variant its own wordmark, not the English one', () => {
    // The wordmark is the first two paths in every file; the mark follows.
    const wordmark = (file: string) =>
      mountLogo(file)
        .findAll('path')
        .slice(0, 2)
        .map((p) => p.attributes('d'))

    expect(wordmark('MKD-Color-Transparent.svg')).not.toEqual(wordmark('ENG-Color.svg'))
  })

  it('leaves the Cyrillic name to the accessible name, which is where it lives now', () => {
    const svg = mountLogo('MKD-Color-Transparent.svg', 'Аква Инженеринг').find('svg')
    expect(svg.attributes('aria-label')).toMatch(/[Ѐ-ӿ]/)
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
