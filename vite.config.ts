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
        target: process.env.VITE_API_URL || `http://localhost:${process.env.API_PORT || 5174}`,
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
    // Ensure headers are passed through
    cors: false,
  },
  define: {
    'process.env': {},
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  // For production builds, optimize chunks
  optimizeDeps: {
    exclude: ['@tanstack/react-query'],
  },
})


