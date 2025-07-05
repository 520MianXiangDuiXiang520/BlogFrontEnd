import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 按需导入Element Plus样式
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/message/style/css';

// 懒加载markdown编辑器相关
const loadMarkdownEditor = async () => {
  const { config } = await import('md-editor-v3');
  const katex = await import('katex');
  const katexCSS = await import('katex/dist/katex.min.css');

  config({
    editorExtensions: {
      katex: {
        instance: katex.default
      }
    }
  });

  const createKatexPlugin = (await import('@kangc/v-md-editor/lib/plugins/katex/npm')).default;
  const VMdEditor = (await import('@kangc/v-md-editor')).default;
  const VMdPreview = (await import('@kangc/v-md-editor/lib/preview')).default;
  const baseEditorCSS = await import('@kangc/v-md-editor/lib/style/base-editor.css');
  const githubTheme = (await import('@kangc/v-md-editor/lib/theme/github.js')).default;
  const githubCSS = await import('@kangc/v-md-editor/lib/theme/style/github.css');
  const previewCSS = await import('@kangc/v-md-editor/lib/style/preview.css');
  const createLineNumbertPlugin = (await import('@kangc/v-md-editor/lib/plugins/line-number/index')).default;
  const hljs = await import('highlight.js');

  VMdPreview.use(githubTheme, {
    Hljs: hljs.default,
  }).use(createKatexPlugin()).use(createLineNumbertPlugin());

  VMdEditor.use(githubTheme, {
    Hljs: hljs.default,
  }).use(createKatexPlugin()).use(createLineNumbertPlugin());

  return { VMdEditor, VMdPreview };
};

// 懒加载Vue Cookies
const loadVueCookies = async () => {
  const VueCookies = await import('vue3-cookies');
  return VueCookies.default;
};

// 懒加载Element Plus图标
const loadElementPlusIcons = async () => {
  const ElementPlusIconsVue = await import('@element-plus/icons-vue');
  return ElementPlusIconsVue;
};

const app = createApp(App)
app.use(router)

// 异步加载插件
Promise.all([
  loadMarkdownEditor(),
  loadVueCookies(),
  loadElementPlusIcons()
]).then(([markdownEditor, VueCookies, ElementPlusIconsVue]) => {
  app.use(markdownEditor.VMdEditor)
  app.use(markdownEditor.VMdPreview)
  app.use(VueCookies)
  
  // 注册Element Plus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  app.mount('#app')
}).catch(error => {
  console.error('Failed to load plugins:', error);
  app.mount('#app')
});
