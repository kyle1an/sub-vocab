import type { UserConfig } from 'vite'

import react from '@vitejs/plugin-react'
import process from 'node:process'
import { resolve } from 'pathe'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv } from 'vite'
import { checker } from 'vite-plugin-checker'
import { createHtmlPlugin } from 'vite-plugin-html'
import Inspect from 'vite-plugin-inspect'

import { getManualChunk, htmlInlineTransform } from './vite/utils'

const ReactCompilerConfig = {
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

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
        visualizer(),
        htmlInlineTransform(),
      ] : [],
      checker({
      }),
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
          manualChunks: getManualChunk,
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // https://github.com/mozilla/pdf.js/issues/17245
        target: 'esnext',
      },
    },
  } satisfies UserConfig
})
