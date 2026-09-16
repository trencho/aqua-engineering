import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Plugin } from 'vite'
import { content, DEFAULT_LOCALE, LOCALES, type Locale } from '../src/content/index'

const ORIGIN = 'https://aquaengineering.mk'

/** Swap one meta tag's content, matching across the line breaks Prettier inserts. */
function setMeta(html: string, attr: 'property' | 'name', key: string, value: string): string {
  const re = new RegExp(`(<meta\\s[^>]*${attr}="${key}"[^>]*content=")[^"]*(")`, 's')
  if (!re.test(html)) throw new Error(`emit-locale-shells: no <meta ${attr}="${key}"> to rewrite`)
  return html.replace(re, `$1${value}$2`)
}

export /**
 * Every route that needs its own shell, and how each one is titled and
 * described. A route missing from here falls back to the SPA shell, which means
 * an unfurler shows the home page's metadata for it.
 */
const PAGES = [
  {
    slug: '',
    title: (c: (typeof content)[Locale]) => c.meta.title,
    description: (c: (typeof content)[Locale]) => c.meta.description,
  },
  {
    slug: 'privacy',
    title: (c: (typeof content)[Locale]) => `${c.privacy.title} — ${c.meta.title}`,
    description: (c: (typeof content)[Locale]) => c.privacy.intro[0],
  },
] as const

export type Page = (typeof PAGES)[number]

/** Site-root-relative path for a page in a locale, matching the router. */
export function pathFor(locale: Locale, slug: string): string {
  const base = locale === DEFAULT_LOCALE ? '' : `/${locale}`
  if (slug) return `${base}/${slug}`
  // The root is the one path that keeps its slash; /mk must not gain one, or
  // the canonical and the alternate disagree about the same page.
  return base || '/'
}

export /** Swap one <link rel=alternate hreflang=..> href. */
function setAlternate(html: string, hreflang: string, href: string): string {
  const re = new RegExp(`(<link[^>]*hreflang="${hreflang}"[^>]*href=")[^"]*(")`, 's')
  const alt = new RegExp(`(<link[^>]*href=")[^"]*("[^>]*hreflang="${hreflang}")`, 's')
  if (re.test(html)) return html.replace(re, `$1${href}$2`)
  if (alt.test(html)) return html.replace(alt, `$1${href}$2`)
  throw new Error(`emit-locale-shells: no <link hreflang="${hreflang}"> to rewrite`)
}

export function shellFor(html: string, locale: Locale, page: Page = PAGES[0]): string {
  const c = content[locale]
  const url = `${ORIGIN}${pathFor(locale, page.slug)}`
  const image = `${ORIGIN}/og-${locale}.png`
  const other = LOCALES.filter((l) => l !== locale)

  let out = html
    .replace(/<html lang="[^"]*"/, `<html lang="${c.lang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${page.title(c)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)

  out = setMeta(out, 'name', 'description', page.description(c))
  out = setMeta(out, 'property', 'og:title', page.title(c))
  out = setMeta(out, 'property', 'og:description', page.description(c))
  out = setMeta(out, 'property', 'og:url', url)
  out = setMeta(out, 'property', 'og:site_name', c.meta.title)
  out = setMeta(out, 'property', 'og:locale', c.ogLocale)
  out = setMeta(out, 'property', 'og:locale:alternate', content[other[0]].ogLocale)
  out = setMeta(out, 'property', 'og:image', image)
  out = setMeta(out, 'name', 'twitter:image', image)

  // Alternates must point at the SAME page in the other language. Left alone
  // they stay on the home page, which tells a crawler the Macedonian privacy
  // notice is an alternate of the English home page.
  for (const l of LOCALES) out = setAlternate(out, l, `${ORIGIN}${pathFor(l, page.slug)}`)
  out = setAlternate(out, 'x-default', `${ORIGIN}${pathFor(DEFAULT_LOCALE, page.slug)}`)

  return out
}

/**
 * Writes one HTML shell per locale with that locale's metadata baked in.
 *
 * `useHead` already sets these at runtime, which is enough for Google. It is not
 * enough for Facebook, LinkedIn, WhatsApp or Slack, none of which run JS: they
 * read the shipped file. With a single index.html serving both routes, the
 * Macedonian page unfurled as English every time.
 *
 * This does not fix the empty-shell problem — a non-JS client still sees no body
 * text. Fixing that needs real prerendering through @vue/server-renderer, which
 * is a larger change for a smaller gain.
 */
export function emitLocaleShells(): Plugin {
  return {
    name: 'emit-locale-shells',
    apply: 'build',
    async closeBundle() {
      const outDir = 'dist'
      const base = await readFile(join(outDir, 'index.html'), 'utf8')

      for (const locale of LOCALES) {
        for (const page of PAGES) {
          const html = shellFor(base, locale, page)
          // The default locale's home page overwrites the root shell; every
          // other combination gets its own directory.
          const dir = [outDir, locale === DEFAULT_LOCALE ? '' : locale, page.slug].filter(Boolean)
          const target = join(...dir, 'index.html')

          await mkdir(dirname(target), { recursive: true })
          await writeFile(target, html)
          this.info?.(`emitted ${target}`)
        }
      }
    },
  }
}
