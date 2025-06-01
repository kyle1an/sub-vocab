import type { OutputOptions } from 'rolldown'
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
              '',
            )
          }
        }
      })
    },
  }
}

// https://stackoverflow.com/a/3561711
function escapeRegex(string: string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
}

export const chunks: OutputOptions['advancedChunks'] = { groups: [
  {
    test: 'pdf.worker',
    name: 'pdf.worker',
  },
  {
    test: 'pdf.mjs',
    name: 'pdf.mjs',
  },
  {
    test: '@sentry',
    name: 'sentry',
  },
  {
    test: new RegExp([
      '.pnpm/react@',
      '.pnpm/react-dom@',
    ]
      .map(escapeRegex).join('|'),
    ),
    name: 'react',
  },
],
}
