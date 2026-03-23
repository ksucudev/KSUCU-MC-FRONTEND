import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      overlay: true
    },
    proxy: {
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: true
      },
      '/news': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/attendance': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/adminnews': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/adminmission': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/adminBs': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/sadmin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/admissionadmin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/polling-officer': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/documents': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/minutes': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/commitmentForm': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/chat/': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/messages': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/overseer': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => req.headers.accept?.includes('text/html') ? '/index.html' : null
      },
      '/patron': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    devSourcemap: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          fontawesome: ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/free-regular-svg-icons', '@fortawesome/free-brands-svg-icons', '@fortawesome/react-fontawesome'],
          pdf: ['jspdf', 'jspdf-autotable'],
          ui: ['bootstrap', 'react-icons', 'lucide-react']
        }
      }
    }
  }
})
