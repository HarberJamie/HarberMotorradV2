// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/HarberMotorradV2/', // MUST match repo name exactly (case-sensitive)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ enables "@/..." imports
    },
  },
})
