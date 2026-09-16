/**
 * Generates the 1200x630 social cards referenced by useHead.
 *
 * Run with `npm run og` after changing the logo or the taglines. The output is
 * committed, so the build never depends on this script.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../', import.meta.url)
const p = (rel) => fileURLToPath(new URL(rel, root))

/**
 * Note on typography: the card is rasterised by librsvg, which resolves fonts
 * through the OS and ignores an @font-face with a data URI. Didact Gothic is a
 * web font and is not installed, so the card uses the cleanest geometric-ish
 * face the system does have. Embedding the brand font here would need the text
 * converted to outlines first.
 */
const STACK = "'Segoe UI', Tahoma, Verdana, sans-serif"

/** Pull just the mark (the four paths) out of the wordmark SVG. */
async function mark() {
  const svg = await readFile(p('src/assets/logo/ENG-White.svg'), 'utf8')

  // These are written <path ...></path>, not self-closed, so match the open tag
  // and drop any closing tag. Fill has to be pinned as an attribute because the
  // <style> block that carries it is not copied across.
  const paths = [...svg.matchAll(/<path\b[^>]*?\/?>/g)]
    .map((m) => m[0].replace('<path', '<path fill="#fff"').replace(/\/?>$/, '/>'))
    .join('')

  if (!paths) throw new Error('no paths found in ENG-White.svg — the logo format changed')

  // The source viewBox is 0 0 100 30; the mark occupies roughly the first 24 units.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="190" height="238">${paths}</svg>`
}

const CARDS = {
  en: { title: 'Aqua Engineering', line: 'Water engineering and environmental protection' },
  mk: { title: 'Аква Инженеринг', line: 'Хидро инженерство и заштита на животната средина' },
}

for (const [locale, card] of Object.entries(CARDS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <style>
      .t { font-family: ${STACK}; fill: #fff; }
      .title { font-size: 84px; }
      .line  { font-size: 38px; fill: #9fd4f5; }
    </style>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#005582"/>
      <stop offset="100%" stop-color="#003450"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="1200" height="10" fill="#1ca3ec"/>
  <text class="t title" x="96" y="330">${card.title}</text>
  <text class="t line"  x="96" y="400">${card.line}</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  const logo = await sharp(Buffer.from(await mark()))
    .png()
    .toBuffer()
  const out = await sharp(base)
    .composite([{ input: logo, top: 96, left: 910 }])
    .png({ compressionLevel: 9 })
    .toBuffer()

  await writeFile(p(`public/og-${locale}.png`), out)
  console.log(`public/og-${locale}.png  ${(out.length / 1024).toFixed(1)} kB`)
}
