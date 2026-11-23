import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5183,
    strictPort: true,
    // The Worker owns /api and /auth; Vite serves the SPA during development.
    proxy: {
      '/api': api,
      '/auth': api,
    },
  },
});
