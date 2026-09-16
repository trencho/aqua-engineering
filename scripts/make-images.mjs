/**
 * Builds display-size versions of the licence scans.
 *
 * The originals are WordPress '-scaled' derivatives at 2560px tall and about
 * 500 kB each, shown on the page at roughly 400 CSS pixels. Re-compressing them
 * at that size is pointless; resizing is the whole win. The originals stay in
 * the repo untouched and remain the target of the "view full size" link.
 *
 * Run with `npm run images` after adding or replacing a scan.
 */
import { readdir, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dir = fileURLToPath(new URL('../src/assets/licences/', import.meta.url))

/** 1000px covers a ~400px slot on a 2x display. */
const TARGET_HEIGHT = 1000

const files = (await readdir(dir)).filter((f) => /\.jpe?g$/i.test(f) && !f.includes('-display'))

for (const file of files) {
  const src = dir + file
  // metadata().size is only populated for buffer input, so stat the file.
  const before = (await stat(src)).size
  const out = await sharp(src)
    .resize({ height: TARGET_HEIGHT, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const name = file.replace(/\.jpe?g$/i, '-display.webp')
  await writeFile(dir + name, out)
  console.log(
    `${name}  ${(before / 1024).toFixed(0)} kB -> ${(out.length / 1024).toFixed(0)} kB  ` +
      `(${Math.round((1 - out.length / before) * 100)}% smaller)`,
  )
}
