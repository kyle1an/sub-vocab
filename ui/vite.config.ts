import react from '@vitejs/plugin-react'
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'
import process from 'node:process'
import { resolve } from 'pathe'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv } from 'vite'
import { checker } from 'vite-plugin-checker'
import { createHtmlPlugin } from 'vite-plugin-html'

import { htmlInlineTransform, manualChunks } from './vite/utils'

const ReactCompilerConfig = {
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      AutoImport({
        resolvers: [
          IconsResolver({
            prefix: 'Icon',
            extension: 'jsx',
          }),
        ],
        imports: [
          'react',
          'react-router-dom',
          'date-fns',
          'jotai',
          'jotai/utils',
          {
            imports: ['HTMLAttributes', 'Ref', 'RefAttributes', ['default', 'React']],
            from: 'react',
            type: true,
          },
          {
            react: ['Component', 'Fragment', 'createContext', 'use'],
            immer: ['produce'],
            'react-i18next': ['useTranslation'],
          },
          {
            '@/lib/utils': ['cn'],
          },
        ],
        dirs: [
          './src/components/ui',
        ],
      }),
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        autoInstall: true,
        scale: 1,
      }),
      react({
        babel: {
          plugins: [
            jotaiDebugLabel,
            jotaiReactRefresh,
            ['babel-plugin-react-compiler', ReactCompilerConfig],
          ],
          presets: ['jotai/babel/preset'],
        },
      }),
      createHtmlPlugin({
        minify: true,
      }),
      visualizer(),
      checker({
        typescript: true,
      }),
      htmlInlineTransform(),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@/': `${resolve(__dirname, 'src')}/`,
      },
    },
    define: {},
    server: {
      host: true,
      strictPort: true,
      proxy: {
        '/trpc': {
          target: env.VITE_SUB_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // https://github.com/mozilla/pdf.js/issues/17245
        target: 'esnext',
      },
    },
  }
})
