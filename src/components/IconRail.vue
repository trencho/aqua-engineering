<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import type { SectionId } from '@/content/types'

/**
 * The original's desktop navigation: a rail of four square icon buttons pinned
 * to the right edge and vertically centred, not a bar across the top. The text
 * menu existed only below 768px, which is why this is hidden there and the
 * header's hamburger takes over.
 *
 * The original used an Elementor icon font (`hm-home2`, `hm-avatar-man`,
 * `hm-book`, `hm-form`) and labelled each link with the glyph name — a screen
 * reader read out "Hm-form". The glyphs are redrawn here as inline SVG so no
 * font is shipped for four icons, and each button carries the section's real
 * name from the content instead.
 */
const { c } = useLocale()

const paths: Record<SectionId, string> = {
  // house
  home: 'M12 3 2 12h3v9h5v-6h4v6h5v-9h3z',
  // person
  whoweare: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.7-9 6v2h18v-2c0-3.3-4-6-9-6Z',
  // open book
  licenses:
    'M12 6.5C10.3 5 7.9 4.3 4 4.3v13c3.9 0 6.3.7 8 2.2 1.7-1.5 4.1-2.2 8-2.2v-13c-3.9 0-6.3.7-8 2.2Zm0 11.1V8.4',
  // form / document with lines
  contact: 'M5 2h9l5 5v15H5Zm8 1.5V8h4.5M8 12h8M8 15.5h8M8 19h5',
}

/** Outlined glyphs need a stroke; the solid ones would thicken if stroked. */
const outlined: Partial<Record<SectionId, boolean>> = { licenses: true, contact: true }

function go(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <nav class="rail" :aria-label="c.ui.menu">
    <ul class="rail__list">
      <li v-for="item in c.nav" :key="item.id">
        <a class="rail__link" :href="`#${item.id}`" @click.prevent="go(item.id)">
          <span class="visually-hidden">{{ item.label }}</span>
          <svg
            class="rail__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            :fill="outlined[item.id] ? 'none' : 'currentColor'"
            :stroke="outlined[item.id] ? 'currentColor' : 'none'"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path :d="paths[item.id]" />
          </svg>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* Fixed rather than the original's `margin-left: 95%` inside a 100vh sticky
   header: the same result, without a full-height element sitting over the page
   and swallowing clicks. */
.rail {
  position: fixed;
  top: 50%;
  right: var(--s-3);
  z-index: 100;
  transform: translateY(-50%);
}

.rail__list {
  display: grid;
  gap: 5px; /* --grid-row-gap: 0, column gap 5px, single column */
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 50x50: --icon-size 25px plus .5em padding each side, as recovered. */
.rail__link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgb(0 52 80 / 73%);
  color: var(--c-on-dark);
  transition:
    background var(--transition),
    transform var(--transition);
}

.rail__link:hover,
.rail__link:focus-visible {
  background: var(--c-accent);
  /* The original put `elementor-animation-pop` on each icon. */
  transform: scale(1.1);
}

.rail__icon {
  width: 25px;
  height: 25px;
}

/* The original hid this below 768px and showed the text menu instead. */
@media (max-width: 767px) {
  .rail {
    display: none;
  }
}
</style>
