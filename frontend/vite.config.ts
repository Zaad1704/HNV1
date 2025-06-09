import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The "import { resolve } from 'path'" is no longer needed.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Since the build runs in the 'frontend' folder, 
      // Vite just needs the filename.
      input: 'index.html',
    },
  },
})
