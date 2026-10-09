import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const target = process.env.VITE_PROXY_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    testTimeout: 30000,
    maxWorkers: 1,
    minWorkers: 1,
  },
  server: { port: 5173, proxy: { '/api': target, '/uploads': target } },
});
