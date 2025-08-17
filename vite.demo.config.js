import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'docs/demo',
  publicDir: 'docs/demo',
  server: {
    port: 8002,
    host: true,
    open: false,
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: 'docs/demo',
    emptyOutDir: false
  }
})
