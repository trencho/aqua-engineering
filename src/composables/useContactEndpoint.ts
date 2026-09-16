/**
 * Where the contact form posts, and whether it can post at all.
 *
 * Shared because two components need the answer for different reasons:
 * `ContactForm` will not render a form it cannot submit, and `ContactSection`
 * changes its layout when the form is absent. Reading the variable in both
 * places independently would let them disagree.
 *
 * The key is read per call rather than at module load, so a test can stub the
 * environment before mounting.
 */
export const CONTACT_ENDPOINT = 'https://api.web3forms.com/submit'

export interface ContactEndpoint {
  url: string
  accessKey: string
  /** False when no key is configured; the form hides itself rather than failing. */
  enabled: boolean
}

export function useContactEndpoint(): ContactEndpoint {
  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY ?? ''
  return { url: CONTACT_ENDPOINT, accessKey, enabled: accessKey.length > 0 }
}
