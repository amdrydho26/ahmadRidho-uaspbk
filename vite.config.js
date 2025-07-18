import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), Icons()],
  test: {
    environment: 'jsdom'
  }
})
