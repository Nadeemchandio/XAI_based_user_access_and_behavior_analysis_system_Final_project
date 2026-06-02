import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Ye import karein

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Ye plugin add karein
  ],
})
