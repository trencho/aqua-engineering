<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { licenceDisplayUrl, licenceUrl } from '@/composables/useAssets'
import WaveDivider from '@/components/WaveDivider.vue'

const { c } = useLocale()
</script>

<template>
  <section id="licenses" v-reveal="{ type: 'fade-in' }" class="licences">
    <!-- White, carrying the previous section down into this one. -->
    <WaveDivider fill="#ffffff" />

    <div class="licences__inner">
      <div class="licences__text">
        <h2 v-reveal="{ type: 'fade-in-down' }" class="licences__heading">
          {{ c.licences.heading }}
          <span class="rule" aria-hidden="true"></span>
        </h2>
        <p v-reveal="{ type: 'fade-in' }" class="licences__body">{{ c.licences.body }}</p>
      </div>

      <!-- The original's horizontal image accordion: two cover panels that
           expand on hover, each captioned in white over the image. The panel
           crops the scan, so every one links to the full file. Expanding on
           :focus-within as well as :hover keeps it usable from the keyboard. -->
      <ul class="licences__strip">
        <li v-for="item in c.licences.items" :key="item.image" class="licences__panel">
          <a
            class="licences__link"
            :href="licenceUrl(item.image)"
            target="_blank"
            rel="noopener"
            :style="{ backgroundImage: `url(${licenceDisplayUrl(item.image)})` }"
          >
            <span class="licences__caption">
              {{ item.caption }}
              <span class="visually-hidden">({{ c.ui.viewFullSize }})</span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* The original painted this band --c-secondary (#39f) with white type, which
   measures 2.94. --c-band is that blue darkened until white clears 4.5. */
.licences {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 90vh;
  background: var(--c-band);
  color: var(--c-on-dark);
}

.licences__inner {
  display: flex;
  align-items: center;
  gap: 5%;
  width: 100%;
  padding: var(--s-5) 5%;
}

.licences__text {
  width: 40%;
}

.licences__heading {
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

.licences__body {
  margin: 0;
}

.licences__strip {
  display: flex;
  gap: 2px;
  width: 60%;
  height: 50vh;
  margin: 0;
  padding: 0;
  list-style: none;
}

.licences__panel {
  flex: 1 1 0;
  min-width: 0;
  transition: flex-grow var(--transition);
}

.licences__panel:hover,
.licences__panel:focus-within {
  flex-grow: 1.6;
}

.licences__link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 15px;
  background-position: center;
  background-size: cover;
  border-radius: 4px;
  text-decoration: none;
}

/* The hover wash the original used, deep blue fading up from transparent. It
   sits under the caption so the text stays readable either way. */
.licences__link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(0 85 130 / 32%) 0%, var(--c-primary) 100%);
  opacity: 0;
  transition: opacity var(--transition);
}

.licences__panel:hover .licences__link::before,
.licences__link:focus-visible::before {
  opacity: 1;
}

/* The original set this white directly on the image, with the deep-blue wash
   arriving only on hover. That works over a photograph and not at all over
   these two: they are pale scanned documents, so unhovered the caption was
   white on near-white. The plate is the smallest thing that fixes it while
   keeping the caption where the original put it — over the image, centred.
   White on --c-primary at 82% measures 5.18 against a white scan. */
.licences__caption {
  position: relative;
  padding: var(--s-2) var(--s-3);
  background: rgb(0 85 130 / 82%);
  border-radius: var(--radius);
  color: var(--c-on-dark);
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  text-align: center;
}

@media (max-width: 1024px) {
  .licences {
    min-height: 100vh;
  }

  .licences__heading {
    font-size: 1.875rem; /* 30px, as recovered for this section only */
  }

  .licences__inner {
    flex-direction: column;
    gap: var(--s-4);
  }

  .licences__text,
  .licences__strip {
    width: 100%;
  }
}

@media (max-width: 767px) {
  .licences {
    min-height: 0;
  }

  .licences__inner {
    padding-block: var(--s-4);
  }

  .licences__strip {
    height: 40vh;
  }
}
</style>
