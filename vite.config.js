import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Mudança importante: usar caminhos relativos
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        easy: 'easy.html'
      }
    }
  },
  server: {
    open: true
  }
});