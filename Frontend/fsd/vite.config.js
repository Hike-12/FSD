import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    headers: {
      "ngrok-skip-browser-warning": "69420", // Magic number to bypass ngrok warning
      "Access-Control-Allow-Origin": "http://192.168.0.110:5173/",
      "Access-Control-Allow-Credentials": "true"
    },
    allowedHosts: [
      '192.168.0.110:5173/',
      'all'
    ],
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
});
