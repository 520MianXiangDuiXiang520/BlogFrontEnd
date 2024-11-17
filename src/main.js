import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/message/style/css';

import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn';
import VMdEditor from '@kangc/v-md-editor';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import '@kangc/v-md-editor/lib/style/preview.css';
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index';
import hljs from 'highlight.js';
import VueCookies from 'vue3-cookies'

VMdPreview.use(githubTheme, {
  Hljs: hljs,
}).use(createKatexPlugin()).use(createLineNumbertPlugin());


VMdEditor.use(githubTheme, {
  Hljs: hljs,
}).use(createKatexPlugin()).use(createLineNumbertPlugin());



const app = createApp(App)
app.use(router).use(VMdEditor).use(VMdPreview).use(VueCookies)

app.mount('#app')
