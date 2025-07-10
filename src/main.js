import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 按需导入Element Plus样式
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/message/style/css';

// 懒加载Vue Cookies
const loadVueCookies = async () => {
  const VueCookies = await import('vue3-cookies');
  return VueCookies.default;
};

const app = createApp(App)
app.use(router)

// 异步加载插件
Promise.all([
  loadVueCookies()
]).then(([VueCookies]) => {
  app.use(VueCookies)
  app.mount('#app')
}).catch(error => {
  console.error('Failed to load plugins:', error);
  app.mount('#app')
});
