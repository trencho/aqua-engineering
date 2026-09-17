<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useHeroMotion } from '@/composables/useHeroMotion'

const { c } = useLocale()

/**
 * The hero background video, recovered from the pre-breach site.
 *
 * `background=1` is what makes it a background: autoplay, loop, muted, no
 * controls and no Vimeo chrome. `dnt=1` asks Vimeo not to track the viewer, and
 * the privacy notice states that we send it, so privacy-claims.spec.ts asserts
 * it rather than trusting this comment.
 */
const VIDEO_SRC =
  'https://player.vimeo.com/video/906502406?h=bcd258525e' +
  '&background=1&autoplay=1&loop=1&muted=1&dnt=1'

/** The original cycled its taglines on a 15 second timer. */
const ROTATE_MS = 15_000

/**
 * Both held outside the component, so the viewer's decision survives the
 * unmount that a route change causes. See useHeroMotion for why it cannot live
 * in this block.
 */
const { motion, index } = useHeroMotion()

const running = computed(() => motion.value === true)
let timer: number | undefined

function startRotation() {
  stopRotation()
  timer = window.setInterval(() => {
    index.value = (index.value + 1) % c.value.hero.taglines.length
  }, ROTATE_MS)
}

function stopRotation() {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
}

onMounted(() => {
  // Resolve the preference once. A viewer who has asked for less motion gets
  // neither the rotation nor the third-party frame, and the frame is never
  // requested for them at all.
  if (motion.value === null) {
    motion.value =
      typeof window.matchMedia === 'function'
        ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : true
  }
  if (running.value) startRotation()
})

onBeforeUnmount(stopRotation)

watch(running, (on) => (on ? startRotation() : stopRotation()))

function toggle() {
  motion.value = !running.value
  // Stopping mid-cycle should leave the current statement up, not jump.
}

/**
 * Deferred one frame past mount so the hero paints and the page becomes
 * interactive before a third party is fetched. requestIdleCallback is not in
 * Safari, hence the timeout.
 */
const frameReady = ref(false)
onMounted(() => {
  const go = () => (frameReady.value = true)
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(go, { timeout: 2000 })
  } else {
    window.setTimeout(go, 200)
  }
})

const showVideo = computed(() => running.value && frameReady.value)
</script>

<template>
  <section id="home" class="hero" :class="{ 'hero--video': showVideo }">
    <!-- Decorative. Kept out of the tab order so the control below is the only
         thing a keyboard reaches. -->
    <div v-if="showVideo" class="hero__video" aria-hidden="true">
      <iframe
        :src="VIDEO_SRC"
        class="hero__frame"
        title=""
        tabindex="-1"
        allow="autoplay"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>

    <div class="hero__inner">
      <h1 class="visually-hidden">{{ c.meta.title }}</h1>
      <!-- Every tagline stays in the DOM whether or not it is the one showing,
           so crawlers and screen readers get all three. When the rotation is
           off they stack and all three are visible; the original only ever
           showed one because it was always rotating. -->
      <ul class="hero__list" :class="{ 'hero__list--rotating': running }">
        <li
          v-for="(line, i) in c.hero.taglines"
          :key="line"
          class="hero__item"
          :class="{ 'is-active': i === index }"
        >
          {{ line }}
        </li>
      </ul>
    </div>

    <button class="hero__toggle" type="button" @click="toggle">
      {{ running ? c.ui.pauseMotion : c.ui.playMotion }}
    </button>
  </section>
</template>

<style scoped>
/* 100vh, flex column, centred — as recovered. The header strip overlays its
   top 10vh rather than sitting above it, which is how the original nested it. */
.hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  background: var(--c-primary);
}

.hero__video {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* Cover: scale 16:9 against whichever axis is short, then centre it. */
.hero__frame {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 56.25vw;
  min-width: 177.78vh;
  min-height: 100%;
  transform: translate(-50%, -50%);
  border: 0;
}

/* Load bearing, not decoration. The original ran white type straight over the
   video with no overlay, which cannot work on footage that is mostly white
   water. At 0.68 white holds 4.94 even against a pure white frame. The figure
   is asserted in contrast.spec.ts; do not lighten it to show more video. */
.hero__video::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--scrim-hero);
}

/* Full bleed with the original's percentage indents: the text begins a tenth of
   the way across the viewport and stops halfway. No container here — every
   container on this page was e-con-full. */
.hero__inner {
  position: relative;
  z-index: 1;
  padding: 0 40% 0 10%;
}

.hero__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hero__item {
  color: var(--c-on-dark);
  font-size: var(--fs-hero);
  font-weight: var(--fw-bold);
  line-height: var(--lh-hero);
  text-align: left;
}

/* Stacked state: all three read as a set, one under the other. */
.hero__list:not(.hero__list--rotating) .hero__item + .hero__item {
  margin-top: var(--s-4);
}

/* Rotating state: all three occupy the same box, one visible at a time. Grid
   rather than absolute positioning so the tallest statement sets the height and
   nothing below it shifts as they cycle. */
.hero__list--rotating {
  display: grid;
}

.hero__list--rotating .hero__item {
  grid-area: 1 / 1;
  opacity: 0;
  pointer-events: none;
}

.hero__list--rotating .hero__item.is-active {
  opacity: 1;
  pointer-events: auto;
  animation: hero-fade-in-down 0.8s ease both;
}

@keyframes hero-fade-in-down {
  from {
    opacity: 0;
    transform: translate3d(0, -100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.hero__toggle {
  position: absolute;
  right: var(--s-3);
  bottom: var(--s-3);
  z-index: 2;
  min-height: 44px;
  padding: var(--s-2) var(--s-3);
  background: transparent;
  color: var(--c-on-dark);
  border: 1px solid var(--c-on-dark);
  border-radius: var(--radius);
  font: inherit;
  font-size: var(--fs-fine);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.hero__toggle:hover {
  background: var(--c-on-dark);
  color: var(--c-primary);
}

@media (max-width: 1024px) {
  .hero__inner {
    padding: 0 20% 0 5%;
  }
}

@media (max-width: 767px) {
  .hero__inner {
    padding: 0 5%;
  }

  .hero__list:not(.hero__list--rotating) .hero__item + .hero__item {
    margin-top: var(--s-3);
  }
}
</style>
