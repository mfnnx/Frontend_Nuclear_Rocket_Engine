import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  const isTauri = process.env.VITE_TARGET === 'tauri'

  return {
    plugins: [react()],
    base: isTauri ? './' : '/',
    build: {
      outDir: 'build',
      target: 'es2021',
    },
  }
})