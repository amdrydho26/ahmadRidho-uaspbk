<template>
  <div :class="['app-container', { 'login-bg': route.path === '/login' }]">
    <Sidebar v-if="showSidebar" :animated="sidebarAnimated" />
    <main :class="['content', { 'login-content': route.path === '/login' }]">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'

const route = useRoute()
const showSidebar = computed(() => route.path !== '/login')
const sidebarAnimated = ref(false)

// Trigger animasi hanya saat pertama kali masuk ke Dashboard setelah login
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath === '/login' && newPath === '/') {
      sidebarAnimated.value = true
      setTimeout(() => { sidebarAnimated.value = false }, 600)
    }
  },
  { immediate: true }
)
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f6f6f6;
  width: 100vw;
  min-width: 100vw;
  min-height: 100vh;
  margin: 0;
  margin-top: 0;
  padding: 0;
  gap: 2rem;
  overflow: hidden;
}
.app-container.login-bg {
  background: #fff !important;
  gap: 0;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2.5rem 2.5rem 0;
  margin: 0 0 0 0;
  height: calc(100vh - 3rem);
}
.content.login-content {
  padding: 0 !important;
  margin: 0 !important;
  height: 100vh !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff !important;
}
.sidebar-slide-fade-enter-active {
  transition: opacity 0.6s cubic-bezier(.4,1,.7,1), transform 0.6s cubic-bezier(.4,1,.7,1);
}
.sidebar-slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-48px);
}
.sidebar-slide-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.sidebar-animate {
  /* Optional: force reflow for key change */
}
</style>
