import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'NRE',
        short_name: 'utility-services',
        start_url: '/frontend/',
        scope: '/frontend/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b883',
        icons: [
          {
            src: '/frontend/rocket.svg',
            sizes: '192x192',
            type: 'image/svg',
          },
          {
            src: '/frontend/rocket.svg',
            sizes: '512x512',
            type: 'image/svg',
          },
        ],
      },
    }),
  ],

  base: '/frontend/',

  build: {
    outDir: 'build',
  },

  server: {

    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p,
      },
      '/minio': {
        target: 'http://192.168.1.108:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/minio/, ''),
      },
    },
  },
})
