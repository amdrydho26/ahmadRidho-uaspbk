<template>
  <div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content logo-anim-wrapper loading-row">
        <div class="loading-logo-text-wrapper">
          <div class="loading-logo-wrapper">
            <img :src="logo" alt="Logo" class="loading-logo" />
          </div>
          <span class="loading-title">AturKuy</span>
          <div class="logo-shine"></div>
          <div class="logo-shine logo-shine-delay1"></div>
          <div class="logo-shine logo-shine-delay2"></div>
        </div>
      </div>
    </div>
    <div v-else class="login-center">
      <div class="login-card">
        <img :src="logo" alt="Logo" class="login-logo" />
        <h2>Login ke AturKuy</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required placeholder="Masukkan email" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required placeholder="Masukkan password" />
          </div>
          <button type="submit" :disabled="!email || !password">Login</button>
          <div v-if="error" class="error-msg">{{ error }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/logo.png'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi.'
    return
  }
  error.value = ''
  localStorage.setItem('isLoggedIn', 'true')
  loading.value = true
  setTimeout(() => {
    router.push('/')
  }, 1500)
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-content.logo-anim-wrapper.loading-row {
  flex-direction: row;
  gap: 0;
}
.loading-content.logo-anim-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.loading-logo-text-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 320px;
  padding: 0 10px;
}
.loading-logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 0;
  display: block;
  position: relative;
  z-index: 1;
}
.logo-shine {
  position: absolute;
  top: 0;
  left: 0;
  height: 80px;
  width: 100%;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 35%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.45) 65%, rgba(255,255,255,0) 100%);
  transform: translateX(-60%);
  animation: shine-logo-move 2.1s cubic-bezier(.45,0,.15,1) infinite;
  filter: blur(0.5px);
}
.logo-shine-delay1 {
  animation-delay: 0.7s;
}
.logo-shine-delay2 {
  animation-delay: 1.4s;
}
.loading-title {
  font-size: 2.3rem;
  font-weight: 700;
  color: #222;
  display: flex;
  align-items: center;
  letter-spacing: 0.01em;
  font-family: inherit;
  margin-left: 2.2rem;
}
@keyframes shine-logo-move {
  0% { transform: translateX(-60%); }
  60% { transform: translateX(60%); }
  100% { transform: translateX(120%); }
}
.login-center {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.login-card {
  background: #fff;
  padding: 2.5rem 3rem 2rem 3rem;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 300px;
  text-align: center;
}
.login-logo {
  width: 64px;
  height: 64px;
}
h2 {
  margin-bottom: 1.5rem;
  color: #222;
}
.form-group {
  margin-bottom: 1.2rem;
  text-align: left;
}
label {
  display: block;
  margin-bottom: 0.3rem;
  color: #080808;
  font-weight: 500;
}
input[type="email"], input[type="password"] {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.6rem;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  box-sizing: border-box;
}
input:focus {
  border-color: #007AFF;
}
button[type="submit"] {
  width: 100%;
  padding: 0.7rem;
  background: #007AFF;
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
button:disabled {
  background: #b0cfff;
  cursor: not-allowed;
}
.error-msg {
  color: #FF3B30;
  margin-top: 1rem;
  font-size: 0.98rem;
}
</style> 