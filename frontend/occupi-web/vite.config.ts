import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from 'fs';

// Define paths to the certificates
let keyPath = '';
let certPath = '';

if (process.env.NODE_ENV === 'development') {
  keyPath = path.resolve(__dirname, 'cert.key');
  certPath = path.resolve(__dirname, 'cert.crt');
} else if (process.env.NODE_ENV === 'preview-dev') {
  keyPath = '/etc/letsencrypt/live/dev.occupi.tech/privkey.pem';
  certPath = '/etc/letsencrypt/live/dev.occupi.tech/fullchain.pem';
} else if (process.env.NODE_ENV === 'preview-prod') {
  keyPath = '/etc/letsencrypt/live/app.occupi.tech/privkey.pem';
  certPath = '/etc/letsencrypt/live/app.occupi.tech/fullchain.pem';
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  

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
    https: process.env.NODE_ENV === 'production' ? {} : {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
  },
});
