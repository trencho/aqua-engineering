import { describe, expect, it } from 'vitest'
// Imported rather than hardcoded, so changing a colour in tokens.css fails here
// instead of shipping. Three notes, each of which cost an attempt:
//   - ?inline returns the text; ?raw comes back empty for CSS.
//   - it needs `css: true` in the Vitest config, or CSS is skipped entirely.
//   - node:fs is not an option. These specs sit under tsconfig.app.json, which
//     deliberately has no node types so app code cannot reach for `process`.
import css from './tokens.css?inline'

/**
 * Contrast is the accessibility check automated tooling most often misses:
 * axe skips the colour-contrast rule entirely under jsdom, so a green a11y
 * suite says nothing about it. These assertions read the real tokens file, so
 * changing a colour in `tokens.css` fails here rather than shipping.
 *
 * Thresholds are WCAG 2.2 AA: 4.5:1 normal text, 3:1 large text (>=24px, or
 * >=18.66px bold) and 3:1 for non-text that conveys meaning (1.4.11).
 */

/** Pull a custom property straight out of the stylesheet. */
function token(name: string): string {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`))
  if (!m) throw new Error(`token --${name} not found in tokens.css`)
  return m[1]
}

function rgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const surface = () => token('c-surface')
const surfaceAlt = () => token('c-surface-alt')

describe('the contrast helper itself', () => {
  it('matches the known extremes, so a passing suite is not measuring nothing', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })
})

describe('normal text meets 4.5:1 on both surfaces', () => {
  const cases: [string, string][] = [
    ['body', 'c-text'],
    ['muted', 'c-muted'],
    ['headings', 'c-primary'],
    ['error', 'c-danger'],
  ]

  it.each(cases)('%s', (_label, name) => {
    expect(contrast(token(name), surface())).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(name), surfaceAlt())).toBeGreaterThanOrEqual(4.5)
  })

  it('white on the footer', () => {
    expect(contrast(token('c-on-dark'), token('c-accent'))).toBeGreaterThanOrEqual(4.5)
  })

  it('the nav hover colour, which is small text and not exempt', () => {
    expect(contrast(token('c-accent'), surface())).toBeGreaterThanOrEqual(4.5)
  })
})

describe('large text meets 3:1', () => {
  it('the hero taglines, which are 28px and above at weight 800', () => {
    expect(contrast(token('c-secondary-text'), surface())).toBeGreaterThanOrEqual(3)
    expect(contrast(token('c-secondary-text'), surfaceAlt())).toBeGreaterThanOrEqual(3)
  })
})

describe('non-text meets 3:1 (WCAG 1.4.11)', () => {
  it('the focus ring, on both surfaces', () => {
    expect(contrast(token('c-secondary-text'), surface())).toBeGreaterThanOrEqual(3)
    expect(contrast(token('c-secondary-text'), surfaceAlt())).toBeGreaterThanOrEqual(3)
  })

  it('a form field border, which is the only thing marking where the field is', () => {
    expect(contrast(token('c-border-field'), surface())).toBeGreaterThanOrEqual(3)
  })
})

describe('the logo blue is kept as recovered', () => {
  it('stays #39f even though it would fail as text: WCAG exempts logotypes', () => {
    expect(token('c-secondary')).toBe('#39f')
    expect(contrast(token('c-secondary'), surface())).toBeLessThan(3)
  })

  it('and is therefore distinct from the token used for text and controls', () => {
    expect(token('c-secondary-text')).not.toBe(token('c-secondary'))
  })
})
