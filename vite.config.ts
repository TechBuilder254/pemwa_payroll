import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'next/router': path.resolve(__dirname, 'src/shims/next-router.ts'),
      'next/link': path.resolve(__dirname, 'src/shims/next-link.tsx'),
      'next/dynamic': path.resolve(__dirname, 'src/shims/next-dynamic.tsx'),
      'next/head': path.resolve(__dirname, 'src/shims/next-head.tsx'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env': {},
  },
})


