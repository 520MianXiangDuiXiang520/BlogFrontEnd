import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'

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
    },
    // 包分析工具
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: ServerAddr,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vue 相关
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
            return 'vue-vendor';
          }
          
          // Element Plus
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus';
          }
          
          // 数学公式
          if (id.includes('node_modules/katex')) {
            return 'math';
          }
          
          // 日期处理 - 进一步拆分
          if (id.includes('node_modules/moment')) {
            return 'moment';
          }
          if (id.includes('node_modules/dayjs')) {
            return 'dayjs';
          }
          if (id.includes('node_modules/moment-timezone')) {
            return 'moment-timezone';
          }
          
          // HTTP 客户端
          if (id.includes('node_modules/axios')) {
            return 'http-client';
          }
          
          // 加密工具
          if (id.includes('node_modules/crypto-js') || id.includes('node_modules/whirlpool')) {
            return 'crypto';
          }
          
          // 工具库
          if (id.includes('node_modules/lodash') || id.includes('node_modules/lodash-es')) {
            return 'utils';
          }
          
          // CodeMirror 相关 - 进一步拆分
          if (id.includes('node_modules/@codemirror/state')) {
            return 'codemirror-state';
          }
          if (id.includes('node_modules/@codemirror/view')) {
            return 'codemirror-view';
          }
          if (id.includes('node_modules/@codemirror/language')) {
            return 'codemirror-language';
          }
          if (id.includes('node_modules/@codemirror/commands')) {
            return 'codemirror-commands';
          }
          if (id.includes('node_modules/@codemirror/search')) {
            return 'codemirror-search';
          }
          if (id.includes('node_modules/@codemirror/theme-one-dark')) {
            return 'codemirror-theme';
          }
          
          // CodeMirror 语言解析器 - 进一步细分
          if (id.includes('node_modules/@codemirror/lang-markdown')) {
            return 'codemirror-markdown';
          }
          if (id.includes('node_modules/@codemirror/lang-javascript')) {
            return 'codemirror-javascript';
          }
          if (id.includes('node_modules/@codemirror/lang-html')) {
            return 'codemirror-html';
          }
          if (id.includes('node_modules/@codemirror/lang-css')) {
            return 'codemirror-css';
          }
          if (id.includes('node_modules/@codemirror/lang-json')) {
            return 'codemirror-json';
          }
          if (id.includes('node_modules/@codemirror/lang-python')) {
            return 'codemirror-python';
          }
          if (id.includes('node_modules/@codemirror/lang-java')) {
            return 'codemirror-java';
          }
          if (id.includes('node_modules/@codemirror/lang-cpp')) {
            return 'codemirror-cpp';
          }
          if (id.includes('node_modules/@codemirror/lang-php')) {
            return 'codemirror-php';
          }
          if (id.includes('node_modules/@codemirror/lang-rust')) {
            return 'codemirror-rust';
          }
          if (id.includes('node_modules/@codemirror/lang-go')) {
            return 'codemirror-go';
          }
          if (id.includes('node_modules/@codemirror/lang-yaml')) {
            return 'codemirror-yaml';
          }
          if (id.includes('node_modules/@codemirror/lang-xml')) {
            return 'codemirror-xml';
          }
          if (id.includes('node_modules/@codemirror/lang-sql')) {
            return 'codemirror-sql';
          }
          if (id.includes('node_modules/@codemirror/lang-less')) {
            return 'codemirror-less';
          }
          if (id.includes('node_modules/@codemirror/lang-sass')) {
            return 'codemirror-sass';
          }
          if (id.includes('node_modules/@codemirror/lang-vue')) {
            return 'codemirror-vue';
          }
          if (id.includes('node_modules/@codemirror/lang-angular')) {
            return 'codemirror-angular';
          }
          if (id.includes('node_modules/@codemirror/lang-liquid')) {
            return 'codemirror-liquid';
          }
          if (id.includes('node_modules/@codemirror/lang-wast')) {
            return 'codemirror-wast';
          }
          if (id.includes('node_modules/@codemirror/legacy-modes')) {
            return 'codemirror-legacy';
          }
          if (id.includes('node_modules/@codemirror/autocomplete')) {
            return 'codemirror-autocomplete';
          }
          if (id.includes('node_modules/@codemirror/lint')) {
            return 'codemirror-lint';
          }
          if (id.includes('node_modules/@codemirror')) {
            return 'codemirror-core';
          }
          
          // 构建工具
          if (id.includes('node_modules/vite') || 
              id.includes('node_modules/@vitejs') ||
              id.includes('node_modules/rollup') ||
              id.includes('node_modules/@rollup')) {
            return 'build-tools';
          }
          
          // Babel 相关
          if (id.includes('node_modules/@babel')) {
            return 'babel';
          }
          
          // 浏览器兼容性数据
          if (id.includes('node_modules/caniuse-lite')) {
            return 'browser-data';
          }
          
          // 其他大型库单独分包
          if (id.includes('node_modules/terser')) {
            return 'terser';
          }
          if (id.includes('node_modules/unplugin-auto-import') || 
              id.includes('node_modules/unplugin-vue-components')) {
            return 'unplugin';
          }
          if (id.includes('node_modules/vite-plugin-vue-devtools')) {
            return 'vite-devtools';
          }
          if (id.includes('node_modules/way-of-life')) {
            return 'way-of-life';
          }
          
          // 其他第三方库 - 按类型进一步拆分
          if (id.includes('node_modules/@types')) {
            return 'types';
          }
          if (id.includes('node_modules/@esbuild')) {
            return 'esbuild';
          }
          
          // Lezer 语言解析器 - 进一步细分
          if (id.includes('node_modules/@lezer/markdown')) {
            return 'lezer-markdown';
          }
          if (id.includes('node_modules/@lezer/javascript')) {
            return 'lezer-javascript';
          }
          if (id.includes('node_modules/@lezer/cpp')) {
            return 'lezer-cpp';
          }
          if (id.includes('node_modules/@lezer/php')) {
            return 'lezer-php';
          }
          if (id.includes('node_modules/@lezer/rust')) {
            return 'lezer-rust';
          }
          if (id.includes('node_modules/@lezer/java')) {
            return 'lezer-java';
          }
          if (id.includes('node_modules/@lezer/python')) {
            return 'lezer-python';
          }
          if (id.includes('node_modules/@lezer/html')) {
            return 'lezer-html';
          }
          if (id.includes('node_modules/@lezer/css')) {
            return 'lezer-css';
          }
          if (id.includes('node_modules/@lezer/yaml')) {
            return 'lezer-yaml';
          }
          if (id.includes('node_modules/@lezer/json')) {
            return 'lezer-json';
          }
          if (id.includes('node_modules/@lezer/xml')) {
            return 'lezer-xml';
          }
          if (id.includes('node_modules/@lezer/sass')) {
            return 'lezer-sass';
          }
          if (id.includes('node_modules/@lezer/go')) {
            return 'lezer-go';
          }
          if (id.includes('node_modules/@lezer')) {
            return 'lezer-core';
          }
          if (id.includes('node_modules/vue3-cookies')) {
            return 'vue3-cookies';
          }
          
          // 进一步拆分 vendor 中的大型依赖
          if (id.includes('node_modules/@vueuse/core')) {
            return 'vueuse';
          }
          if (id.includes('node_modules/rollup-plugin-visualizer')) {
            return 'visualizer';
          }
          if (id.includes('node_modules/autoprefixer') || 
              id.includes('node_modules/postcss') ||
              id.includes('node_modules/cssnano')) {
            return 'css-tools';
          }
          if (id.includes('node_modules/@vue/compiler-sfc') ||
              id.includes('node_modules/@vue/compiler-dom') ||
              id.includes('node_modules/@vue/runtime-dom')) {
            return 'vue-compiler';
          }
          
          // md-editor-v3 相关依赖 - 不进行静态分包，使用动态导入
          if (id.includes('node_modules/md-editor-v3') ||
              id.includes('node_modules/@md-editor-v3') ||
              id.includes('node_modules/md-editor-v3-extension')) {
            return 'md-editor';
          }
          
          // 其他第三方库
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
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
    chunkSizeWarningLimit: 600,
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




