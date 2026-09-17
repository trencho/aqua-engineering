<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import WaveDivider from '@/components/WaveDivider.vue'

const { c } = useLocale()
</script>

<template>
  <section id="whoweare" v-reveal="{ type: 'fade-in' }" class="about">
    <!-- Deep blue, so the wave reads as the hero spilling into this section. -->
    <WaveDivider fill="#005582" />

    <!-- The original put everything in the left half and left the right half
         empty: the second column held an accordion widget with no items. The
         whitespace is the composition, so it is reproduced rather than filled. -->
    <div class="about__inner">
      <div class="about__col">
        <h2 v-reveal="{ type: 'fade-in-down' }" class="about__heading">
          {{ c.about.heading }}
          <span class="rule" aria-hidden="true"></span>
        </h2>
        <div v-reveal="{ type: 'fade-in' }" class="about__body">
          <p v-for="para in c.about.paragraphs" :key="para">{{ para }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 90vh;
  background: var(--c-surface);
}

/* Full bleed. Every container on the original page was e-con-full; the 1140px
   token governed nothing here. Width came from per-column percentages. */
.about__inner {
  width: 100%;
  padding-block: var(--s-5);
}

.about__col {
  width: 50%;
  margin-left: 5%;
}

.about__heading {
  margin: 0 0 var(--s-3);
  color: var(--c-primary);
  text-align: center;
}

/* The 1px rule at half width under every section heading. */
.rule {
  display: block;
  width: 50%;
  margin: var(--s-1) auto 0;
  border-top: 1px solid currentcolor;
}

.about__body {
  max-width: 68ch;
}

.about__body p:last-child {
  margin-bottom: 0;
}

@media (max-width: 1024px) {
  /* The original grew both middle sections to a full viewport on tablet. */
  .about {
    min-height: 100vh;
  }

  .about__heading {
    font-size: 2.5rem; /* 40px, as recovered for this section only */
  }

  .about__col {
    width: 90%;
  }
}

@media (max-width: 767px) {
  .about {
    min-height: 0;
  }

  .about__inner {
    padding-block: var(--s-4);
  }

  .about__col {
    width: auto;
    margin-inline: 5%;
  }
}
</style>
