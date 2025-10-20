// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/HarberMotorradV2/',   // MUST match repo name exactly (case-sensitive)
})
