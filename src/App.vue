<template>
  <div class="app-container">
    <Sidebar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
// Kosong
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
  padding: 0;
  gap: 2rem;
  overflow: hidden;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2.5rem 2.5rem 0;
  margin: 0 0 0 0;
  height: calc(100vh - 3rem);
}
</style>
