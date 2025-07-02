import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../components/Dashboard.vue'
import TambahPemasukan from '../components/TambahPemasukan.vue'
import TambahPengeluaran from '../components/TambahPengeluaran.vue'
import GrafikKeuangan from '../components/GrafikKeuangan.vue'
import Login from '../components/Login.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/tambah-pemasukan', component: TambahPemasukan },
  { path: '/tambah-pengeluaran', component: TambahPengeluaran },
  { path: '/grafik', component: GrafikKeuangan },
  { path: '/login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (to.path !== '/login' && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router 