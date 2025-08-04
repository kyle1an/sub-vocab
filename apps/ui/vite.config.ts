import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
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
      react({
        babel: {
          plugins: [
            ['babel-plugin-react-compiler', ReactCompilerConfig],
          ],
          presets: ['jotai/babel/preset'],
        },
      }),
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
    resolve: {
      dedupe: ['react', 'react-dom'],
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
