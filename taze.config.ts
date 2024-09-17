import { defineConfig } from 'taze'

export default defineConfig({
  write: true,
  ignorePaths: [
    '**/node_modules/**',
    '**/test/**',
  ],
  packageMode: {
    react: 'next',
    'react-dom': 'next',
  },
})
