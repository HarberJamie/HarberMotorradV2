import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/HarberMotorradV2/', // 👈 must match your repo name exactly (case-sensitive)
})
