import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        settings: fileURLToPath(new URL('./resource/settings/index.html', import.meta.url)),
        app: fileURLToPath(new URL('./resource/app/index.html', import.meta.url)),
      },
    },
  },
})