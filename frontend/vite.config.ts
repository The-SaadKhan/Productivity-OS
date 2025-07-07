import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist', // ✅ Vercel looks for this output folder
  },
  server: {
    port: 5173,
    open: true,
  },
});
