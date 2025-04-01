import { defineConfig } from 'vite'
import { resolve } from 'path'
import sass from 'sass'

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        analysis: resolve(__dirname, 'analysis.html'),
        purchase: resolve(__dirname, 'purchase_request.html'),
        consumption: resolve(__dirname, 'consumption_analysis.html')
      }
    }
  }
}); 