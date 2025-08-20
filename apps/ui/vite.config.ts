import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import { createHtmlPlugin } from 'vite-plugin-html'
import Inspect from 'vite-plugin-inspect'

import { chunks } from './vite/utils'

const ReactCompilerConfig = {
}
// https://github.com/facebook/react/issues/29078#issuecomment-2828508350
/*
npx react-compiler-healthcheck --verbose
*/

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      Inspect(),
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        autoInstall: true,
        scale: 1,
        customCollections: {
          global: FileSystemIconLoader('./../../public'),
        },
      }),
      babel({
        filter: /\.[jt]sx?$/,
        babelConfig: {
          plugins: [
            ['babel-plugin-react-compiler', ReactCompilerConfig],
          ],
          presets: [
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript',
            ...mode === 'development' ? ['jotai/babel/preset'] : [],
          ],
          compact: true,
          sourceMaps: true,
        },
      }),
      react(),
      ...mode !== 'test' ? [
        createHtmlPlugin({
          minify: true,
        }),
      ] : [
      ],
      ...mode === 'production' ? [
        visualizer({
          gzipSize: true,
        }),
      ] : [
      ],
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src/'),
        '@ui': resolve(__dirname, '../ui'),
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
  }
})
