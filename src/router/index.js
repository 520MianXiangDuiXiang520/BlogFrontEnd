import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: () => import('../views/DetailView.vue')
    },
    {
      path: '/editor/:id',
      name: 'editor',
      component: () => import('../views/EditorView.vue')
    },
    {
      path: '/tag',
      name: 'tag',
      component: () => import('../views/TagView.vue')
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('../views/ToolsView.vue')
    },
    {
      path: '/date_tool',
      name: 'date_tool',
      component: () => import('../components/ToolDate.vue')
    },
    {
      path: '/hex_tool',
      name: 'hex_tool',
      component: () => import('../components/ToolHex.vue')
    },
    {
      path: '/base64_tool',
      name: 'base64_tool',
      component: () => import('../components/ToolBase64.vue')
    },
    {
      path: '/hash_tool',
      name: 'hash_tool',
      component: () => import('../components/ToolHash.vue')
    },
    {
      path: '/string_tool',
      name: 'string_tool',
      component: () => import('../components/ToolString.vue')
    }
  ]
})

export default router
