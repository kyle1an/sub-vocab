import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { checker } from 'vite-plugin-checker'

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [
      react(),
      visualizer(),
      checker({
        typescript: true,
      }),
    ],
    define: {},
    server: {
      host: true,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_SUB_PROD,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
        '/socket.io': {
          target: env.VITE_SUB_PROD,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      esbuildOptions: {
        // https://github.com/mozilla/pdf.js/issues/17245
        target: 'esnext',
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  })
}
