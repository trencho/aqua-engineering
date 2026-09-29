import { describe, expect, it } from 'vitest'
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
