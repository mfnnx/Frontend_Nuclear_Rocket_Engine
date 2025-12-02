import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

// Генерация самоподписанного сертификата (для разработки)
// Или используйте существующие сертификаты

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'NRE Frontend',
        short_name: 'NRE',
        start_url: '/frontend/',
        scope: '/frontend/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#D2F95F',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/frontend/logo192.png',
            type: 'image/png',
            sizes: '192x192'
          },
          {
            src: '/frontend/logo512.png',
            type: 'image/png',
            sizes: '512x512'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/frontend/index.html',
        clientsClaim: true,
        skipWaiting: true,
      }
    })
  ],

  base: '/frontend/',

  build: {
    outDir: 'dist',
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    https: {
      // Вариант 1: Самоподписанный сертификат (автоматическая генерация)
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
      
      // Или вариант 2: Сгенерируйте сертификаты через mkcert:
      // 1. Установите mkcert: https://github.com/FiloSottile/mkcert
      // 2. mkcert -install
      // 3. mkcert localhost 192.168.0.106
      // 4. Используйте сгенерированные файлы:
      // key: fs.readFileSync(path.resolve(__dirname, 'localhost+1-key.pem')),
      // cert: fs.readFileSync(path.resolve(__dirname, 'localhost+1.pem')),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/minio': {
        target: 'http://192.168.0.106:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/minio/, '') // КРИТИЧЕСКИ ВАЖНО!
      },

    }
  },
})