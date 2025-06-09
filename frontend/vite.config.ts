import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path' // <-- Add this import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // vvv Add this build configuration vvv
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})
