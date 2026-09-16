import { describe, expect, it } from 'vitest'
import { content, LOCALES } from './index'
import { en } from './en'
import { mk } from './mk'

/**
 * The type system already forces both locales to carry every field. What it
 * cannot catch is a field satisfied by pasting the English text in, or an
 * array that drifted to a different length so one language shows three
 * taglines and the other two. Those are the failures this file exists for.
 */

/** Prose that a Macedonian reader must see in Macedonian. */
function proseOf(c: typeof en): string[] {
  return [
    c.meta.title,
    c.meta.description,
    c.ui.menu,
    c.ui.skipToContent,
    c.ui.viewFullSize,
    ...c.nav.map((n) => n.label),
    ...c.hero.taglines,
    c.about.heading,
    ...c.about.paragraphs,
    c.licences.heading,
    c.licences.body,
    ...c.licences.items.flatMap((i) => [i.caption, i.alt]),
    c.contact.heading,
    ...c.contact.fields.map((f) => f.label),
    c.contact.submit,
    c.contact.submitting,
    c.contact.success,
    c.contact.error,
    c.contact.office.label,
    ...c.contact.office.lines,
    c.contact.phoneLabel,
    c.contact.mobileLabel,
  ]
}

describe('locale coverage', () => {
  it('ships exactly the two locales the old site served', () => {
    expect(LOCALES.sort()).toEqual(['en', 'mk'])
  })

  it.each(LOCALES)('%s has no empty or whitespace-only string', (locale) => {
    const blank = proseOf(content[locale]).filter((s) => s.trim().length === 0)
    expect(blank).toEqual([])
  })
})

describe('structural parity between locales', () => {
  it('shows the same number of hero taglines', () => {
    expect(mk.hero.taglines).toHaveLength(en.hero.taglines.length)
  })

  it('shows the same number of about paragraphs', () => {
    expect(mk.about.paragraphs).toHaveLength(en.about.paragraphs.length)
  })

  it('shows the same number of licences', () => {
    expect(mk.licences.items).toHaveLength(en.licences.items.length)
  })

  it('keeps section ids stable, so one set of anchors serves both languages', () => {
    expect(mk.nav.map((n) => n.id)).toEqual(en.nav.map((n) => n.id))
  })

  it('keeps form field names stable, so one submit handler serves both', () => {
    expect(mk.contact.fields.map((f) => f.name)).toEqual(en.contact.fields.map((f) => f.name))
  })

  it('points both locales at the same licence scans', () => {
    expect(mk.licences.items.map((i) => i.image)).toEqual(en.licences.items.map((i) => i.image))
  })
})

describe('the Macedonian locale is actually translated', () => {
  it('reuses no English prose string', () => {
    const english = new Set(proseOf(en))
    const untranslated = proseOf(mk).filter((s) => english.has(s))
    expect(untranslated).toEqual([])
  })

  it('writes its prose in Cyrillic', () => {
    const latinOnly = proseOf(mk).filter((s) => !/[\u0400-\u04FF]/.test(s))
    expect(latinOnly).toEqual([])
  })

  it('declares a different lang and og:locale from English', () => {
    expect(mk.lang).not.toBe(en.lang)
    expect(mk.ogLocale).not.toBe(en.ogLocale)
  })

  it('uses its own wordmark rather than the English one', () => {
    expect(mk.logo.colour).not.toBe(en.logo.colour)
    expect(mk.logo.white).not.toBe(en.logo.white)
  })
})

describe('contact details survived the rebuild', () => {
  it.each(LOCALES)('%s lists all three published phone numbers', (locale) => {
    expect(content[locale].phones).toHaveLength(3)
  })

  it.each(LOCALES)('%s lists both published email addresses', (locale) => {
    expect(content[locale].emails).toEqual([
      'contact@aquaengineering.mk',
      'goran.trencevski@aquaengineering.mk',
    ])
  })
})
