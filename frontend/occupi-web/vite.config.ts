import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from "vite-plugin-mkcert";
import fs from 'fs';

// Define paths to the certificates
const certPath = '/etc/letsencrypt/live/dev.occupi.tech/privkey.pem';
const keyPath = '/etc/letsencrypt/live/dev.occupi.tech/fullchain.pem';
const isPreview = process.env.NODE_ENV === 'preview';

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
    https: isPreview ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    } : {},
  },
});
