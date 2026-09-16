<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { EMAILS, PHONES } from '@/content'

const { c } = useLocale()
</script>

<template>
  <address class="contact__details">
    <p class="contact__office">{{ c.contact.office.label }}</p>
    <p class="contact__lines">
      <span v-for="line in c.contact.office.lines" :key="line">{{ line }}</span>
    </p>

    <p class="contact__phones">
      <span v-for="(phone, i) in PHONES" :key="phone.href">
        {{ i === 0 ? c.contact.phoneLabel : c.contact.mobileLabel }}:
        <a :href="phone.href">{{ phone.label }}</a>
      </span>
    </p>

    <p class="contact__emails">
      <a v-for="email in EMAILS" :key="email" :href="`mailto:${email}`">{{ email }}</a>
    </p>
  </address>
</template>

<style scoped>
.contact__details {
  font-style: normal;
}

.contact__office {
  margin-bottom: var(--s-2);
  color: var(--c-primary);
  font-weight: var(--fw-bold);
}

.contact__lines span,
.contact__phones span,
.contact__emails a {
  display: block;
}

.contact__phones a,
.contact__emails a {
  display: inline-block;
  min-height: 32px;
  color: var(--c-primary);
}

.contact__emails a {
  display: block;
  min-height: 44px;
  line-height: 44px;
}
</style>
