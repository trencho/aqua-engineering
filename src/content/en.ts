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
    pauseMotion: 'Pause animation',
    playMotion: 'Play animation',
    privacyLink: 'Privacy notice',
    formPrivacyNote:
      'We use what you send here only to reply to you. See the privacy notice for the detail.',
    backToSite: 'Back to the site',
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  },
  privacy: {
    title: 'Privacy notice',
    updated: '2026-09-17',
    intro: [
      'This notice explains what happens to personal data on aquaengineering.mk. It is short because the site does very little: it runs no analytics, it sets no cookies of its own, and it collects nothing at all unless you choose to send us a message. The one thing it does load from elsewhere is the video on the home page, which is covered below.',
    ],
    sections: [
      {
        id: 'controller',
        heading: 'Who is responsible',
        paragraphs: [
          'Aqua Engineering, Orce Nikolov 202/2-30, 1000 Skopje, Republic of North Macedonia, is the controller of any personal data described here.',
          'For anything in this notice, including a request to see, correct or delete your data, write to contact@aquaengineering.mk.',
        ],
      },
      {
        id: 'what-we-collect',
        heading: 'What the site collects',
        paragraphs: [
          'Browsing the site collects nothing on our side. We set no cookies, use no local storage, run no analytics and load no advertising or social media trackers. Fonts are served from this site rather than fetched from a third party.',
          'The home page plays a short video hosted by Vimeo. Loading it tells Vimeo your IP address, your browser details and which page you are on, and Vimeo may store data on your device. We request it in Do Not Track mode, which Vimeo states stops it being used to track you or to build advertising profiles. You can stop the video with the control on it, and if your device is set to reduce motion it is never loaded at all.',
          'The contact section shows a map served by Google. It loads only once you scroll to it, and loading it tells Google your IP address and which page you are on. Google sets cookies for the map whether or not you interact with it. If you would rather it never loaded, the address above the map is the same one it points at.',
          'The only data you give us is what you type into the contact form:',
        ],
        list: [
          'Your first and last name',
          'Your email address',
          'The message you write',
          'Which language version of the site you used',
        ],
      },
      {
        id: 'why',
        heading: 'Why we use it, and on what basis',
        paragraphs: [
          'We use it to read your message and reply. Nothing else. We do not send marketing, and we do not build a profile of you.',
          'The lawful basis is that processing is necessary to take steps at your request before entering into a contract, and where your enquiry is not about our services, our legitimate interest in answering correspondence addressed to us.',
        ],
      },
      {
        id: 'sharing',
        heading: 'Who else sees it',
        paragraphs: [
          'The form is delivered by Web3Forms, which receives your submission and forwards it to our inbox. They act as a processor on our behalf. Their own privacy policy at web3forms.com describes how they handle the data in transit.',
          "Mail sent to contact@aquaengineering.mk is forwarded on to personal mailboxes at Gmail and Yahoo, because that is how we read it. Your message therefore passes through Google's and Yahoo's servers as well as ours.",
          'The home page video is served by Vimeo, and the contact map by Google. For what each receives when its content loads they act as independent controllers rather than as processors for us, so their own privacy policies at vimeo.com and policies.google.com govern that.',
          'Our web host stores standard server access logs, which include the IP address that requested a page. That is a normal part of running any website and is used for security and diagnostics.',
          'We do not sell personal data and we do not share it with anyone else, unless we are legally required to.',
        ],
      },
      {
        id: 'retention',
        heading: 'How long we keep it',
        paragraphs: [
          "Enquiries that do not lead to work are deleted two years after our last contact with you. If your enquiry becomes a project, the correspondence is kept with that project's records for as long as we keep those. If you ask us to delete your message sooner, we will.",
          'Server log retention is set by our hosting provider rather than by us.',
        ],
      },
      {
        id: 'rights',
        heading: 'Your rights',
        paragraphs: [
          'Under the Law on Personal Data Protection of the Republic of North Macedonia, and under the GDPR where it applies to you, you can ask us to:',
        ],
        list: [
          'Confirm whether we hold data about you, and give you a copy',
          'Correct anything inaccurate',
          'Delete it',
          'Restrict or object to how we use it',
          'Provide it in a portable format',
        ],
      },
      {
        id: 'complaints',
        heading: 'Complaints',
        paragraphs: [
          'Write to us first and we will try to put it right. You also have the right to complain to the Agency for Personal Data Protection of the Republic of North Macedonia, or to the supervisory authority where you live.',
        ],
      },
      {
        id: 'changes',
        heading: 'Changes to this notice',
        paragraphs: [
          'If we change what the site does with data, we will change this notice and update the date at the top. There is no version history to consult, so the date is the thing to check.',
        ],
      },
    ],
  },
  nav: [
    { id: 'home', label: 'Home' },
    { id: 'whoweare', label: 'Who we are' },
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
    mapTitle: 'Map showing the location of the Aqua Engineering office in Skopje',
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
