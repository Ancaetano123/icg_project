import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Caminho absoluto para funcionar em Netlify
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
  },
  resolve: {
    alias: {
      'three': 'three'
    }
  }
});