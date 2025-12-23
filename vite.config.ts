
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Shims process.env for the browser
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  }
});
