<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { EMAILS, PHONES } from '@/content'

/**
 * Where the company is and how to reach it. The original carried this in the
 * footer, as two of its three columns, rather than in the contact section —
 * that section was the form and a map. Colours inherit so the same block works
 * on the dark footer and on a light page.
 */
const { c } = useLocale()
</script>

<template>
  <address class="details">
    <div class="details__where">
      <p class="details__office">{{ c.contact.office.label }}</p>
      <p class="details__lines">
        <span v-for="line in c.contact.office.lines" :key="line">{{ line }}</span>
      </p>
    </div>

    <div class="details__reach">
      <p class="details__phones">
        <span v-for="(phone, i) in PHONES" :key="phone.href">
          {{ i === 0 ? c.contact.phoneLabel : c.contact.mobileLabel }}:
          <a :href="phone.href">{{ phone.label }}</a>
        </span>
      </p>

      <p class="details__emails">
        <a v-for="email in EMAILS" :key="email" :href="`mailto:${email}`">{{ email }}</a>
      </p>
    </div>
  </address>
</template>

<style scoped>
.details {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--s-4);
  font-style: normal;
  font-size: var(--fs-small);
}

.details p {
  margin: 0;
}

.details__office {
  margin-bottom: var(--s-1);
  font-weight: var(--fw-bold);
}

.details__lines span,
.details__phones span,
.details__emails a {
  display: block;
}

/* Inherits the surrounding colour, so this reads correctly on the footer's
   deep blue and on a white page without a second set of rules. */
.details a {
  color: inherit;
}

.details__phones a,
.details__emails a {
  display: inline-block;
  min-height: 32px;
}

.details__emails a {
  display: block;
  min-height: 44px;
  line-height: 44px;
}

@media (max-width: 767px) {
  .details {
    grid-template-columns: 1fr;
    gap: var(--s-3);
  }
}
</style>
