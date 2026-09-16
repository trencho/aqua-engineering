<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import SiteLogo from '@/components/SiteLogo.vue'

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
  <header class="header">
    <div class="header__inner">
      <RouterLink :to="route.path" class="header__logo" :aria-label="c.logo.alt">
        <SiteLogo :file="c.logo.colour" :alt="c.logo.alt" />
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

      <nav id="primary-nav" class="header__nav" :class="{ 'header__nav--open': open }">
        <ul class="header__list">
          <li v-for="item in c.nav" :key="item.id">
            <a :href="`#${item.id}`" class="header__link" @click.prevent="go(item.id)">
              {{ item.label }}
            </a>
          </li>
          <li class="header__lang">
            <RouterLink :to="otherPath" class="header__link header__link--lang">
              {{ otherLocale === 'mk' ? 'МКД' : 'EN' }}
            </RouterLink>
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
  z-index: 100;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  width: 100%;
  max-width: var(--container);
  min-height: 10vh;
  margin-inline: auto;
  padding: var(--s-2) var(--gutter);
}

.header__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header__logo :deep(.logo) {
  width: clamp(150px, 18vw, 200px);
}

.header__list {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.header__link {
  display: flex;
  align-items: center;
  /* 44px floor: the original nav links were text-height hit areas. */
  min-height: 44px;
  padding-inline: var(--s-1);
  color: var(--c-primary);
  font-weight: var(--fw-semi);
  text-decoration: none;
}

.header__link:hover {
  color: var(--c-secondary);
}

.header__link--lang {
  padding-inline: var(--s-2);
  border: 1px solid var(--c-primary);
  border-radius: var(--radius);
  font-size: var(--fs-small);
}

.header__link--lang:hover {
  background: var(--c-primary);
  color: var(--c-on-dark);
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

/* The theme collapsed its menu at 1024px. Keeping that exact breakpoint. */
@media (max-width: 1024px) {
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
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: var(--s-2) var(--gutter);
  }

  .header__link {
    min-height: 48px;
    padding-inline: 0;
  }

  .header__lang {
    margin-top: var(--s-2);
  }

  .header__link--lang {
    justify-content: center;
  }
}
</style>
