import type { OutputOptions } from 'rolldown'

// https://stackoverflow.com/a/3561711
function escapeRegex(string: string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
}

export const chunks = { groups: [
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
} satisfies OutputOptions['advancedChunks']
