import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  //Added this to fix non-polling, gosh it was the ghetto there by manual refesh
  server: {
    watch: {
      usePolling: true,
      interval: 1000, // Adjust the interval if needed
    },
  },
})
