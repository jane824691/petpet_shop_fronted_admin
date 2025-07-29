import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Members from '../views/Members.vue'
import Products from '../views/Products.vue'

const routes = [
  {
      path: '/',
      redirect: '/login'
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

export default router