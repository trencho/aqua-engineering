import { mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import type { Component } from 'vue'
import type { Locale } from '@/content'

/**
 * Components read their locale from `route.meta.locale`, so they need a real
 * router rather than a stub. A memory-history router is the smallest thing that
 * behaves like the real one, including navigation.
 */
export async function mountAt(component: Component, locale: Locale = 'en') {
  const router: Router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' }, meta: { locale: 'en' } },
      { path: '/mk', component: { template: '<div />' }, meta: { locale: 'mk' } },
    ],
  })

  await router.push(locale === 'mk' ? '/mk' : '/')
  await router.isReady()

  const wrapper: VueWrapper = mount(component, {
    global: { plugins: [router] },
    attachTo: document.body,
  })

  return { wrapper, router }
}
