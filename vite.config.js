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
  ],
  server: {
    proxy: {
      "/proxyapi": {
        target: ServerAddr,
        changeOrigin: true,
        rewrite:path => path.replace(/^\/proxyapi/,'/api'),
        // configure: (proxy, options) => {
        //   proxy.on("proxyRes", (proxyRes, req, res) => {
        //     proxyRes.headers["x-proxy-url"] = ServerAddr + req.originalUrl;
        //   });
        // },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
})
