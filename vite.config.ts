  import mkcert from 'vite-plugin-mkcert'
  import fs from 'fs';
  import path from 'path';
  import { defineConfig } from 'vite'
  import { VitePWA } from 'vite-plugin-pwa'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    server: {
      host: '0.0.0.0',       
      port: 3000,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err)
            })
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to Target:', req.method, req.url)
            })
          },
        },
      '/minio': {
        target: 'http://192.168.56.1:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/minio/, ''),
      },
      },
    },

    plugins: [
      react(),
      mkcert(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
        enabled: true,
        },
        manifest: {
          name: 'nre',
          short_name: 'nre',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#42b883',
          icons: [
            {
              src: 'rocket.svg',
              sizes: '192x192',
              type: 'image/svg',
            },
            {
              src: 'rocket.svg',
              sizes: '512x512',
              type: 'image/svg',
            },
          ],
        },
      }),
    ],

  })
