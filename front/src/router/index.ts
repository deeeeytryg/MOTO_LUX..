import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Hash history (#/admin): GitHub Pages no soporta rutas del lado del servidor.
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
