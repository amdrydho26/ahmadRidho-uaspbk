import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../components/Dashboard.vue'
import TambahPemasukan from '../components/TambahPemasukan.vue'
import TambahPengeluaran from '../components/TambahPengeluaran.vue'
import GrafikKeuangan from '../components/GrafikKeuangan.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/tambah-pemasukan', component: TambahPemasukan },
  { path: '/tambah-pengeluaran', component: TambahPengeluaran },
  { path: '/grafik', component: GrafikKeuangan },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router 