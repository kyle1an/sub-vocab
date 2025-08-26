import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import devtoolsJson from 'vite-plugin-devtools-json'
import Inspect from 'vite-plugin-inspect'

const ReactCompilerConfig = {
}
// https://github.com/facebook/react/issues/29078#issuecomment-2828508350
/*
npx react-compiler-healthcheck --verbose
*/

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      // https://github.com/remix-run/react-router/issues/13516#issuecomment-2866533925
      devtoolsJson(),
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
      tailwindcss(),
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
      reactRouter(),
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
        },
      },
    },
    optimizeDeps: {
    },
  }
})
