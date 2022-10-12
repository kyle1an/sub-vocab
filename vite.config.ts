import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue({
      reactivityTransform: true
    }),
    vueJsx({}),
    visualizer(),
  ],
  define: {
    __VUE_OPTIONS_API__: false,
  },
  build: {
    target: 'esnext'
  },
  resolve: {
    alias: [
      {
        find: 'vue-i18n',
        replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ]
  }
})
