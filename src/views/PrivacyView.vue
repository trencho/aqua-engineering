<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useLocale } from '@/composables/useLocale'
import { useHead } from '@/composables/useHead'

const { c, locale } = useLocale()

useHead(c, locale, {
  title: () => `${c.value.privacy.title} — ${c.value.meta.title}`,
  description: () => c.value.privacy.intro[0],
  pathFor: (l) => (l === 'mk' ? '/mk/privacy' : '/privacy'),
})

const homePath = computed(() => (locale.value === 'mk' ? '/mk' : '/'))

// Formatted from content rather than through Intl: Chrome has no Macedonian
// date data and resolves mk-MK to en-US, which would print this date in English
// on the Macedonian page without any error to notice.
const updated = computed(() => {
  const [year, month, day] = c.value.privacy.updated.split('-').map(Number)
  return `${day} ${c.value.ui.months[month - 1]} ${year}`
})
</script>

<template>
  <a class="skip-link" href="#main">{{ c.ui.skipToContent }}</a>
  <SiteHeader />

  <main id="main" class="legal">
    <div class="legal__inner container">
      <h1>{{ c.privacy.title }}</h1>
      <p class="legal__updated">
        <time :datetime="c.privacy.updated">{{ updated }}</time>
      </p>

      <p v-for="para in c.privacy.intro" :key="para" class="legal__intro">{{ para }}</p>

      <section v-for="section in c.privacy.sections" :id="section.id" :key="section.id">
        <h2>{{ section.heading }}</h2>
        <p v-for="para in section.paragraphs" :key="para">{{ para }}</p>
        <ul v-if="section.list">
          <li v-for="item in section.list" :key="item">{{ item }}</li>
        </ul>
      </section>

      <p class="legal__back">
        <RouterLink :to="homePath">{{ c.ui.backToSite }}</RouterLink>
      </p>
    </div>
  </main>

  <SiteFooter />
</template>

<style scoped>
.legal {
  background: var(--c-surface);
}

.legal__inner {
  /* Legal prose is read, not scanned, so it gets a narrower measure than the
     rest of the site. */
  max-width: 68ch;
  padding-block: var(--s-5);
}

.legal__updated {
  margin-top: calc(var(--s-3) * -1);
  color: var(--c-muted);
  font-size: var(--fs-small);
}

.legal__intro {
  font-size: var(--fs-body);
}

.legal section {
  margin-top: var(--s-4);
}

.legal h2 {
  font-size: var(--fs-h3);
  /* Deep links from elsewhere should not land under the sticky header. */
  scroll-margin-top: calc(10vh + var(--s-3));
}

.legal ul {
  margin: 0 0 var(--s-3);
  padding-left: var(--s-3);
}

.legal li {
  margin-bottom: var(--s-1);
}

.legal__back {
  margin-top: var(--s-5);
  padding-top: var(--s-3);
  border-top: 1px solid var(--c-border);
}

@media (max-width: 767px) {
  .legal__inner {
    padding-block: var(--s-4);
  }
}
</style>
