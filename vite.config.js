import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Injected by the workflow for main and PR previews.
// Fallback ensures manual builds still work.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/HarberMotorradV2/',
})
