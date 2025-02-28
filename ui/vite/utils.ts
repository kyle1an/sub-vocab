import type { ManualChunksOption } from 'rollup'
import type { PluginOption } from 'vite'

function removeScriptTagAttributes(scriptContent: string) {
  scriptContent = scriptContent.replace(/(<script[^>]*?)\srel="modulepreload"([^>]*>)/g, '$1$2')
  scriptContent = scriptContent.replace(/(<script[^>]*?)\scrossorigin([^>]*>)/g, '$1$2')
  return scriptContent
}

function replaceLinkTagWithScript(html: string, targetFilename: string, scriptCode: string) {
  const linkTagRegex = new RegExp(`<link([^>]*?) href="[./]*${targetFilename}"([^>]*?)>`)
  return html.replace(linkTagRegex, (_, beforeSrc, afterSrc) => {
    return removeScriptTagAttributes(`<script${beforeSrc}${afterSrc}>${scriptCode.trim()}</script>`)
  })
}

export const htmlInlineTransform = (): PluginOption => {
  return {
    name: 'html-inline-transform',
    // https://github.com/vitejs/vite/issues/621#issuecomment-756890673
    transformIndexHtml(html, { bundle }) {
      if (bundle) {
        Object.entries(bundle).forEach(([fileName, output]) => {
          if (/\/worker.*\.js$/.test(fileName)) {
            if ('code' in output) {
              html = replaceLinkTagWithScript(html, output.fileName, output.code)
              delete bundle[output.fileName]
            }
          }
        })
      }
      return html
    },
    generateBundle(options, bundle) {
      Object.values(bundle).forEach((chunk) => {
        if ('preliminaryFileName' in chunk) {
          if (
            chunk.preliminaryFileName.endsWith('.js')
            && chunk.type === 'chunk'
          ) {
            chunk.code = chunk.code.replace(
              /import\s*["']\.\/worker-[^"']+["'];?/,
              '')
          }
        }
      })
    },
  }
}

export const getManualChunk: ManualChunksOption = (id) => {
  if (id.includes('/lib/worker'))
    return 'worker'

  if (id.includes('pdfjs-dist')) {
    if (id.includes('pdf.worker'))
      return 'pdfjs-dist.worker'

    return 'pdfjs-dist'
  }

  if (id.includes('@sentry'))
    return 'sentry'

  if (id.includes('.pnpm/chart.js@'))
    return 'chart.js'

  if (id.includes('commonjsHelpers.js'))
    return 'commonjsHelpers'

  if (
    [
      '.pnpm/react@',
      '.pnpm/react-dom@',
      '.pnpm/scheduler',
      '.pnpm/react-router@',
    ].some((s) => id.includes(s))
  )
    return 'react'

  if (
    [
      'i18next',
      'tailwind-merge',
      'date-fns',
      'zod',
      '@tanstack/table-core',
      '@tanstack/query-core',
      'ua-parser-js',
      'immer',
      'lodash-es',
      'tailwindcss',
    ]
      .map((s) => `.pnpm/${s.replace(/\//g, '+')}@`)
      .some((s) => id.includes(s))
  )
    return 'self'

  if (
    [
      '.pnpm/@radix-ui+',
      '.pnpm/@supabase+',
      ...[
        'jotai',
        'jotai-effect',
        'react-hook-form',
        'react-resizable-panels',
        'react-aria-components',
        'jotai-tanstack-query',
        'sonner',
        'vaul',
      ]
        .map((s) => `.pnpm/${s.replace(/\//g, '+')}@`),
    ]
      .some((s) => id.includes(s))
  )
    return 'dep'
}
