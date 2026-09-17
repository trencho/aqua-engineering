import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { vReveal } from './directives/reveal'
import './assets/styles/base.css'

createApp(App).use(router).directive('reveal', vReveal).mount('#app')
