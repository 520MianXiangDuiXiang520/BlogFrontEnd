import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const ServerAddr = "http://127.0.0.1:8080"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    {
      name: 'md-loader',
      transform(code, id) {
        if (id.endsWith('.md')) {
          return `export default ${JSON.stringify(code)}`;
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将Vue相关库分离
          'vue-vendor': ['vue', 'vue-router'],
          // 将Element Plus分离
          'element-plus': ['element-plus'],
          // 将markdown编辑器相关分离
          'markdown-editor': [
            '@kangc/v-md-editor',
            'md-editor-v3',
            'highlight.js'
          ],
          // 将数学公式相关分离
          'math': ['katex'],
          // 将工具库分离
          'utils': ['axios', 'crypto-js', 'moment-timezone', 'vue3-cookies', 'whirlpool']
        }
      }
    },
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 设置chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用源码映射（生产环境建议关闭）
    sourcemap: false
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'element-plus',
      'axios',
      'crypto-js',
      'moment-timezone',
      'vue3-cookies'
    ]
  }
})




