import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "node:path";


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 配置别名
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 9999,
    proxy: {
      '/api': {
        target: 'http://localhost:8123', // 后端地址
        changeOrigin: true,
        // 因为后端 context-path 本身就是 /api，所以这里不需要 rewrite
      }
    }
  }
})
