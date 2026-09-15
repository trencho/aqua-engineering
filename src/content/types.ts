/**
 * The shape every locale must satisfy.
 *
 * Both locales are checked against this interface, so a missing Macedonian
 * string is a build failure rather than an English string leaking into the
 * Macedonian page. `content.spec.ts` additionally checks that no field was
 * satisfied by copying the English text across.
 */

export type Locale = 'en' | 'mk'

export interface NavItem {
  /** Anchor target, shared across locales so section ids stay stable. */
  id: SectionId
  label: string
}

export type SectionId = 'home' | 'about' | 'licenses' | 'contact'

export interface LicenceItem {
  /** Filename in src/assets/licences, shared across locales. */
  image: string
  caption: string
  alt: string
}

export interface ContactField {
  name: 'firstName' | 'lastName' | 'email' | 'message'
  label: string
}

export interface SiteContent {
  /** BCP 47 tag for the <html lang> attribute and og:locale. */
  lang: string
  ogLocale: string
  /** Wordmark SVG for this locale, colour and white variants. */
  logo: { colour: string; white: string; alt: string }
  meta: { title: string; description: string }
  nav: NavItem[]
  hero: { taglines: string[] }
  about: { heading: string; paragraphs: string[] }
  licences: { heading: string; body: string; items: LicenceItem[] }
  contact: {
    heading: string
    fields: ContactField[]
    submit: string
    submitting: string
    success: string
    error: string
    office: { label: string; lines: string[] }
    phoneLabel: string
    mobileLabel: string
  }
  /** Locale-independent, but kept here so one import covers a whole page. */
  phones: readonly string[]
  emails: readonly string[]
}
