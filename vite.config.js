import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Single export with proxy to backend API
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Add SPA fallback for development
  preview: {
    port: 4173,
    host: true,
    // Ensure SPA routing works in preview
    historyApiFallback: true,
  },
});
