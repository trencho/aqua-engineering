<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { useContactEndpoint } from '@/composables/useContactEndpoint'
import ContactForm from '@/components/ContactForm.vue'
import ContactDetails from '@/components/ContactDetails.vue'

const { c } = useLocale()
const endpoint = useContactEndpoint()
</script>

<template>
  <section id="contact" class="contact">
    <div class="contact__inner container">
      <h2 class="contact__heading">{{ c.contact.heading }}</h2>

      <!-- Two columns when the form is there to fill one. Without a key the
           form renders nothing, so the details should not sit in a 3fr gap. -->
      <div class="contact__grid" :class="{ 'contact__grid--details-only': !endpoint.enabled }">
        <ContactForm />
        <ContactDetails />
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  display: flex;
  align-items: center;
  min-height: 90vh;
  background: var(--c-surface);
}

.contact__inner {
  padding-block: var(--s-5);
}

.contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--s-5);
  align-items: start;
}

.contact__grid--details-only {
  grid-template-columns: minmax(0, 1fr);
}

@media (max-width: 1024px) {
  .contact__grid {
    grid-template-columns: 1fr;
    gap: var(--s-4);
  }
}

@media (max-width: 767px) {
  .contact {
    min-height: 0;
  }

  .contact__inner {
    padding-block: var(--s-4);
  }
}
</style>
