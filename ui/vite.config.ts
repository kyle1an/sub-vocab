import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    plugins: [
      vue({
        reactivityTransform: false
      }),
      vueJsx({}),
      visualizer(),
    ],
    define: {
      __VUE_OPTIONS_API__: false,
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_SUB_PROD,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
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
}
