import { describe, expect, it } from 'vitest'
import { CONTACT_ENDPOINT } from '@/composables/useContactEndpoint'

/**
 * The privacy notice makes factual claims about this codebase: no cookies of
 * our own, no storage, no analytics, no trackers, fonts served from our own
 * origin, and exactly three disclosed third parties. Those are statements to
 * regulators and visitors, not comments, so they are asserted here rather than
 * trusted.
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

describe('"We set no cookies, use no local storage"', () => {
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

/**
 * Every host a file names, parsed out of the URL rather than matched as a
 * substring. Substring matching is both weaker and wrong here: `foo.com` is
 * "in" `https://foo.com.evil.test`, which is the reason CodeQL flags that
 * pattern, and comparing whole hosts is what these assertions actually mean.
 */
function hostsIn(src: string): Set<string> {
  const hosts = new Set<string>()
  for (const m of src.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) hosts.add(m[1].toLowerCase())
  return hosts
}

/** Namespaces and documentation URLs are strings in source, never fetched. */
const NOT_LOADED = [
  'schema.org',
  'www.w3.org',
  'aquaengineering.mk',
  'web3forms.com',
  'vimeo.com',
  'policies.google.com',
]

/** The files that load from a given host, by exact origin. */
function filesLoading(host: string): string[] {
  return appFiles
    .filter(([, src]) => hostsIn(String(src)).has(host))
    .map(([path]) => path.replace('/src/', ''))
    .filter((path) => !path.startsWith('content/'))
}

describe('"The form is delivered by Web3Forms"', () => {
  it('names exactly the third-party origins the notice discloses, and no others', () => {
    const origins = new Set<string>()
    for (const [, src] of appFiles) {
      for (const host of hostsIn(String(src))) {
        if (!NOT_LOADED.includes(host)) origins.add(host)
      }
    }
    expect([...origins].sort()).toEqual(['api.web3forms.com', 'player.vimeo.com', 'www.google.com'])
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

describe('"The home page plays a short video hosted by Vimeo"', () => {
  const hero = String(sources['/src/components/HeroSection.vue'])

  it('requests Do Not Track mode, which the notice tells the reader we do', () => {
    expect(hero).toMatch(/[?&]dnt=1['&]/)
  })

  it('loads it as a background: muted, looping and without Vimeo chrome', () => {
    for (const flag of ['background=1', 'muted=1', 'loop=1']) {
      expect(hero).toContain(flag)
    }
  })

  it('is the only place in the application that loads from Vimeo', () => {
    expect(filesLoading('player.vimeo.com')).toEqual(['components/HeroSection.vue'])
  })
})

describe('"The contact section shows a map served by Google"', () => {
  const contact = String(sources['/src/components/ContactSection.vue'])

  it('loads the map lazily, so nothing reaches Google until it is scrolled to', () => {
    expect(contact).toContain('loading="lazy"')
  })

  it('gives the frame an accessible name from the content, not a hardcoded string', () => {
    expect(contact).toContain(':title="c.contact.mapTitle"')
  })

  it('is the only place in the application that loads from Google', () => {
    expect(filesLoading('www.google.com')).toEqual(['components/ContactSection.vue'])
  })
})
