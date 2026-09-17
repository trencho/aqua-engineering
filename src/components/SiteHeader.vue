<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import SiteLogo from '@/components/SiteLogo.vue'

/**
 * On the home page the original nested this strip inside the hero container, so
 * the logo and language switcher floated over the video with no background and
 * no rule. Standalone pages have no hero to float over, so there it becomes an
 * ordinary opaque bar.
 */
const { overlay = false } = defineProps<{ overlay?: boolean }>()

const { c, otherLocale, otherPath } = useLocale()
const route = useRoute()

const open = ref(false)

// The original theme's menu had no keyboard escape and no state announced to
// assistive tech. Both are added here; neither changes how it looks.
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) open.value = false
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

// Close on navigation, including the language switch.
watch(
  () => route.fullPath,
  () => (open.value = false),
)

function go(id: string) {
  open.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <header class="header" :class="{ 'header--overlay': overlay }">
    <div class="header__inner">
      <RouterLink :to="route.path" class="header__logo" :aria-label="c.logo.alt">
        <SiteLogo :file="overlay ? c.logo.white : c.logo.colour" :alt="c.logo.alt" />
      </RouterLink>

      <div class="header__end">
        <RouterLink :to="otherPath" class="header__lang">
          {{ otherLocale === 'mk' ? 'МКД' : 'EN' }}
        </RouterLink>

        <button
          class="header__toggle"
          type="button"
          :aria-expanded="open"
          aria-controls="primary-nav"
          @click="open = !open"
        >
          <span class="visually-hidden">{{ c.ui.menu }}</span>
          <span class="header__bars" :class="{ 'header__bars--open': open }" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>

      <!-- Below 768px only. Above it the icon rail is the navigation, which is
           how the original worked. -->
      <nav id="primary-nav" class="header__nav" :class="{ 'header__nav--open': open }">
        <ul class="header__list">
          <li v-for="item in c.nav" :key="item.id">
            <a :href="`#${item.id}`" class="header__link" @click.prevent="go(item.id)">
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 101;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
}

/* Floating over the hero: no ground, no rule, and out of the flow so the hero
   keeps its full 100vh rather than being pushed down by the strip's height. */
.header--overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: none;
  border-bottom: 0;
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  width: 100%;
  min-height: 10vh;
  padding: var(--s-2) 5%;
}

.header__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 70px tall, as recovered. The wordmark's viewBox is 100x30, so this is about
   233px wide. */
.header__logo :deep(.logo) {
  height: 70px;
  width: auto;
}

.header__end {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

/* The original switched language with a flag-image dropdown. Flags name
   countries rather than languages, and Polylang shipped them as images with no
   text at all, so this stays a labelled control. Position and prominence match;
   the affordance is deliberately better. */
.header__lang {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding-inline: var(--s-2);
  color: var(--c-primary);
  border: 1px solid currentcolor;
  border-radius: var(--radius);
  font-size: var(--fs-small);
  font-weight: var(--fw-semi);
  text-decoration: none;
  transition:
    background var(--transition),
    color var(--transition);
}

.header__lang:hover {
  background: var(--c-primary);
  color: var(--c-on-dark);
}

.header--overlay .header__lang {
  color: var(--c-on-dark);
}

.header--overlay .header__lang:hover {
  background: var(--c-on-dark);
  color: var(--c-primary);
}

.header__toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
}

.header__bars {
  display: block;
  width: 26px;
}

.header__bars span {
  display: block;
  height: 3px;
  background: var(--c-primary);
  border-radius: 2px;
  transition:
    transform var(--transition),
    opacity var(--transition);
}

.header--overlay .header__bars span {
  background: var(--c-on-dark);
}

.header__bars span + span {
  margin-top: 5px;
}

.header__bars--open span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}
.header__bars--open span:nth-child(2) {
  opacity: 0;
}
.header__bars--open span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* The text menu existed only below 768px. Above it the rail navigates. */
.header__nav {
  display: none;
}

@media (max-width: 1024px) {
  .header__inner {
    min-height: 15vh;
  }

  .header__logo :deep(.logo) {
    height: 55px;
  }
}

@media (max-width: 767px) {
  .header__toggle {
    display: flex;
  }

  .header__nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    display: none;
    background: var(--c-surface);
    border-bottom: 1px solid var(--c-border);
    box-shadow: var(--shadow);
  }

  .header__nav--open {
    display: block;
  }

  .header__list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin: 0;
    padding: var(--s-2) 5%;
    list-style: none;
  }

  .header__link {
    display: flex;
    align-items: center;
    min-height: 48px;
    color: var(--c-primary);
    font-weight: var(--fw-semi);
    text-decoration: none;
  }

  .header__link:hover {
    color: var(--c-accent);
  }

  .header__logo :deep(.logo) {
    height: 45px;
  }
}
</style>
