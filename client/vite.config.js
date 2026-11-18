import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward /api calls to the Express server, so the frontend can call
    // "/api/projects" without CORS setup or a hard-coded backend URL.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
