/** Values that are identical in every locale, so they are written once. */

export const PHONES = [
  { label: '+389 (0) 23 222 254', href: 'tel:+38923222254' },
  { label: '+389 (0) 71 700 818', href: 'tel:+38971700818' },
  { label: '+44 (0) 7703625452', href: 'tel:+447703625452' },
] as const

export const EMAILS = ['contact@aquaengineering.mk', 'goran.trencevski@aquaengineering.mk'] as const

export const LICENCE_IMAGES = {
  design: 'Licenca-A-Proektiranje-20281030.jpg',
  revision: 'Licenca-A-za-Revizija-20250223.jpg',
} as const

/** Founded 2010; used in the LocalBusiness structured data. */
export const FOUNDED = 2010

export const ADDRESS = {
  street: 'Orce Nikolov 202/2-30',
  locality: 'Skopje',
  postalCode: '1000',
  country: 'MK',
} as const
