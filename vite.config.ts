import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // Добавляем полифил для global
  },
  server: {
    port: 3000,
    strictPort: true, // Чтобы Vite не переключился на другой порт, если этот занят
  },
})