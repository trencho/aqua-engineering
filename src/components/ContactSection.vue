<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import ContactForm from '@/components/ContactForm.vue'
import WaveDivider from '@/components/WaveDivider.vue'

const { c } = useLocale()

/**
 * The map the original embedded, pinned on "Aqua Engineering". Lifted verbatim
 * from the archived markup, so it is the same place with the same zoom.
 *
 * Google is now the only third party whose content the site loads; the hero
 * video moved to this origin on 2026-09-17, leaving the form endpoint and this
 * map. The privacy notice discloses it as an independent controller and
 * privacy-claims.spec.ts counts the origin, so adding another would fail the
 * suite before it shipped. It sits below the fold and is lazy, so nothing is
 * requested from Google until the visitor scrolls here.
 */
const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11859.970132298045' +
  '!2d21.4246833!3d42.0004358!3m2!1i1024!2i768!4f13.1!3m3!1m2' +
  '!1s0x135415fa11a9065f%3A0xd64546862245d41a!2sAqua%20Engineering' +
  '!5e0!3m2!1sen!2smk!4v1706036267792!5m2!1sen!2smk'
</script>

<template>
  <section id="contact" v-reveal="{ type: 'fade-in' }" class="contact">
    <!-- The licences blue carried down into this section. -->
    <WaveDivider fill="#39f" />

    <div class="contact__inner">
      <div v-reveal="{ type: 'fade-in' }" class="contact__col contact__col--form">
        <h2 v-reveal="{ type: 'fade-in-down' }" class="contact__heading">
          {{ c.contact.heading }}
          <span class="rule" aria-hidden="true"></span>
        </h2>
        <ContactForm />
      </div>

      <div v-reveal="{ type: 'fade-in' }" class="contact__col contact__col--map">
        <iframe
          class="contact__map"
          :src="MAP_SRC"
          :title="c.contact.mapTitle"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 80vh;
  background: var(--c-primary);
  color: var(--c-on-dark);
}

.contact__inner {
  display: flex;
  align-items: center;
  gap: 5%;
  width: 100%;
  padding: var(--s-5) 5%;
}

/* 30 / 70, as recovered. */
.contact__col--form {
  width: 30%;
}

.contact__col--map {
  width: 70%;
}

.contact__heading {
  margin: 0 0 var(--s-3);
  color: var(--c-on-dark);
  text-align: center;
}

.rule {
  display: block;
  width: 50%;
  margin: var(--s-1) auto 0;
  border-top: 1px solid currentcolor;
}

.contact__map {
  display: block;
  width: 100%;
  height: 350px;
  border: 0;
  border-radius: var(--radius);
}

@media (max-width: 1024px) {
  /* The original went to an even split between 768 and 1024. */
  .contact__col--form,
  .contact__col--map {
    width: 50%;
  }
}

@media (max-width: 767px) {
  .contact {
    min-height: 0;
  }

  .contact__inner {
    flex-direction: column;
    gap: var(--s-4);
    padding-block: var(--s-4);
  }

  .contact__col--form,
  .contact__col--map {
    width: 100%;
  }

  .contact__map {
    height: 200px;
  }
}
</style>
