import type { SiteContent } from './types'
import { EMAILS, LICENCE_IMAGES, PHONES } from './shared'

/** Copy recovered verbatim from the 2026-04-20 archive of aquaengineering.mk. */
export const en: SiteContent = {
  lang: 'en-GB',
  ogLocale: 'en_GB',
  logo: {
    colour: 'ENG-Color.svg',
    white: 'ENG-White.svg',
    alt: 'Aqua Engineering',
  },
  meta: {
    title: 'Aqua Engineering',
    description:
      'Aqua Engineering is a design and consultancy company that specializes in water and environmental projects. The company was founded in 2010 and has since completed projects in the areas of water supply, drainage, pumping stations, sewerage treatment, flood protection, river regulation, and environmental assessment studies.',
  },
  ui: {
    menu: 'Menu',
    skipToContent: 'Skip to content',
    viewFullSize: 'View full size',
  },
  nav: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Who we are' },
    { id: 'licenses', label: 'Licenses' },
    { id: 'contact', label: 'Contact' },
  ],
  hero: {
    taglines: [
      'We offer design and consultancy services in the areas of water engineering and environmental protection.',
      'We employ a multidisciplinary approach that combines both local knowledge and expertise to provide appropriate and sustainable solutions.',
      'We collaborate with clients from both private and public sectors to successfully complete a variety of projects.',
    ],
  },
  about: {
    heading: 'Who we are:',
    paragraphs: [
      'Aqua Engineering is a design and consultancy company that specializes in water and environmental projects. The company was founded in 2010 and has since completed projects in the areas of water supply, drainage, pumping stations, sewerage treatment, flood protection, river regulation, and environmental assessment studies.',
      'Our projects follow strict legal standards and undergo various planning stages which include conceptual designs, detailed designs, tender documents, and \u201Cas-built\u201D drawings.',
      'Aqua Engineering offers services for projects that cover a wide range of areas and has collaborated with regional consultancy companies to provide similar services.',
      'We strive to safeguard water, which is the most vital natural resource for our planet.',
    ],
  },
  licences: {
    heading: 'We own the licenses to achieve your goals.',
    body: 'Our team consists of authorized engineers specializing in construction, architecture, geodesy, and fire detection. While our projects are primarily based in the Republic of Macedonia, our team has extensive regional and international experience.',
    items: [
      {
        image: LICENCE_IMAGES.design,
        caption: 'License A for Design of the company',
        alt: 'Scanned certificate: License A for Design, valid to 30 October 2028',
      },
      {
        image: LICENCE_IMAGES.revision,
        caption: 'License A for Revision of the company',
        alt: 'Scanned certificate: License A for Revision, valid to 23 February 2025',
      },
    ],
  },
  contact: {
    heading: 'Contact Us:',
    fields: [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'email', label: 'Email' },
      { name: 'message', label: 'Your Message' },
    ],
    submit: 'Send',
    submitting: 'Sending\u2026',
    success: 'Thank you. Your message has been sent.',
    error: 'Your message could not be sent. Please email us directly.',
    office: {
      label: 'Head Office',
      lines: ['Orce Nikolov 202/2-30', 'Skopje 1000', 'Republic of N. Macedonia'],
    },
    phoneLabel: 'Tel',
    mobileLabel: 'Mob',
  },
  phones: PHONES.map((p) => p.label),
  emails: EMAILS,
}
