import { defineConfig } from 'vite';

// base relativa para poder servir el build desde cualquier carpeta/CDN.
export default defineConfig({
  base: './',
  server: {
    port: 5173,
    // Proxy al backend en dev para evitar problemas de CORS si se prefiere.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
