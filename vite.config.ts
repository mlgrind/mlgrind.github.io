import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    exclude: ['pyodide']
  },
  build: {
    rollupOptions: {
      output: {
        // The app previously shipped as one ~1.3 MB chunk. Split the heavy,
        // rarely-changing dependencies out so they cache independently of the
        // problem content, which is what actually changes between deploys.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-editor': ['@monaco-editor/react'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
          'problem-data': ['./src/data/problems/index.ts', './src/data/sections.ts'],
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
