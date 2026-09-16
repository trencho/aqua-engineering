<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import SiteLogo from '@/components/SiteLogo.vue'
import { FOUNDED } from '@/content'

const { c } = useLocale()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner container">
      <SiteLogo class="footer__logo" :file="c.logo.white" :alt="c.logo.alt" />
      <p class="footer__line">&copy; {{ FOUNDED }}&ndash;{{ year }} {{ c.meta.title }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--c-accent);
  color: var(--c-on-dark);
}

.footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding-block: var(--s-3);
}

.footer__logo {
  width: clamp(140px, 16vw, 180px);
}

.footer__line {
  margin: 0;
  font-size: var(--fs-small);
}

@media (max-width: 767px) {
  .footer__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
