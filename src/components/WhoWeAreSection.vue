<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

const { c } = useLocale()
</script>

<template>
  <section id="about" class="about">
    <div class="about__inner container">
      <h2 class="about__heading">{{ c.about.heading }}</h2>
      <div class="about__body">
        <p v-for="para in c.about.paragraphs" :key="para">{{ para }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  display: flex;
  align-items: center;
  min-height: 90vh;
  background: var(--c-surface);
}

.about__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--s-4);
  padding-block: var(--s-5);
}

.about__heading {
  margin: 0;
  color: var(--c-primary);
}

.about__body {
  /* Under 80 characters, per the type scale the original set at 20px. */
  max-width: 68ch;
}

.about__body p:last-child {
  margin-bottom: 0;
  color: var(--c-primary);
  font-weight: var(--fw-semi);
}

@media (max-width: 1024px) {
  .about__inner {
    grid-template-columns: 1fr;
    gap: var(--s-3);
  }
}

@media (max-width: 767px) {
  .about {
    min-height: 0;
  }

  .about__inner {
    padding-block: var(--s-4);
  }
}
</style>
