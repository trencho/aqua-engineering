<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
import IconRail from '@/components/IconRail.vue'
import HeroSection from '@/components/HeroSection.vue'
import WhoWeAreSection from '@/components/WhoWeAreSection.vue'
import LicencesSection from '@/components/LicencesSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useLocale } from '@/composables/useLocale'
import { useHead } from '@/composables/useHead'

const { c, locale } = useLocale()

useHead(c, locale)
</script>

<template>
  <a class="skip-link" href="#main">{{ c.ui.skipToContent }}</a>
  <SiteHeader overlay />
  <IconRail />
  <main id="main">
    <HeroSection />
    <WhoWeAreSection />
    <LicencesSection />
    <ContactSection />
  </main>
  <SiteFooter />
</template>
