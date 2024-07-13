import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from "vite-plugin-mkcert";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), mkcert()],
  

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
    https: {
      key: fs.readFileSync('/etc/letsencrypt/live/dev.occupi.tech/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/dev.occupi.tech/fullchain.pem')
    }
  },
});
