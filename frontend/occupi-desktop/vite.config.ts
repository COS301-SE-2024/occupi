import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tsconfigPaths()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },

    proxy: {
      '/api': {
        target: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "preview-dev" ? 'https://dev.occupi.tech' : "https://occupi.tech",
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
        target: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "preview-dev" ? 'https://dev.occupi.tech' : "https://occupi.tech",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '/auth'),
      },
      '/analytics': {
        target: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "preview-dev" ? 'https://dev.occupi.tech' : "https://occupi.tech",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/analytics/, '/analytics'),
      },
    }
  },
}));
