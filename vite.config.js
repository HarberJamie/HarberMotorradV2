// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Compute __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// BASE_PATH is injected by the GitHub Actions workflow for both main and PR previews.
// Locally (npm run dev / npm run build), it will be undefined, so default to '/'.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // enables "@/..." imports
    },
  },
})
