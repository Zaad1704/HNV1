import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Point to the correct entry file inside the public folder
      input: 'public/index.html',
    },
  },
})
