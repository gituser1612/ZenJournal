import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Explicitly define process.env.API_KEY for the browser context
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env': {}
  },
  server: {
    fs: {
      strict: false
    }
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false
  }
});