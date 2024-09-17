import type { ManualChunksOption } from 'rollup'
import type { IndexHtmlTransform, PluginOption } from 'vite'

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

const transformIndexHtml: IndexHtmlTransform = (html, { bundle }) => {
  if (bundle) {
    Object.entries(bundle).forEach(([fileName, output]) => {
      if (/\/worker.*\.js$/.test(fileName)) {
        if ('code' in output) {
          html = replaceLinkTagWithScript(html, output.fileName, output.code)
          // delete bundle[output.fileName]
        }
      }
    })
  }
  return html
}

export const htmlInlineTransform = (): PluginOption => {
  return {
    name: 'html-inline-transform',
    // https://github.com/vitejs/vite/issues/621#issuecomment-756890673
    transformIndexHtml,
  }
}

export const manualChunks: ManualChunksOption = (id) => {
  if (id.includes('/lib/worker')) {
    return 'worker'
  }

  if (id.includes('pdfjs-dist')) {
    if (id.includes('pdf.worker')) {
      return 'pdfjs-dist.worker'
    }

    return 'pdfjs-dist'
  }

  if (id.includes('sentry')) {
    return 'sentry'
  }

  if (id.includes('chart.js')) {
    return 'chart.js'
  }

  if (
    id.includes('commonjsHelpers.js')
    || id.includes('/react@')
    || id.includes('/react-dom@')
  ) {
    return 'vendors-react'
  }

  if (
    id.includes('radix-ui')
    || id.includes('sonner')
    || id.includes('tailwind')
    || id.includes('vaul')
    || id.includes('/date-fns')
    || id.includes('/lodash')
    || id.includes('iconify')
  ) {
    return 'vendors-chunk_1'
  }

  if (
    id.includes('tanstack')
    || id.includes('remix-run')
    || id.includes('react-router')
    || id.includes('i18next')
  ) {
    return 'vendors-chunk_2'
  }

  if (id.includes('react')) {
    return 'vendors-react-chunk'
  }

  if (id.includes('node_modules')) {
    return 'vendors-node_modules'
  }
}
