import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],


  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  //Added this to fix non-polling, gosh it was the ghetto there by manual refesh
  server: {
    watch: {
      usePolling: true,
      interval: 1000, // Adjust the interval if needed
    },
  },
})
