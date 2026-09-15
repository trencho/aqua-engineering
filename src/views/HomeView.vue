<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { content, DEFAULT_LOCALE, type Locale } from '@/content'

const route = useRoute()
const locale = computed<Locale>(() => (route.meta.locale as Locale) ?? DEFAULT_LOCALE)
const c = computed(() => content[locale.value])
</script>

<template>
  <main id="main">
    <section id="home" class="container">
      <h1>{{ c.meta.title }}</h1>
      <p v-for="line in c.hero.taglines" :key="line">{{ line }}</p>
    </section>

    <section id="about" class="container">
      <h2>{{ c.about.heading }}</h2>
      <p v-for="para in c.about.paragraphs" :key="para">{{ para }}</p>
    </section>

    <section id="licenses" class="container">
      <h2>{{ c.licences.heading }}</h2>
      <p>{{ c.licences.body }}</p>
    </section>

    <section id="contact" class="container">
      <h2>{{ c.contact.heading }}</h2>
      <address>
        <strong>{{ c.contact.office.label }}</strong>
        <span v-for="line in c.contact.office.lines" :key="line">{{ line }}</span>
      </address>
    </section>
  </main>
</template>
