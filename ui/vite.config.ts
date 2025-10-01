import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwind from '@tailwindcss/vite'
// import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* to Laravel dev server
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    dedupe: ['leaflet', 'react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['leaflet'], // pre-bundle it once
  },
})
