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

export type SectionId = 'home' | 'whoweare' | 'licenses' | 'contact'

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

export interface UiStrings {
  /** Accessible name for the mobile menu button. */
  menu: string
  /** Skip link target text. */
  skipToContent: string
  /** Footer and form link to the privacy notice. */
  privacyLink: string
  /** Sits under the form's submit button. */
  formPrivacyNote: string
  /** Returns the reader to the home page from a standalone page. */
  backToSite: string
  /**
   * Month names, January first.
   *
   * Not delegated to Intl: Chrome ships no Macedonian date data, so
   * `Intl.DateTimeFormat('mk-MK')` resolves to en-US and renders the date in
   * English on the Macedonian page, silently. Verified 2026-09-16 —
   * `supportedLocalesOf(['mk-MK','mk'])` returns an empty array.
   */
  months: string[]
  /** Accessible suffix on a licence link that opens the full scan. */
  viewFullSize: string
  /** Label on the hero motion control while the video and rotation are running. */
  pauseMotion: string
  /** Label on the hero motion control while they are stopped. */
  playMotion: string
}

/** One heading plus its prose, used to build the privacy notice. */
export interface LegalSection {
  /** Anchor id, shared across locales so a deep link works in either language. */
  id: string
  heading: string
  paragraphs: string[]
  /** Optional bullets rendered after the paragraphs. */
  list?: string[]
}

export interface PrivacyContent {
  title: string
  /** ISO date. Rendered in the reader's locale. */
  updated: string
  intro: string[]
  sections: LegalSection[]
}

export interface SiteContent {
  /** BCP 47 tag for the <html lang> attribute and og:locale. */
  lang: string
  ogLocale: string
  /** Wordmark SVG for this locale, colour and white variants. */
  logo: { colour: string; white: string; alt: string }
  meta: { title: string; description: string }
  ui: UiStrings
  privacy: PrivacyContent
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
    /** Accessible name for the embedded map iframe. */
    mapTitle: string
    phoneLabel: string
    mobileLabel: string
  }
  /** Locale-independent, but kept here so one import covers a whole page. */
  phones: readonly string[]
  emails: readonly string[]
}
