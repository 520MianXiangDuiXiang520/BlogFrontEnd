import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/message/style/css';

// 配置 md-editor-v3 使用 npm 包中的 KaTeX
import { config } from 'md-editor-v3';
import katex from 'katex';
import 'katex/dist/katex.min.css';

config({
  editorExtensions: {
    katex: {
      instance: katex
    }
  }
});

import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/npm';
import VMdEditor from '@kangc/v-md-editor';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import '@kangc/v-md-editor/lib/style/preview.css';
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index';
import hljs from 'highlight.js';
import VueCookies from 'vue3-cookies'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'




VMdPreview.use(githubTheme, {
  Hljs: hljs,
}).use(createKatexPlugin()).use(createLineNumbertPlugin());


VMdEditor.use(githubTheme, {
  Hljs: hljs,
}).use(createKatexPlugin()).use(createLineNumbertPlugin());



const app = createApp(App)
app.use(router).use(VMdEditor).use(VMdPreview).use(VueCookies)

app.mount('#app')
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
