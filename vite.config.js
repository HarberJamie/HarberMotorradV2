// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is injected by the workflow for both main and PR previews.
// Fallback to '/HarberMotorradV2/' for local one-off builds or manual deployments.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/HarberMotorradV2/',
})
