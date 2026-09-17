<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useHeroMotion } from '@/composables/useHeroMotion'
import heroPoster from '@/assets/video/hero-poster.webp'
import heroVideo from '@/assets/video/hero-loop.mp4'

const { c } = useLocale()

/**
 * The hero background video, recovered from the pre-breach site and served
 * from this origin.
 *
 * It was a Vimeo embed until 2026-09-17, which left the home page's hero on an
 * account nobody here controls and made Vimeo a third party the privacy notice
 * had to disclose. Serving it ourselves removes both.
 *
 * What ships is not the whole film. The master is a 156 second montage of high
 * motion water, which costs 29 MB even at 720p, so six of its scenes are
 * crossfaded into 13.8 seconds at 3.4 MB. The loop point is a cut, which is
 * what the montage does between scenes anyway and what the Vimeo embed did on
 * every repeat.
 */

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
 * interactive before several megabytes are fetched. The clip is same-origin
 * now, which makes this a bandwidth question rather than a privacy one, but it
 * is still the gate that keeps the video off a reduced-motion viewer's
 * connection entirely. requestIdleCallback is not in Safari, hence the timeout.
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

/**
 * Vue sets `muted` as a DOM property and never reflects it as an attribute, so
 * the rendered markup carries no `muted=""` however the template is written.
 * The property is what the autoplay policy actually reads, which is why the
 * clip plays, but nothing in the DOM says so. Setting it here again makes the
 * guarantee explicit and survives a future refactor of the template.
 */
const video = ref<HTMLVideoElement | null>(null)
watch(video, (el) => {
  if (el) el.muted = true
})
</script>

<template>
  <section id="home" class="hero" :class="{ 'hero--video': showVideo }">
    <!-- Decorative. Kept out of the tab order so the control below is the only
         thing a keyboard reaches. -->
    <div v-if="showVideo" class="hero__video" aria-hidden="true">
      <!-- muted comes before src deliberately. Vue applies these in template
           order, and a source that starts loading while the element is still
           unmuted is one the autoplay policy may refuse. -->
      <video
        ref="video"
        muted
        autoplay
        loop
        playsinline
        disablepictureinpicture
        :src="heroVideo"
        :poster="heroPoster"
        class="hero__frame"
        tabindex="-1"
      ></video>
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

/* An iframe had to be sized to 16:9 by hand and centred with a transform. A
   real media element crops itself, so this is object-fit and nothing else. */
.hero__frame {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
