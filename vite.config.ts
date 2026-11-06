import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: [
      // Monaco vendors DOMPurify separately; use the audited dependency for it
      // as well as ordinary package imports.
      { find: /^\.\/dompurify\/dompurify\.js$/, replacement: fileURLToPath(new URL('./node_modules/dompurify/dist/purify.es.mjs', import.meta.url)) },
    ],
  },
  optimizeDeps: {
    exclude: ['pyodide']
  },
  build: {
    rollupOptions: {
      output: {
        // The app previously shipped as one ~1.3 MB chunk. Split the heavy,
        // rarely-changing dependencies out so they cache independently of the
        // problem content, which is what actually changes between deploys.
        manualChunks(id) {
          if (id.includes('/src/data/')) return 'problem-data';
          if (id.includes('/node_modules/@firebase/') || id.includes('/node_modules/firebase/')) return 'vendor-firebase';
          if (id.includes('/node_modules/@monaco-editor/')) return 'vendor-editor';
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'vendor-react';
        },
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
