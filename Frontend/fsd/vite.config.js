import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    allowedHosts: [
      'b6a2-103-187-228-77.ngrok-free.app', // Explicitly allow your ngrok host
      'all' // Fallback to allow all hosts
    ],
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      clientPort: 443,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173, // Change this if needed
  },
});
