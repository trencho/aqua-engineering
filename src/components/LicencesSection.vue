<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { licenceDisplayUrl, licenceUrl } from '@/composables/useAssets'

const { c } = useLocale()
</script>

<template>
  <section id="licenses" class="licences">
    <div class="licences__inner container">
      <h2 class="licences__heading">{{ c.licences.heading }}</h2>
      <p class="licences__body">{{ c.licences.body }}</p>

      <ul class="licences__list">
        <li v-for="item in c.licences.items" :key="item.image" class="licences__item">
          <!-- The scans are 2560px tall. They are shown at a readable size and
               linked to the full file rather than trapped in a lightbox. -->
          <a class="licences__link" :href="licenceUrl(item.image)" target="_blank" rel="noopener">
            <img
              class="licences__image"
              :src="licenceDisplayUrl(item.image)"
              :alt="item.alt"
              width="705"
              height="1000"
              loading="lazy"
              decoding="async"
            />
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
.licences {
  display: flex;
  align-items: center;
  min-height: 90vh;
  background: var(--c-surface-alt);
}

.licences__inner {
  padding-block: var(--s-5);
}

.licences__heading {
  max-width: 24ch;
}

.licences__body {
  max-width: 68ch;
  margin-bottom: var(--s-4);
}

.licences__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--s-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.licences__link {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-2);
  min-height: 44px;
  text-decoration: none;
}

.licences__image {
  width: auto;
  max-width: 100%;
  /* Constrained by height, because the source is portrait and very tall. */
  max-height: 46vh;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow);
}

.licences__caption {
  color: var(--c-primary);
  font-size: var(--fs-small);
  font-weight: var(--fw-semi);
}

.licences__link:hover .licences__image {
  border-color: var(--c-secondary-text);
}

@media (max-width: 767px) {
  .licences {
    min-height: 0;
  }

  .licences__inner {
    padding-block: var(--s-4);
  }

  .licences__list {
    grid-template-columns: 1fr;
    gap: var(--s-3);
  }

  .licences__image {
    max-height: 60vh;
  }
}
</style>
