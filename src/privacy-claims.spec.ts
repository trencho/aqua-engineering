import { describe, expect, it } from 'vitest'
import { CONTACT_ENDPOINT } from '@/composables/useContactEndpoint'

/**
 * The privacy notice makes factual claims about this codebase: no cookies, no
 * storage, no analytics, no trackers, fonts served from our own origin, and one
 * third party. Those are statements to regulators and visitors, not comments,
 * so they are asserted here rather than trusted.
 *
 * If one of these fails, the fix is usually not the test. Either remove what
 * was added, or change the notice in the same commit.
 */

const sources = import.meta.glob('@/**/*.{ts,vue}', {
  eager: true,
  query: '?raw',
  import: 'default',
})

/** Application source only: a spec may legitimately mention what it forbids. */
const appFiles = Object.entries(sources).filter(([path]) => !path.endsWith('.spec.ts'))

function findIn(pattern: RegExp): string[] {
  return appFiles
    .filter(([, src]) => pattern.test(String(src)))
    .map(([path]) => path.replace('/src/', ''))
}

describe('"There are no cookies, no local storage"', () => {
  it('nothing writes a cookie', () => {
    expect(findIn(/document\s*\.\s*cookie/)).toEqual([])
  })

  it('nothing uses browser storage', () => {
    expect(findIn(/\b(localStorage|sessionStorage|indexedDB)\b/)).toEqual([])
  })
})

describe('"no analytics and no advertising or social media trackers"', () => {
  it('there is no analytics plumbing of any kind', () => {
    expect(
      findIn(/\b(gtag|dataLayer|googletagmanager|GA4|VITE_GA4|_paq|plausible|fathom)\b/i),
    ).toEqual([])
  })

  it('no tracking pixel is constructed', () => {
    expect(findIn(/sendBeacon|new\s+Image\s*\(/)).toEqual([])
  })

  it('no social or advertising SDK is referenced', () => {
    expect(
      findIn(/facebook\.net|connect\.facebook|doubleclick|hotjar|clarity\.ms|segment\.(io|com)/i),
    ).toEqual([])
  })
})

describe('"Fonts are served from this site rather than fetched from a third party"', () => {
  it('no font is loaded from a third-party origin', () => {
    expect(
      findIn(/fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit|fonts\.bunny\.net/),
    ).toEqual([])
  })
})

describe('"The form is delivered by Web3Forms"', () => {
  it('names exactly one third-party origin across the whole application', () => {
    const origins = new Set<string>()
    for (const [, src] of appFiles) {
      for (const m of String(src).matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) {
        const host = m[1].toLowerCase()
        // Namespaces and documentation URLs are strings, never fetched.
        if (['schema.org', 'www.w3.org', 'aquaengineering.mk', 'web3forms.com'].includes(host)) {
          continue
        }
        origins.add(host)
      }
    }
    expect([...origins]).toEqual(['api.web3forms.com'])
  })

  it('makes exactly one outbound request', () => {
    // Counted by call site rather than by URL literal: the endpoint is a
    // constant, so matching on the string would quietly pass if a second fetch
    // were added through another variable.
    const calls = appFiles.flatMap(([path, src]) =>
      [...String(src).matchAll(/fetch\s*\(/g)].map(() => path.replace('/src/', '')),
    )
    expect(calls).toEqual(['components/ContactForm.vue'])
  })

  it('and that request goes to Web3Forms', () => {
    expect(CONTACT_ENDPOINT).toBe('https://api.web3forms.com/submit')
  })
})

describe('the environment surface matches what is documented', () => {
  it('reads only the one variable the notice and README describe', () => {
    const used = new Set<string>()
    for (const [, src] of appFiles) {
      for (const m of String(src).matchAll(/import\.meta\.env\.(VITE_[A-Z0-9_]+)/g)) {
        used.add(m[1])
      }
    }
    expect([...used]).toEqual(['VITE_WEB3FORMS_KEY'])
  })
})
