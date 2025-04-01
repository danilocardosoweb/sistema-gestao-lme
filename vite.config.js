import { defineConfig } from 'vite'
import { resolve } from 'path'
import sass from 'sass'

export default defineConfig({
  root: 'src/client',
  server: {
    port: 5173,
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
    outDir: '../../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/client/pages/index.html'),
        dashboard: resolve(__dirname, 'src/client/pages/dashboard/index.html'),
        analysis: resolve(__dirname, 'src/client/pages/analysis/index.html'),
        purchase: resolve(__dirname, 'src/client/pages/purchase/index.html'),
        consumption: resolve(__dirname, 'src/client/pages/consumption/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/client'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@components': resolve(__dirname, 'src/client/components'),
      '@utils': resolve(__dirname, 'src/client/utils'),
      '@styles': resolve(__dirname, 'src/client/styles')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@styles/themes/variables.scss";`
      }
    }
  }
}); 