import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { emitLocaleShells } from './scripts/emit-locale-shells'

export default defineConfig({
  plugins: [vue(), emitLocaleShells()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // Needed so contrast.spec.ts can import tokens.css?inline and assert against
    // the real stylesheet. Without it Vitest skips CSS and the import is empty.
    css: true,
    globals: true,
    include: ['src/**/*.spec.ts', 'scripts/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/main.ts', 'src/**/*.spec.ts'],
    },
  },
})
