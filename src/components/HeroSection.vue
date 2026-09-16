<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

const { c } = useLocale()
</script>

<template>
  <section id="home" class="hero">
    <div class="hero__inner container">
      <h1 class="visually-hidden">{{ c.meta.title }}</h1>
      <ul class="hero__list">
        <li v-for="line in c.hero.taglines" :key="line" class="hero__item">
          {{ line }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* The original hero container was min-height:100vh, flex column, centred. */
.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 10vh);
  background: linear-gradient(180deg, var(--c-surface) 0%, var(--c-surface-alt) 100%);
}

.hero__inner {
  padding-block: var(--s-5);
}

.hero__list {
  display: grid;
  gap: var(--s-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.hero__item {
  max-width: 34ch;
  color: var(--c-primary);
  font-size: var(--fs-hero);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

/* Each statement is one of three equal claims, so they read as a set rather
   than a sequence. Offsetting the middle one keeps that reading while giving
   the block some structure. */
.hero__item:nth-child(2) {
  justify-self: end;
  text-align: right;
  color: var(--c-secondary-text);
}

@media (max-width: 767px) {
  .hero__list {
    gap: var(--s-3);
  }

  .hero__item,
  .hero__item:nth-child(2) {
    justify-self: start;
    max-width: none;
    text-align: left;
  }
}
</style>
