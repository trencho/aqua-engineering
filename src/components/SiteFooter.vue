<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import SiteLogo from '@/components/SiteLogo.vue'
import ContactDetails from '@/components/ContactDetails.vue'
import { FOUNDED } from '@/content'

const { c, locale } = useLocale()

const privacyPath = computed(() => (locale.value === 'mk' ? '/mk/privacy' : '/privacy'))
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <SiteLogo class="footer__logo" :file="c.logo.white" :alt="c.logo.alt" />
      <ContactDetails class="footer__details" />
    </div>

    <!-- Neither of these existed on the original, and both stay: a privacy
         notice nobody can reach is not a notice. -->
    <div class="footer__legal">
      <span>&copy; {{ FOUNDED }}&ndash;{{ year }} {{ c.meta.title }}</span>
      <RouterLink class="footer__link" :to="privacyPath">{{ c.ui.privacyLink }}</RouterLink>
    </div>
  </footer>
</template>

<style scoped>
/* --c-primary, as recovered. The rebuild had drifted to the darker --c-accent. */
.footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 20vh;
  padding: var(--s-4) 5%;
  background: var(--c-primary);
  color: var(--c-on-dark);
}

.footer__inner {
  display: flex;
  align-items: center;
  gap: var(--s-4);
}

.footer__logo {
  flex: 0 0 25%;
  max-width: 25%;
}

.footer__details {
  flex: 1 1 auto;
}

.footer__legal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  margin-top: var(--s-3);
  padding-top: var(--s-2);
  border-top: 1px solid rgb(255 255 255 / 25%);
  font-size: var(--fs-fine);
}

.footer__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--c-on-dark);
}

.footer__link:hover {
  color: var(--c-on-dark);
  text-decoration: none;
}

@media (max-width: 767px) {
  .footer {
    min-height: 0;
  }

  .footer__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer__logo {
    flex-basis: auto;
    width: 50%;
    max-width: none;
    margin-inline: auto;
  }

  .footer__legal {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--s-1);
  }
}
</style>
