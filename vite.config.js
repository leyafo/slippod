import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        settings: fileURLToPath(new URL('./renderer/settings.html', import.meta.url)),
        app: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
  },
})