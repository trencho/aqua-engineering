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

export function shellFor(html: string, locale: Locale): string {
  const c = content[locale]
  const url = locale === DEFAULT_LOCALE ? `${ORIGIN}/` : `${ORIGIN}/${locale}`
  const image = `${ORIGIN}/og-${locale}.png`
  const other = LOCALES.filter((l) => l !== locale)

  let out = html
    .replace(/<html lang="[^"]*"/, `<html lang="${c.lang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${c.meta.title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)

  out = setMeta(out, 'name', 'description', c.meta.description)
  out = setMeta(out, 'property', 'og:title', c.meta.title)
  out = setMeta(out, 'property', 'og:description', c.meta.description)
  out = setMeta(out, 'property', 'og:url', url)
  out = setMeta(out, 'property', 'og:site_name', c.meta.title)
  out = setMeta(out, 'property', 'og:locale', c.ogLocale)
  out = setMeta(out, 'property', 'og:locale:alternate', content[other[0]].ogLocale)
  out = setMeta(out, 'property', 'og:image', image)
  out = setMeta(out, 'name', 'twitter:image', image)

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
        const html = shellFor(base, locale)
        // The default locale overwrites the root shell; others get a directory.
        const target =
          locale === DEFAULT_LOCALE
            ? join(outDir, 'index.html')
            : join(outDir, locale, 'index.html')

        await mkdir(dirname(target), { recursive: true })
        await writeFile(target, html)
        this.info?.(`emitted ${target} (${locale})`)
      }
    },
  }
}
