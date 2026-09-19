import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Bind on the LAN, not just localhost — other players' devices need to
  // reach this dev server over WiFi to use their own character sheet.
  server: { host: true },
})
