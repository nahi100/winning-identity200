import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production build for Render Static Site.
// API URL is read from VITE_API_URL env var (set in Render dashboard).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
