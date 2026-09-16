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
    c.ui.privacyLink,
    c.ui.formPrivacyNote,
    c.ui.backToSite,
    ...c.ui.months,
    c.privacy.title,
    ...c.privacy.intro,
    ...c.privacy.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.list ?? [])]),
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

  it('gives the privacy notice the same sections in the same order', () => {
    expect(mk.privacy.sections.map((s) => s.id)).toEqual(en.privacy.sections.map((s) => s.id))
  })

  it('keeps each privacy section the same shape, so neither omits a paragraph', () => {
    for (const [i, section] of en.privacy.sections.entries()) {
      expect(mk.privacy.sections[i].paragraphs).toHaveLength(section.paragraphs.length)
      expect(mk.privacy.sections[i].list?.length ?? 0).toBe(section.list?.length ?? 0)
    }
  })

  it('states the same last-updated date in both, since it is one document', () => {
    expect(mk.privacy.updated).toBe(en.privacy.updated)
  })
})

describe('the privacy notice describes what the site actually does', () => {
  it.each(LOCALES)('%s names the controller and a contact address', (locale) => {
    const all = JSON.stringify(content[locale].privacy)
    expect(all).toContain('contact@aquaengineering.mk')
    expect(all).toMatch(/Skopje|Скопје/)
  })

  it.each(LOCALES)('%s names the one third party that receives form data', (locale) => {
    expect(JSON.stringify(content[locale].privacy)).toContain('Web3Forms')
  })

  it.each(LOCALES)('%s discloses each kind of data the form sends', (locale) => {
    // Checked by substance rather than by count: name covers two inputs in one
    // bullet, which reads better than mirroring the form field for field.
    const listed = (
      content[locale].privacy.sections.find((s) => s.id === 'what-we-collect')?.list ?? []
    )
      .join(' ')
      .toLowerCase()

    const expected =
      locale === 'mk'
        ? ['име', 'презиме', 'е-пошта', 'порака', 'јазич']
        : ['name', 'email', 'message', 'language']

    for (const term of expected) expect(listed).toContain(term)
  })

  it.each(LOCALES)('%s names twelve months, so the date never falls back to Intl', (locale) => {
    // Intl has no Macedonian data in Chrome and resolves mk-MK to en-US, so the
    // month names are content rather than a formatter call.
    expect(content[locale].ui.months).toHaveLength(12)
    expect(new Set(content[locale].ui.months).size).toBe(12)
  })

  it.each(LOCALES)('%s carries a parseable last-updated date', (locale) => {
    expect(content[locale].privacy.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(Date.parse(content[locale].privacy.updated))).toBe(false)
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
