import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    __VUE_OPTIONS_API__: false,
  },
  build: {
    target: 'esnext'
  }
})
