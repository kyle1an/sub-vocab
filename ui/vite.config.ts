import type { UserConfig } from 'vite'

import react from '@vitejs/plugin-react'
import { resolve } from 'pathe'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import Inspect from 'vite-plugin-inspect'

import { chunks } from './vite/utils'

const ReactCompilerConfig = {
}

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      Inspect(),
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        autoInstall: true,
        scale: 1,
      }),
      react({
        babel: {
          plugins: [
            ['babel-plugin-react-compiler', ReactCompilerConfig],
          ],
          presets: ['jotai/babel/preset'],
        },
      }),
      createHtmlPlugin({
        minify: true,
      }),
      ...mode === 'production' ? [
        visualizer({
          gzipSize: true,
        }),
      ] : [],
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@/': `${resolve(__dirname, 'src')}/`,
      },
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          advancedChunks: chunks,
        },
      },
    },
    optimizeDeps: {
    },
  } satisfies UserConfig
})
