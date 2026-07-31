import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://samihanninen.github.io/OsumaOnni/ — the trailing slash
  // matters, and the path is case-sensitive on GitHub Pages.
  base: '/OsumaOnni/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    /*
     * ExcelJS on noin 930 kB oma paketti. Se ladataan tarkoituksella vasta kun tuloksia
     * viedään tai tuodaan (dynaaminen import), joten se ei ole mukana sovelluksen
     * käynnistyksessä. Nostetaan raja, jottei odotettu tilanne näytä virheeltä CI:ssä.
     */
    chunkSizeWarningLimit: 1000,
  },
})
