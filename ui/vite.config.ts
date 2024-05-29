import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { checker } from 'vite-plugin-checker'

export function replaceLink(html: string, scriptFilename: string, scriptCode: string): string {
  const reStyle = new RegExp(`<link([^>]*?) href="[./]*${scriptFilename}"([^>]*?)>`)
  const legacyCharSetDeclaration = /@charset "UTF-8";/
  const inlined = html.replace(reStyle, (_, beforeSrc, afterSrc) => `<script${beforeSrc}${afterSrc}>${scriptCode.replace(legacyCharSetDeclaration, '')}</script>`)
  return inlined
}

const ReactCompilerConfig = {
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ['babel-plugin-react-compiler', ReactCompilerConfig],
          ],
        },
      }),
      visualizer(),
      checker({
        typescript: true,
      }),
      {
        name: 'html-inline-transform',
        // https://github.com/vitejs/vite/issues/621#issuecomment-756890673
        transformIndexHtml(html, ctx) {
          const { bundle } = ctx
          if (bundle) {
            const workerFileName = Object.keys(bundle).find((i) => {
              return /worker.+js$/.test(i)
            })
            if (workerFileName) {
              const jsChunk = bundle[workerFileName]
              if (jsChunk) {
                if ('code' in jsChunk) {
                  html = replaceLink(html, jsChunk.fileName, jsChunk.code)
                  // delete bundle[jsChunk.fileName]
                }
              }
            }
          }
          return html
        },
      },
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
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/lib/worker')) {
              return 'worker'
            }
            if (id.includes('pdfjs-dist')) {
              if (id.includes('pdf.worker')) {
                return 'pdfjs-dist_pdf.worker'
              } else {
                return 'pdfjs-dist_pdf'
              }
            }
            if (id.includes('_react@') || id.includes('_react-dom@')) {
              return 'react'
            }
            if (id.includes('sentry')) {
              return 'sentry'
            }
            if (id.includes('chart.js')) {
              return 'chart.js'
            }
            if (id.includes('tanstack')) {
              return 'tanstack'
            }
          },
        },
      },
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
  }
})
