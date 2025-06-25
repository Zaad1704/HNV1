// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path' // Import the 'path' module

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'HNV Property Management',
        short_name: 'HNV',
        description: 'The All-in-One Platform for Modern Property Management',
        theme_color: '#3D52A0', 
        background_color: '#F7F8FA', 
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', 
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  // Add the resolve alias configuration here
  resolve: {
    alias: {
      'api': path.resolve(__dirname, './src/api'),
      'components': path.resolve(__dirname, './src/components'),
      'contexts': path.resolve(__dirname, './src/contexts'),
      'hooks': path.resolve(__dirname, './src/hooks'),
      'pages': path.resolve(__dirname, './src/pages'),
      'store': path.resolve(__dirname, './src/store'),
      'types': path.resolve(__dirname, './src/types'),
      'services': path.resolve(__dirname, './src/services'),
    }
  },
  build: {
    minify: true,
    sourcemap: true,
  }
});
