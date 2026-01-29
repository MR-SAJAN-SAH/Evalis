import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
    middlewareMode: false,
  },
  define: {
    // Ensure environment variables are defined at build time
    __VITE_API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000'),
  },
})
