import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev proxy: forwards /api calls to the backend on port 8000
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:8000' },
  },
});
