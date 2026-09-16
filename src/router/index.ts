import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Locale } from '@/content'
import HomeView from '@/views/HomeView.vue'

/**
 * The WordPress site served English at / and Macedonian at /mk/ through
 * Polylang. Those URLs are kept exactly, so inbound links and anything already
 * indexed still resolve.
 */
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home-en', component: HomeView, meta: { locale: 'en' satisfies Locale } },
  { path: '/mk', name: 'home-mk', component: HomeView, meta: { locale: 'mk' satisfies Locale } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
