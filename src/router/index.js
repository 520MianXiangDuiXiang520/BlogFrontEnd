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
    }
  ]
})

export default router
