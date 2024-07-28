import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from "vite-plugin-mkcert";
import fs from 'fs';

// Define paths to the certificates
let keyPath = '';
let certPath = '';

if (process.env.NODE_ENV === 'preview-dev') {
  keyPath = '/etc/letsencrypt/live/dev.occupi.tech/privkey.pem';
  certPath = '/etc/letsencrypt/live/dev.occupi.tech/fullchain.pem';
} else if (process.env.NODE_ENV === 'preview-prod') {
  keyPath = '/etc/letsencrypt/live/app.occupi.tech/privkey.pem';
  certPath = '/etc/letsencrypt/live/app.occupi.tech/fullchain.pem';
}

export default defineConfig({
  plugins: [react(), tsconfigPaths(), mkcert()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // https: true,
    proxy: {
      '/api': {
        target: 'https://dev.occupi.tech',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/auth': {
        target: 'https://dev.occupi.tech',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '/auth'),
      }
    },
    https: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'preview' || process.env.NODE_ENV === 'development' ? {} : {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    host: '0.0.0.0',
    port: 4173,
  },
});