import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/calendar': {
        target: 'http://localhost', // Overridden by router
        changeOrigin: true,
        router: (req) => {
          if (!req || !req.url) return 'http://localhost';
          try {
            const url = new URL(req.url, 'http://localhost');
            const targetUrl = url.searchParams.get('target');
            return targetUrl ? new URL(targetUrl).origin : 'http://localhost';
          } catch (e) {
            return 'http://localhost';
          }
        },
        rewrite: (path) => {
          try {
            const url = new URL(path, 'http://localhost');
            const targetUrl = url.searchParams.get('target');
            if (targetUrl) {
              const target = new URL(targetUrl);
              return target.pathname + target.search;
            }
          } catch (e) {
            // fail silently and return original path
          }
          return path;
        }
      }
    }
  }
})