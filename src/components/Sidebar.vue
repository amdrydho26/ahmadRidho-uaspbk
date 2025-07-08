<template>
  <div class="sidebar-root" :class="{ 'sidebar-animate': animated }">
    <div class="sidebar-logo"><span class="icon-logo"><img :src="logo" alt="Logo" class="sidebar-logo-img" /></span>AturKuy</div>
    <div class="sidebar-search">
      <input type="text" placeholder="Search" v-model="search" />
    </div>
    <nav class="sidebar-menu">
      <ul>
        <li v-for="item in filteredMenu" :key="item.to">
          <router-link :to="item.to" class="sidebar-link" :class="{ active: route.path === item.to }">
            <span class="icon" :class="{
              'icon-dashboard': item.to === '/',
              'icon-tambah-pemasukan': item.to === '/tambah-pemasukan',
              'icon-tambah-pengeluaran': item.to === '/tambah-pengeluaran',
              'icon-grafik': item.to === '/grafik'
            }"><component :is="item.icon" /></span>{{ item.label }}
          </router-link>
        </li>
        <li v-if="filteredMenu.length === 0" class="sidebar-menu-empty">Menu tidak tersedia</li>
      </ul>
    </nav>
    <div class="sidebar-bottom">
      <div class="sidebar-bottom-separator"></div>
      <button class="logout-btn" @click="handleLogout">
        <span class="icon icon-logout"><IconLogout /></span>Logout
      </button>
    </div>
  </div>
  <div v-if="showLogoutModal" class="modal-overlay">
    <transition name="modal-slide-up">
      <div v-if="showLogoutModal" class="modal-content modal-slide-up">
        <h2 style="text-align:left;">Konfirmasi Logout</h2>
        <div style="margin-bottom:1rem;text-align:left;">Apakah Anda yakin ingin logout?</div>
        <div class="modal-actions">
          <button @click="cancelLogout" class="btn-cancel">Batal</button>
          <button @click="confirmLogout" class="btn-save">Logout</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import IconHome from '~icons/mdi/home';
import IconPlus from '~icons/mdi/plus';
import IconMinus from '~icons/mdi/minus';
import IconChartLine from '~icons/mdi/chart-line';
import IconCash from '~icons/mdi/cash';
import IconLogout from '~icons/mdi/logout';
import logo from '../assets/logo.png';
import IconAlert from '~icons/mdi/alert';

const route = useRoute();
const search = ref('');
const menuItems = [
  { label: 'Dashboard', icon: IconHome, to: '/' },
  { label: 'Tambah Pemasukan', icon: IconPlus, to: '/tambah-pemasukan' },
  { label: 'Tambah Pengeluaran', icon: IconMinus, to: '/tambah-pengeluaran' },
  { label: 'Grafik Keuangan', icon: IconChartLine, to: '/grafik' },
];
const filteredMenu = computed(() => {
  if (!search.value) return menuItems;
  return menuItems.filter(item => item.label.toLowerCase().includes(search.value.toLowerCase()));
});
const router = useRouter();
const showLogoutModal = ref(false);
const props = defineProps({ animated: Boolean });

function handleLogout() {
  showLogoutModal.value = true;
}
function confirmLogout() {
  localStorage.removeItem('isLoggedIn');
  router.push('/login');
}
function cancelLogout() {
  showLogoutModal.value = false;
}
</script>

<style scoped>
.sidebar-root {
  width: 280px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #d2d2d2;
  padding: 2rem 1.2rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: calc(100vh - 5rem);
  margin: 2.5rem 0 2.5rem 2.5rem;
  box-sizing: border-box;
}
.sidebar-root.sidebar-animate {
  animation: sidebarSlideFade 0.6s cubic-bezier(.4,1,.7,1);
}
@keyframes sidebarSlideFade {
  0% {
    opacity: 0;
    transform: translateX(-48px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
.sidebar-logo {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
  letter-spacing: 0;
  text-align: left;
  font-family: inherit;
  display: flex;
  align-items: center;
}
.sidebar-user-card {
  display: flex;
  align-items: center;
  background: #f6f6f6;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e9ecef;
}
.sidebar-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.sidebar-user-dropdown {
  font-size: 1rem;
}
.sidebar-search {
  margin-bottom: 0.5rem;
}
.sidebar-search input {
  width: 100%;
  max-width: 210px;
  margin: 0 auto;
  display: block;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  background: #f6f6f6;
  font-size: 1rem;
  outline: none;
}
.sidebar-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar-menu li {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.08rem;
  font-weight: 500;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.sidebar-menu li:hover {
  background: #f6f6f6;
}
.sidebar-section {
  margin-top: 1.2rem;
}
.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.sidebar-materials {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.sidebar-materials li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.sidebar-materials li:hover {
  background: #f6f6f6;
}
.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.sidebar-help, .sidebar-logout {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.05rem;
  padding: 0.6rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.sidebar-help:hover, .sidebar-logout:hover {
  background: #f6f6f6;
}
.icon, .icon-logo {
  color: #007AFF !important;
}
.icon {
  font-size: 1.2em;
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.2rem;
}
.icon-logo {
  display: inline-flex;
  align-items: center;
  margin-right: 0.5rem;
  height: 1em;
  font-size: 1em;
  vertical-align: middle;
}
.icon-dashboard {
  color: #007AFF !important;
}
.icon-tambah-pemasukan {
  color: #34C759 !important;
}
.icon-tambah-pengeluaran {
  color: #FF3B30 !important;
}
.icon-grafik {
  color: #FF9500 !important;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: inherit;
  text-decoration: none;
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1.08rem;
  transition: background 0.15s, color 0.15s;
}
.sidebar-link.active {
  background: transparent;
  outline: 2px solid #f6f6f6;
}
.sidebar-menu li {
  padding: 0;
}
.logout-btn {
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.7rem;
  border-radius: 6px;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
}
.logout-btn:hover {
  background: #f6f6f6;
}
.sidebar-bottom-separator {
  border-top: 1px solid #e9ecef;
  margin: 0;
}
.sidebar-menu-empty {
  text-align: center;
  color: #bbb;
  font-size: 1rem;
  padding: 1.2rem 0;
  user-select: none;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.icon-logo-black {
  color: #080808 !important;
}
.icon-logout {
  color: #5856D6 !important;
}
.sidebar-logo-img {
  height: 3.5rem;
  width: auto;
  display: inline-block;
  vertical-align: bottom;
  margin-right: 0.3rem;
  margin-left: 0.5rem;
  margin-bottom: 0.5rem;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  min-width: 420px;
  max-width: 600px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  position: relative;
}
.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.2rem;
  font-size: 1.3rem;
  font-weight: 600;
}
.modal-slide-up {
  animation: fadeSlideUpModal 0.22s cubic-bezier(.4,1,.7,1) both;
}
@keyframes fadeSlideUpModal {
  0% {
    opacity: 0;
    transform: translateY(32px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.btn-cancel {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #ccc;
}
.btn-save {
  background: #007AFF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-save:hover {
  background: #0051a8;
}
</style> 