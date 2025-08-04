import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import { createHtmlPlugin } from 'vite-plugin-html'
import Inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

import { chunks } from './vite/utils'

const ReactCompilerConfig = {
}
// https://github.com/facebook/react/issues/29078#issuecomment-2828508350

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
      tsconfigPaths(),
    ],
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
