import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Members from '../views/Members.vue'
import Products from '../views/Products.vue'
import { useUserStore } from '../stores/user'
import { pinia } from '../pinia'
import { checkAuth } from '../api/memberApi'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
  {
    path: '/members',
    name: 'Members',
    component: Members
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

let authChecked = false

router.beforeEach(async (to) => {
  if (to.path === '/login') return true

  const userStore = useUserStore(pinia)
  if (userStore.isLoggedIn) return true

  if (!authChecked) {
    authChecked = true
    const ok = await checkAuth()
    if (ok) userStore.login('')
  }

  if (!userStore.isLoggedIn) return { path: '/login' }
  return true
})

export default router