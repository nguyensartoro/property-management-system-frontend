import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: path => path,
        configure: proxy => {
          proxy.on('error', err => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            // Add CORS headers to the request
            proxyReq.setHeader('Origin', 'http://localhost:5173');
            console.log('Proxying request to:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received proxied response from:', req.url, 'status:', proxyRes.statusCode);
          });
        }
      }
    }
  }
});
