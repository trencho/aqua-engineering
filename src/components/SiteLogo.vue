<script setup lang="ts">
import { computed } from 'vue'

/**
 * The wordmark is inlined rather than referenced through <img>.
 *
 * An SVG loaded via <img> is an isolated document and cannot use a font the
 * host page loaded, so the logo's text fell back to a serif on every machine
 * without Century Gothic installed — which is almost all of them. Inlining puts
 * the text in the page's own document, where Didact Gothic applies.
 *
 * The real fix is artwork with the text converted to outlines. Until that
 * exists, this is the closest faithful rendering available.
 */

const props = defineProps<{
  /** Filename as declared in the locale content, e.g. 'ENG-Color.svg'. */
  file: string
  /** Accessible name. Empty string marks the logo decorative. */
  alt: string
  width?: number
}>()

const sources = import.meta.glob<string>('@/assets/logo/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw',
})

/** Stable, filename-derived prefix. Same file always yields the same value. */
function scopeOf(file: string): string {
  return file.replace(/\.svg$/, '').replace(/[^a-zA-Z0-9]/g, '')
}

const markup = computed(() => {
  const hit = Object.entries(sources).find(([path]) => path.endsWith(`/${props.file}`))
  if (!hit) throw new Error(`logo not found: ${props.file}`)

  const scope = scopeOf(props.file)

  // Every one of these files names its classes cls-1..cls-5. Inlining two of
  // them puts both <style> blocks in one document, where those generic names
  // collide: the white footer variant repainted the coloured header wordmark
  // white. Namespacing per file keeps each SVG's rules to itself.
  let svg = hit[1].replace(/\bcls-(\d+)\b/g, `${scope}-cls-$1`)

  // The source carries no accessible name and no sizing hints. Added here so
  // the asset files stay byte-faithful to what was recovered from the server.
  svg = svg.replace(
    /<svg([^>]*)>/,
    (_m, attrs: string) =>
      `<svg${attrs} role="${props.alt ? 'img' : 'presentation'}"` +
      (props.alt ? ` aria-label="${props.alt}"` : ' aria-hidden="true"') +
      ' focusable="false" preserveAspectRatio="xMinYMid meet">',
  )

  return svg
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- source is a vetted local asset, not user input -->
  <span class="logo" :style="{ width: width ? `${width}px` : undefined }" v-html="markup" />
</template>

<style scoped>
.logo {
  display: block;
  line-height: 0;
}

.logo :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
