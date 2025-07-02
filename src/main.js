import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useTransaksiStore } from './store'

const app = createApp(App)
app.use(router)
app.use(createPinia())

const store = useTransaksiStore()
store.fetchTransaksi()

app.mount('#app')
